"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useEscapeKey } from "@/hooks/web3/useEscapeKey";
import { BaseModalProps, MODAL_IDS, ModalId, ModalProps } from "@/types/modal";

interface ModalState {
  isOpen: boolean;
  props: ModalProps;
  timestamp?: number; // To track order of opening
}

export type ModalProp<T extends ModalProps> = T & {
  isOpen: boolean;
};

interface ModalContextType {
  openModal: <T extends ModalProps>(
    modalId: ModalId,
    props?: Omit<T, keyof BaseModalProps>,
    closeAll?: boolean,
  ) => void;
  closeModal: (modalId: ModalId) => void;
  closeAllModals: () => void;
  isModalOpen: (modalId: ModalId) => boolean;
  getModalProps: (modalId: ModalId) => ModalProps | undefined;
  getModalZIndex: (modalId: ModalId) => number;
}

const ModalContext = createContext<ModalContextType>({
  openModal: () => {},
  closeModal: () => {},
  closeAllModals: () => {},
  isModalOpen: () => false,
  getModalProps: () => undefined,
  getModalZIndex: () => 50,
});

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const initialModalStates: Record<ModalId, ModalState> = Object.keys(MODAL_IDS).reduce(
    (acc, key) => {
      acc[key as ModalId] = { isOpen: false, props: { onClose: () => {} } };
      return acc;
    },
    {} as Record<ModalId, ModalState>,
  );

  const [modalStates, setModalStates] = useState<Record<ModalId, ModalState>>(initialModalStates);
  const pathname = usePathname();

  useEffect(() => {
    closeAllModals();
  }, [pathname]);

  // Find the latest opened modal (the one with the highest timestamp)
  const getLatestOpenModal = useCallback(() => {
    let latestModalId: ModalId | null = null;
    let latestTimestamp = 0;

    Object.entries(modalStates).forEach(([id, state]) => {
      if (state.isOpen && state.timestamp && state.timestamp > latestTimestamp) {
        latestTimestamp = state.timestamp;
        latestModalId = id as ModalId;
      }
    });

    return latestModalId;
  }, [modalStates]);

  // Handle ESC key to close only the latest modal
  const handleEscape = useCallback(() => {
    const latestModalId = getLatestOpenModal();
    if (latestModalId) {
      closeModal(latestModalId);
    }
  }, [getLatestOpenModal]);

  // Use the escape key handler only if any modal is open
  const anyModalOpen = useMemo(() => {
    return Object.values(modalStates).some(state => state.isOpen);
  }, [modalStates]);

  useEscapeKey(handleEscape, anyModalOpen);

  const closeModal = useCallback((modalId: ModalId) => {
    setModalStates(prev => {
      const newState = {
        ...prev,
        [modalId]: { ...prev[modalId], isOpen: false },
      };
      return newState;
    });
  }, []);

  const openModal = useCallback(
    <T extends ModalProps>(modalId: ModalId, props: Omit<T, keyof BaseModalProps> = {} as any, closeAll?: boolean) => {
      if (closeAll) {
        closeAllModals();
      }

      setModalStates(prev => {
        const newState = {
          ...prev,
          [modalId]: {
            isOpen: true,
            props: {
              ...props,
              onClose: () => closeModal(modalId),
            },
            timestamp: Date.now(), // Add timestamp when opening
          },
        };
        return newState;
      });
    },
    [closeModal],
  );

  const closeAllModals = useCallback(() => {
    setModalStates(prev => {
      const newState = Object.keys(prev).reduce(
        (acc, key) => ({
          ...acc,
          [key]: { ...prev[key as ModalId], isOpen: false },
        }),
        {} as Record<ModalId, ModalState>,
      );

      return newState;
    });
  }, []);

  const isModalOpen = useCallback(
    (modalId: ModalId) => {
      return modalStates[modalId]?.isOpen || false;
    },
    [modalStates],
  );

  const getModalProps = useCallback(
    (modalId: ModalId) => {
      return modalStates[modalId]?.props;
    },
    [modalStates],
  );

  const getModalZIndex = useCallback(
    (modalId: ModalId) => {
      const modalState = modalStates[modalId];
      if (!modalState?.isOpen || !modalState.timestamp) {
        return 50; // Default z-index if modal not found or not open
      }

      // Get all open modals sorted by timestamp (earliest first)
      const openModals = Object.entries(modalStates)
        .filter(([, state]) => state.isOpen && state.timestamp)
        .sort(([, stateA], [, stateB]) => stateA.timestamp! - stateB.timestamp!)
        .map(([id, state]) => ({ id, timestamp: state.timestamp! }));

      // Find the position of this modal in the opening order
      const position = openModals.findIndex(modal => modal.timestamp === modalState.timestamp);

      // Base z-index of 50, each subsequent modal gets +10
      return 50 + position * 10;
    },
    [modalStates],
  );

  const value = useMemo(
    () => ({
      openModal,
      closeModal,
      closeAllModals,
      isModalOpen,
      getModalProps,
      getModalZIndex,
    }),
    [openModal, closeModal, closeAllModals, isModalOpen, getModalProps, getModalZIndex],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

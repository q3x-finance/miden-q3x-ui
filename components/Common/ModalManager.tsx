"use client";

import { useModal } from "@/contexts/ModalManagerProvider";
import { ModalId, modalRegistry } from "@/types/modal";

export const ModalManager = () => {
  const { isModalOpen, closeModal, getModalProps, getModalZIndex } = useModal();

  return (
    <>
      {Object.entries(modalRegistry).map(([id, Component]) => {
        const modalId = id as ModalId;
        const isOpen = isModalOpen(modalId);
        const modalProps = getModalProps(modalId) || {};
        const zIndex = getModalZIndex(modalId);

        // Create a component that knows how to handle its own props
        const ModalComponent = Component as any;

        return (
          <ModalComponent
            key={id}
            isOpen={isOpen}
            onClose={() => closeModal(modalId)}
            zIndex={zIndex}
            {...modalProps}
          />
        );
      })}
    </>
  );
};

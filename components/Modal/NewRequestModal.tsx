"use client";
import React, { useState } from "react";
import { MODAL_IDS, SelectTokenModalProps } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import { ModalHeader } from "../Common/ModalHeader";
import { AmountInput } from "../Send/AmountInput";
import { RecipientInput } from "../Send/RecipientInput";
import { ActionButton } from "../Common/ActionButton";
import BaseModal from "./BaseModal";

export function NewRequestModal({ isOpen, onClose }: ModalProp<SelectTokenModalProps>) {
  const [amount, setAmount] = useState("0.00");
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [message, setMessage] = useState("");
  const { openModal } = useModal();

  const handleAmountChange = (amount: string) => {
    setAmount(amount);
  };

  const handleChooseRecipient = () => {
    openModal(MODAL_IDS.SELECT_RECIPIENT);
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Create New Request" icon="/modal/coin-icon.gif">
      <div className="flex flex-col gap-0">
        <div className="flex flex-col rounded-b-2xl border border-solid bg-[#1E1E1E] border-zinc-800 max-h-[800px] overflow-y-auto w-[500px] p-2">
          {/* Amount */}
          <div
            className="flex flex-col text-white rounded-xl justify-center items-center h-[200px]"
            style={{
              backgroundImage: "url('/modal/request-background.svg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <header className="flex flex-wrap  justify-between self-stretch px-3 py-2 w-full bg-[#2D2D2D] flex-1 rounded-t-xl">
              <h2 className="text-white mt-0.5">Requesting</h2>
              <div className="flex gap-2 items-center text-sm font-medium leading-none">
                <div className="flex gap-5 justify-between py-0.5 pr-0.5 pl-2 rounded-[10px] bg-neutral-900">
                  <input
                    type="text"
                    readOnly
                    value={amount}
                    onChange={e => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-white outline-none w-20"
                  />
                  <button className="flex flex-col justify-center py-1 px-2 rounded-[10px] bg-zinc-800 hover:bg-zinc-700 transition-colors outline-none">
                    <div
                      className="flex gap-1 items-center cursor-pointer"
                      onClick={() => {
                        openModal(MODAL_IDS.SELECT_TOKEN);
                      }}
                    >
                      <img src="/token/usdt.svg" alt="Token" className="w-5 h-5" />
                      <span className="text-white">{selectedToken}</span>
                      <img
                        src="/arrow/filled-arrow-down.svg"
                        alt="Dropdown arrow"
                        className="object-contain shrink-0 aspect-[1.75] fill-white w-[7px]"
                      />
                    </div>
                  </button>
                </div>
              </div>
            </header>

            <div className="flex flex-col text-5xl font-medium leading-none text-center align-middle flex-3/4 justify-center">
              <input
                className="text-white opacity-20 text-center outline-none"
                value={amount}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                pattern="^[0-9]*\.?[0-9]{0,2}$"
                onKeyDown={e => {
                  if (e.key === "-" || e.key === "+" || e.key === "=") e.preventDefault();
                  if (e.key === "e" || e.key === "E") e.preventDefault();
                }}
              />
            </div>
          </div>

          <RecipientInput
            recipientAddress={recipientAddress}
            onRecipientChange={setRecipientAddress}
            onChooseRecipient={handleChooseRecipient}
          />

          {/* Message */}
          <div
            className="flex flex-col text-white rounded-xl"
            style={{
              backgroundColor: "#1E1E1E",
            }}
          >
            <header className="flex flex-wrap gap-5 justify-between self-stretch px-3 py-2 w-full bg-[#2D2D2D] rounded-t-xl">
              <h2 className="text-white mt-0.5">Message</h2>
              <h2 className="text-[#505050] mt-0.5">0/200</h2>
            </header>

            <div className="flex flex-col text-xl font-medium leading-none text-center align-middle row-span-5 p-2 bg-[#1E1E1E] rounded-b-xl border border-solid border-[#2D2D2D]">
              <textarea
                className="text-white opacity-20 outline-none text-base"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Your message"
                rows={5}
              />
            </div>
          </div>

          <div className="flex flex-row w-full gap-2 mt-2">
            <ActionButton text="Cancel" onClick={onClose} type="neutral" className="flex-1" />
            <ActionButton text="Send Request" onClick={() => {}} className="flex-3/4" />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default NewRequestModal;

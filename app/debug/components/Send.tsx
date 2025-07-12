import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  AccountId,
  Felt,
  FeltArray,
  NoteExecutionHint,
  NoteIdAndArgsArray,
  NoteInputs,
  NoteRecipient,
  NoteScript,
  Word,
} from "@demox-labs/miden-sdk";
import { Faucet, Recipient, TransferRequest } from "../types";
import { createP2IDNote, createP2IDRNote } from "@/services/utils/note";
import { useClient } from "@/hooks/web3/useClient";

interface SendProps {
  selectedAccount: string | null;
  deployedFaucets: Faucet[];
  addressBook: { name: string; address: string }[];
  fetchPortfolio?: () => Promise<void>;
}

export default function Send({
  selectedAccount,
  deployedFaucets,
  addressBook,
  fetchPortfolio,
}: SendProps) {
  const { getClient } = useClient();

  const [recipients, setRecipients] = useState<
    (Recipient & { recallHeight: string; isPrivate: boolean })[]
  >([{ address: "", amount: "", recallHeight: "", isPrivate: false }]);
  const [batchFaucetId, setBatchFaucetId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const addRecipient = () => {
    setRecipients([
      ...recipients,
      { address: "", amount: "", recallHeight: "", isPrivate: false },
    ]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  async function batchTransfer(sender: any, request: TransferRequest[]) {
    const { OutputNotesArray, TransactionRequestBuilder, NoteType } =
      await import("@demox-labs/miden-sdk");

    // get current block height
    const client = await getClient();
    const currentBlockHeight = (await client.getLatestEpochBlock()).blockNum();

    // build a list of  output notes array
    const outputNotes = await Promise.all(
      request.map(async (r) => {
        // create p2idr or p2id
        if (r.recallHeight > 0) {
          // then this is a p2idr
          return await createP2IDRNote(
            sender,
            r.recipient,
            r.faucet,
            r.amount,
            r.isPrivate ? NoteType.Private : NoteType.Public,
            r.recallHeight,
            currentBlockHeight
          );
        } else {
          return await createP2IDNote(
            sender,
            r.recipient,
            r.faucet,
            r.amount,
            r.isPrivate ? NoteType.Private : NoteType.Public
          );
        }
      })
    );

    const transactionRequest = new TransactionRequestBuilder()
      .withOwnOutputNotes(new OutputNotesArray(outputNotes))
      .build();

    let txResult = await client.newTransaction(sender, transactionRequest);
    await client.submitTransaction(txResult);

    // we will export the note
    // first get the note

    // wait for 7 seconds
    await new Promise((resolve) => setTimeout(resolve, 7000));

    // sync state
    await client.syncState();

    const note = txResult.createdNotes().getNote(0);
    const exportedNote = await client.exportNote(note.id().toString(), "Full");

    const fullNote = note.intoFull();

    if (fullNote) {
      const target = AccountId.fromHex("0x19f40c2206cdba1000001cf339984d");

      // metadata
      const outputNoteMetadata = {
        sender: fullNote.metadata().sender().toString(),
        noteType: NoteType.Private,
        noteTag: "0x19f40c2206cdba1000001cf339984d", // from_account_id(target.into());
        executionHint: "always",
        aux: 0,
      };

      const outputNoteAssets = {
        asset: fullNote
          .assets()
          .fungibleAssets()
          .map((asset) => ({
            faucetId: asset.faucetId().toString(),
            amount: asset.amount(),
          })),
      };

      const outputNoteRecipient = {
        serialNumber: Word.newFromFelts([
          new Felt(BigInt(1)),
          new Felt(BigInt(2)),
          new Felt(BigInt(3)),
          new Felt(BigInt(4)),
        ]),
        noteScript: NoteScript.p2id(),
        input: new NoteInputs(
          new FeltArray([target.suffix(), target.prefix()])
        ),
      };

      console.log(outputNoteMetadata, outputNoteAssets, outputNoteRecipient);
    }

    // call api to store the full note
    // const response = await fetch("/api/store-note", {
    //   method: "POST",
    //   body: {
    //     note: note.intoFull()?.recipient,
    //   },
    // });
    // const data = await response.json();

    return txResult.executedTransaction().id().toHex();
  }

  const updateRecipient = (
    index: number,
    field: "address" | "amount" | "recallHeight" | "isPrivate",
    value: string | boolean
  ) => {
    const newRecipients = [...recipients];
    (newRecipients[index] as any)[field] = value;
    setRecipients(newRecipients);
  };

  const selectFromAddressBook = (address: string) => {
    const lastRecipient = recipients[recipients.length - 1];
    if (lastRecipient && !lastRecipient.address) {
      updateRecipient(recipients.length - 1, "address", address);
    } else {
      addRecipient();
      updateRecipient(recipients.length, "address", address);
    }
    setShowAddressBook(false);
  };

  const handleSend = async () => {
    if (!selectedAccount) return toast.error("Please select an account");

    const validRecipients = recipients.filter((r) => r.address && r.amount);
    if (validRecipients.length === 0) {
      toast.error("No valid recipients");
      return;
    }

    if (!batchFaucetId) {
      toast.error("Please enter a faucet ID");
      return;
    }

    setIsSending(true);
    try {
      const transferRequests = validRecipients.map((r) => ({
        recipient: AccountId.fromHex(r.address),
        amount: Number(r.amount),
        faucet: AccountId.fromHex(batchFaucetId),
        recallHeight: Number(r.recallHeight),
        isPrivate: r.isPrivate,
      }));
      toast.loading("Sending transactions...");

      const txId = await batchTransfer(
        AccountId.fromHex(selectedAccount),
        transferRequests
      );
      toast.dismiss();
      toast.success(
        <div>
          <p>Notes consumed successfully</p>
          <a
            href={`https://testnet.midenscan.com/tx/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-600 underline mt-1 inline-block"
          >
            View on MidenScan
          </a>
        </div>
      );
      // setRecipients([
      //   { address: "", amount: "", recallHeight: "", isPrivate: false },
      // ]);

      // update balance
      if (fetchPortfolio) {
        await fetchPortfolio();
      }
    } catch (error) {
      console.error("Error sending transactions:", error);
      toast.error("Error sending transactions");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowAddressBook(false);
        setActiveInputIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="w-full rounded-2xl shadow-2xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Multisender
        </h2>
      </div>

      {/* Faucet ID Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Select Faucet
        </label>
        <select
          value={batchFaucetId}
          onChange={(e) => setBatchFaucetId(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Select a faucet</option>
          {deployedFaucets.map((faucet) => (
            <option key={faucet.id} value={faucet.id}>
              {faucet.symbol} ({faucet.decimals} decimals)
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {recipients.map((recipient, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Recipient Address"
                value={recipient.address}
                onChange={(e) =>
                  updateRecipient(index, "address", e.target.value)
                }
                onFocus={() => {
                  setShowAddressBook(true);
                  setActiveInputIndex(index);
                }}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {showAddressBook && activeInputIndex === index && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 dark:border-slate-600"
                >
                  {addressBook.map((contact, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        selectFromAddressBook(contact.address);
                        setShowAddressBook(false);
                        setActiveInputIndex(null);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-600 flex justify-between items-center"
                    >
                      <span>{contact.name}</span>
                      <span className="text-sm text-slate-500">
                        {contact.address}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="w-32">
              <input
                type="number"
                placeholder="Amount"
                value={recipient.amount}
                onChange={(e) =>
                  updateRecipient(index, "amount", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="w-40">
              <input
                type="number"
                placeholder="Recallable Height"
                value={recipient.recallHeight}
                onChange={(e) =>
                  updateRecipient(index, "recallHeight", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs mb-1">Privacy</span>
              <button
                onClick={() =>
                  updateRecipient(index, "isPrivate", !recipient.isPrivate)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  recipient.isPrivate
                    ? "bg-indigo-600"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    recipient.isPrivate ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {recipients.length > 1 && (
              <button
                onClick={() => removeRecipient(index)}
                className="p-2 text-red-500 hover:text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={addRecipient}
          className="px-4 py-2 bg-slate-100 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          Add Recipient
        </button>
        <button
          onClick={handleSend}
          disabled={isSending || !selectedAccount}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending...
            </>
          ) : (
            <>
              Send {recipients.length} Transaction
              {recipients.length !== 1 ? "s" : ""}
            </>
          )}
        </button>
      </div>
    </section>
  );
}

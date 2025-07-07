import { useState } from "react";
import toast from "react-hot-toast";
import { nodeEndpoint } from "@/services/utils/constant";
import { AccountId } from "@demox-labs/miden-sdk";
import { consumeAllNotes } from "@/services/utils/note";
import { useClient } from "@/hooks/web3/useClient";

interface NotesProps {
  selectedAccount: string | null;
  consumableNotes: any[];
  setConsumableNotes: (notes: any[]) => void;
}

export default function Notes({
  selectedAccount,
  consumableNotes,
  setConsumableNotes,
}: NotesProps) {
  const { getClient } = useClient();
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  const getConsumableNotes = async () => {
    if (!selectedAccount) return;

    setIsLoadingNotes(true);
    try {
      const client = await getClient();
      const notes = await client.getConsumableNotes(
        AccountId.fromHex(selectedAccount)
      );
      console.log(notes);
      setConsumableNotes(notes);
    } catch (error) {
      console.error("Error fetching consumable notes:", error);
      toast.error("Failed to fetch consumable notes, please try again");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleConsumeAll = async () => {
    if (!selectedAccount) {
      toast.error("Please select an account first");
      return;
    }

    if (consumableNotes.length === 0) {
      toast.error("No notes to consume");
      return;
    }

    toast.loading("Consuming notes...");
    try {
      const noteIds = consumableNotes.map((note) =>
        note.inputNoteRecord().id().toString()
      );
      const txId = await consumeAllNotes(selectedAccount, noteIds);
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

      await getConsumableNotes();
    } catch (error) {
      console.error("Error consuming notes:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to consume notes"
      );
    }
  };

  return (
    <section className="w-full backdrop-blur-md rounded-2xl shadow-2xl p-8">
      <div className="mb-8 p-4 bg-slate-50 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Consumable Notes</h3>
          <div className="flex gap-2">
            <button
              onClick={getConsumableNotes}
              disabled={isLoadingNotes}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingNotes ? (
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
                  Loading...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Refresh Notes
                </>
              )}
            </button>
            {consumableNotes.length > 0 && (
              <button
                onClick={handleConsumeAll}
                disabled={isLoadingNotes}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingNotes ? (
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
                    Loading...
                  </>
                ) : (
                  "Consume All Notes"
                )}
              </button>
            )}
          </div>
        </div>
        {isLoadingNotes ? (
          <div className="text-center py-8">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-indigo-500"
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
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Loading consumable notes...
            </p>
          </div>
        ) : consumableNotes.length === 0 ? (
          <div className="text-center py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              {selectedAccount
                ? "No consumable notes found"
                : "Select an account to view notes"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {consumableNotes.map((note, index) => {
              const noteDetails = note.inputNoteRecord().details();
              const assets = noteDetails.assets().fungibleAssets();
              const recipient = noteDetails.recipient();

              return (
                <div
                  key={index}
                  className="bg-white  rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">
                        Note {index + 1}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        ID: {note.inputNoteRecord().id().toString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          note.inputNoteRecord().id().toString()
                        );
                        toast.success("Note ID copied to clipboard");
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>

                  {/* Recipient Information */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2">Recipient</h5>
                    <div className="ounded p-2">
                      <p className="text-sm break-all">
                        {recipient.digest().toHex()}
                      </p>
                    </div>
                  </div>

                  {/* Assets Information */}
                  <div>
                    <h5 className="text-sm font-medium text-slate-700  mb-2">
                      Assets
                    </h5>
                    <div className="space-y-2">
                      {assets.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                          No fungible assets
                        </p>
                      ) : (
                        assets.map((asset: any, assetIndex: number) => (
                          <div
                            key={assetIndex}
                            className="rounded p-2 flex justify-between items-center"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                Faucet ID: {asset.faucetId().toString()}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Amount: {asset.amount().toString()}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  asset.faucetId().toString()
                                );
                                toast.success("Faucet ID copied to clipboard");
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

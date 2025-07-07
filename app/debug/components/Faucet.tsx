import { useState } from "react";
import type { Faucet } from "../types";
import toast from "react-hot-toast";
import { deployFaucet, mintToken } from "@/services/utils/faucet";
import { Account } from "@demox-labs/miden-sdk";

interface FaucetProps {
  selectedAccount: string | null;
  deployedFaucets: Faucet[];
  setDeployedFaucets: (faucets: Faucet[]) => void;
}

export default function Faucet({
  selectedAccount,
  deployedFaucets,
  setDeployedFaucets,
}: FaucetProps) {
  const [selectedFaucet, setSelectedFaucet] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [newFaucet, setNewFaucet] = useState({
    symbol: "MID",
    decimals: "8",
    maxSupply: "1000000",
  });
  const [isDeployingFaucet, setIsDeployingFaucet] = useState(false);

  const handleMint = async () => {
    if (!selectedAccount) {
      toast.error("Please select an account first");
      return;
    }

    if (!selectedFaucet) {
      toast.error("Please select a faucet");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const faucet = deployedFaucets.find((f) => f.id === selectedFaucet);
    if (!faucet) {
      toast.error("Selected faucet not found");
      return;
    }

    setIsLoading(true);
    try {
      console.log("MINT TOKEN:", selectedAccount, selectedFaucet, amount);
      const txId = await mintToken(
        selectedAccount,
        selectedFaucet,
        Number(amount)
      );
      toast.success(
        <div>
          <p>Token minted successfully</p>
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
      setAmount("");
    } catch (error) {
      console.error("Error minting token:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to mint token"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeployFaucet = async () => {
    if (!newFaucet.symbol || !newFaucet.decimals || !newFaucet.maxSupply) {
      toast.error("Please fill in all faucet details");
      return;
    }

    setIsDeployingFaucet(true);
    try {
      const faucetId = (
        await deployFaucet(
          newFaucet.symbol,
          parseInt(newFaucet.decimals),
          parseInt(newFaucet.maxSupply)
        )
      )
        .id()
        .toString();

      const newFaucetData = {
        id: faucetId,
        symbol: newFaucet.symbol,
        decimals: parseInt(newFaucet.decimals),
        maxSupply: newFaucet.maxSupply,
      };

      setDeployedFaucets([...deployedFaucets, newFaucetData]);
      setNewFaucet({
        symbol: "MID",
        decimals: "8",
        maxSupply: "1000000",
      });

      toast.success(
        <div>
          <p>Faucet deployed successfully</p>
          <a
            href={`https://testnet.midenscan.com/account/${faucetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-600 underline mt-1 inline-block"
          >
            View on MidenScan
          </a>
        </div>
      );
    } catch (error) {
      console.error("Error deploying faucet:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to deploy faucet"
      );
    } finally {
      setIsDeployingFaucet(false);
    }
  };

  return (
    <section className="w-full rounded-2xl shadow-2xl p-8">
      <div className="mb-8 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Deploy New Faucet</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="symbol"
              className="block text-sm font-medium text-slate-700  mb-2"
            >
              Symbol
            </label>
            <input
              type="text"
              id="symbol"
              value={newFaucet.symbol}
              onChange={(e) =>
                setNewFaucet({ ...newFaucet, symbol: e.target.value })
              }
              className="w-full px-4 py-2 bg-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="decimals"
              className="block text-sm font-medium text-slate-700  mb-2"
            >
              Decimals
            </label>
            <input
              type="number"
              id="decimals"
              value={newFaucet.decimals}
              onChange={(e) =>
                setNewFaucet({ ...newFaucet, decimals: e.target.value })
              }
              className="w-full px-4 py-2 bg-white  border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="maxSupply"
              className="block text-sm font-medium text-slate-700  mb-2"
            >
              Max Supply
            </label>
            <input
              type="text"
              id="maxSupply"
              value={newFaucet.maxSupply}
              onChange={(e) =>
                setNewFaucet({ ...newFaucet, maxSupply: e.target.value })
              }
              className="w-full px-4 py-2 bg-white  border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleDeployFaucet}
            disabled={isDeployingFaucet}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeployingFaucet ? (
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
                Deploying...
              </>
            ) : (
              "Deploy Faucet"
            )}
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-50 /50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Mint Tokens</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="faucet"
              className="block text-sm font-medium text-slate-700  mb-2"
            >
              Select Faucet
            </label>
            <select
              id="faucet"
              value={selectedFaucet}
              onChange={(e) => setSelectedFaucet(e.target.value)}
              className="w-full px-4 py-2 bg-white  border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a faucet</option>
              {deployedFaucets.map((faucet) => (
                <option key={faucet.id} value={faucet.id}>
                  {faucet.symbol} ({faucet.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-slate-700  mb-2"
            >
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to mint"
              className="w-full px-4 py-2 bg-white  border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleMint}
            disabled={!selectedFaucet || !amount || isLoading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
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
                Minting...
              </>
            ) : (
              "Mint Tokens"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

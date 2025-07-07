import { getAccountAssets } from "@/services/utils/account";
import { AccountId } from "@demox-labs/miden-sdk";
import { useState } from "react";

interface PortfolioProps {
  selectedAccount: string;
}

export default function Portfolio({ selectedAccount }: PortfolioProps) {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);

  const fetchPortfolio = async () => {
    if (!selectedAccount) return;

    try {
      const assets = await getAccountAssets(AccountId.fromHex(selectedAccount));
      setPortfolio(assets);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  return (
    <section className="w-full  bg-white/90 rounded-2xl shadow-2xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Portfolio
        </h2>
        <button className="p-5 bg-red-300" onClick={fetchPortfolio}>
          Fetch Portfolio
        </button>
        {isLoadingPortfolio && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg
              className="animate-spin h-4 w-4"
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
          </div>
        )}
      </div>
      {portfolio.length === 0 ? (
        <div className="text-center py-12">
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4">
            {isLoadingPortfolio ? "Loading portfolio..." : "No assets found"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolio.map((asset, index) => (
            <div key={index} className="bg-slate-50  p-4 rounded-lg">
              <p className="text-sm ">Token Address</p>
              <p className="font-mono text-sm mb-2">{asset.tokenAddress}</p>
              <p className="text-sm ">Amount</p>
              <p className="font-mono text-lg font-semibold">{asset.amount}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

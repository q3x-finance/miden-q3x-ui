import { AssetWithMetadata } from "@/types/faucet";
import { qashTokenAddress } from "./constant";

export const getDefaultSelectedToken = (assets: AssetWithMetadata[]): AssetWithMetadata => {
  // If user has no assets, default to Qash
  if (assets.length === 0) {
    return {
      amount: "0",
      tokenAddress: qashTokenAddress,
      metadata: {
        symbol: "QASH",
        decimals: 8,
        maxSupply: 1000000,
      },
    };
  }

  // Find the token with the highest balance (excluding Qash if it has 0 balance)
  const nonZeroAssets = assets.filter(asset => parseFloat(asset.amount) > 0);

  if (nonZeroAssets.length === 0) {
    // All assets have 0 balance, default to Qash
    return {
      tokenAddress: qashTokenAddress,
      amount: "0",
      metadata: {
        symbol: "QASH",
        decimals: 8,
        maxSupply: 1000000,
      },
    };
  }

  // Find asset with highest balance
  const highestBalanceAsset = nonZeroAssets.reduce((prev, current) => {
    return parseFloat(current.amount) > parseFloat(prev.amount) ? current : prev;
  });

  return {
    amount: highestBalanceAsset.amount,
    tokenAddress: highestBalanceAsset.tokenAddress,
    metadata: highestBalanceAsset.metadata,
  };
};

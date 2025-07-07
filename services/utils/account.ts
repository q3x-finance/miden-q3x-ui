import { FungibleAsset } from "@demox-labs/miden-sdk";
import { useClient } from "../../hooks/web3/useClient";

interface Asset {
  tokenAddress: string;
  amount: string;
}

export async function deployAccount(isPublic: boolean) {
  const { getClient } = useClient();
  const client = await getClient();
  const { AccountStorageMode } = await import("@demox-labs/miden-sdk");

  const account = await client.newWallet(
    isPublic ? AccountStorageMode.public() : AccountStorageMode.private(),
    true
  );

  return account;
}

export async function getAccountAssets(accountId: any): Promise<Asset[]> {
  const { getClient } = useClient();
  const client = await getClient();
  await client.syncState();
  let account = await client.getAccount(accountId);

  // read account assets
  const assets: FungibleAsset[] = account?.vault().fungibleAssets() || [];
  return assets.map((asset: any) => ({
    tokenAddress: asset.faucetId().toString(),
    amount: asset.amount().toString(),
  }));
}

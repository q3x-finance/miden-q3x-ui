export type Tab = "send" | "addressbook" | "notes" | "faucet";

export type Faucet = {
  id: string;
  symbol: string;
  decimals: number;
  maxSupply: string;
};

export type Contact = {
  name: string;
  address: string;
};

export type Recipient = {
  address: string;
  amount: string;
};

export type Account = {
  id: string;
  name: string;
  isPublic: boolean;
};

export interface TransferRequest {
  recipient: any;
  amount: number;
  faucet: any;
  recallHeight: number;
  isPrivate: boolean;
}

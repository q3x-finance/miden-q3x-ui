import {
  AccountId,
  NoteIdAndArgs,
  NoteIdAndArgsArray,
  NoteType,
  TransactionRequestBuilder,
} from "@demox-labs/miden-sdk";
import { useClient } from "../../hooks/web3/useClient";

export async function createP2IDNote(
  sender: AccountId,
  receiver: AccountId,
  faucet: AccountId,
  amount: number,
  noteType: NoteType
) {
  const { FungibleAsset, OutputNote, Note, NoteAssets, Word, Felt } =
    await import("@demox-labs/miden-sdk");

  return OutputNote.full(
    Note.createP2IDNote(
      sender,
      receiver,
      new NoteAssets([new FungibleAsset(faucet, BigInt(amount))]),
      noteType,
      // @todo: replace hardcoded values with random values
      Word.newFromFelts([
        new Felt(BigInt(1)),
        new Felt(BigInt(2)),
        new Felt(BigInt(3)),
        new Felt(BigInt(4)),
      ]),
      new Felt(BigInt(0))
    )
  );
}

export async function createP2IDRNote(
  sender: AccountId,
  receiver: AccountId,
  faucet: AccountId,
  amount: number,
  noteType: NoteType,
  reclaimAfter: number, // seconds after which the note can be reclaimed
  currentBlockHeight: number
) {
  const { FungibleAsset, OutputNote, Note, NoteAssets, Word, Felt } =
    await import("@demox-labs/miden-sdk");

  // we need to get current block height, then add recall height to it, it will became the final reclaim block height
  // each block was around 5 seconds

  // turn seconds into blocks
  const reclaimAfterBlocks = reclaimAfter / 5;

  // add current block height to reclaim after blocks
  const finalReclaimBlockHeight = currentBlockHeight + reclaimAfterBlocks;

  return OutputNote.full(
    Note.createP2IDRNote(
      sender,
      receiver,
      new NoteAssets([new FungibleAsset(faucet, BigInt(amount))]),
      noteType,
      // @todo: replace hardcoded values with random values
      Word.newFromFelts([
        new Felt(BigInt(1)),
        new Felt(BigInt(2)),
        new Felt(BigInt(3)),
        new Felt(BigInt(4)),
      ]),
      finalReclaimBlockHeight,
      new Felt(BigInt(0))
    )
  );
}

export async function consumeAllNotes(accountId: string, noteIds: string[]) {
  const { getClient } = useClient();
  try {
    const client = await getClient();
    const { AccountId } = await import("@demox-labs/miden-sdk");
    const consumeTxRequest = client.newConsumeTransactionRequest(noteIds);
    const txResult = await client.newTransaction(
      AccountId.fromHex(accountId),
      consumeTxRequest
    );
    await client.submitTransaction(txResult);
  } catch (err) {
    throw new Error("consumeAllNotes: Failed to consume notes");
  }
}

export async function getConsumableNotes(accountId: string) {
  const { getClient } = useClient();

  try {
    const client = await getClient();

    const notes = await client.getConsumableNotes(AccountId.fromHex(accountId));
    return notes;
  } catch (error) {
    throw new Error("getConsumableNotes: Failed to fetch consumable notes");
  }
}

export async function consumePrivateNote(
  noteIds: NoteIdAndArgs[],
  accountId: string
) {
  const { getClient } = useClient();
  try {
    const client = await getClient();

    const consumeTxRequest = new TransactionRequestBuilder()
      .withAuthenticatedInputNotes(new NoteIdAndArgsArray(noteIds))
      .build();

    const txResult = await client.newTransaction(
      AccountId.fromHex(accountId),
      consumeTxRequest
    );
    await client.submitTransaction(txResult);
  } catch (error) {
    throw new Error("consumePrivateNote: Failed to fetch consumable notes");
  }
}

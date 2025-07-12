"use client";

import { deployAccount } from "@/services/utils/account";
import {
  Account,
  AccountBuilder,
  AccountId,
  Felt,
  FeltArray,
  FungibleAsset,
  Note,
  NoteAndArgs,
  NoteAndArgsArray,
  NoteAssets,
  NoteExecutionHint,
  NoteExecutionMode,
  NoteId,
  NoteIdAndArgs,
  NoteIdAndArgsArray,
  NoteInputs,
  NoteMetadata,
  NoteRecipient,
  NoteScript,
  NoteTag,
  NoteType,
  RpoDigest,
  TransactionRequestBuilder,
  Word,
} from "@demox-labs/miden-sdk";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Send from "./components/Send";
import Faucet from "./components/Faucet";
import { Faucet as FaucetType } from "./types";
import Notes from "./components/Notes";
import Portfolio from "./components/Portfolio";
import { consumePrivateNote } from "@/services/utils/note";
import { useClient } from "@/hooks/web3/useClient";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import { TransactionType } from "@demox-labs/miden-wallet-adapter-base";

const Debug = () => {
  const { getClient } = useClient();
  const { requestTransaction } = useWallet();

  const [allAccounts, setAllAccounts] = useState<any[]>([]);
  const [localStorageAccounts, setLocalStorageAccounts] = useState<any[]>([]);
  const [deployedFaucets, setDeployedFaucets] = useState<FaucetType[]>([]);
  const [consumableNotes, setConsumableNotes] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    const savedAccounts = localStorage.getItem("deployedAccounts");
    const savedFaucets = localStorage.getItem("deployedFaucets");

    if (savedAccounts) setLocalStorageAccounts(JSON.parse(savedAccounts));
    if (savedFaucets) setDeployedFaucets(JSON.parse(savedFaucets));
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("deployedFaucets", JSON.stringify(deployedFaucets));
    }
  }, [deployedFaucets, isClient]);

  const handleDeployAccount = async () => {
    try {
      toast.loading("Deploying account...");
      const account = await deployAccount(true);

      setAllAccounts([...allAccounts, account]);

      localStorage.setItem(
        "deployedAccounts",
        JSON.stringify(
          [...allAccounts, account].map((account) => ({
            id: account.id().toString(),
          }))
        )
      );

      toast.dismiss();
      toast.success(`Account deployed: ${account.id}`);
    } catch (error) {
      toast.dismiss();
      console.error("Error deploying account:", error);
      toast.error("Error deploying account");
    }
  };

  // assetCommitmentDigest
  // 0xcb53db6180be35ba49ea1bbaa1053569d0e6ef8bdcbfe0f31e81d852d9c0297d

  // recipientDigests
  // 0x9a114c6054319731fa31c9f9346f17b4c0b310b0a5facbd05fa96ef7b4c73682

  const handleConsumePrivateNote = async () => {
    try {
      // note id: 0xa24a7a69e8d64309ac4aa40011ada29550039753308e392eeaa6357debbdfe8a
      toast.loading("Consuming private note...");
      const client = await getClient();

      // const txRequest = client.newConsumeTransactionRequest([
      //   "0x6e6aae833496a8e4ee7e0de0d206293a2bddae4ad9e4018fc4917f3c91e31c82",
      // ]);
      //     console.log("IMPORTED NOTE", importedNote);

      // const outputNote = await client.getOutputNote(importedNote)
      // console.log("OUTPUT NOTE", outputNote)

      // const txRequest = new TransactionRequestBuilder()
      //   .withAuthenticatedInputNotes(new NoteIdAndArgsArray([importedNote]))
      //   .build();
      // const txResult = await client.newTransaction(
      //   AccountId.fromHex(localStorageAccounts[0].id),
      //   txRequest
      // );
      // await client.submitTransaction(txResult);
      // toast.dismiss();
      // toast.success("Private note consumed");

      // toast.success(
      //   <div>
      //     <p>Notes consumed successfully</p>
      //     <a
      //       href={`https://testnet.midenscan.com/tx/${txResult.executedTransaction().id().toHex()}`}
      //       target="_blank"
      //       rel="noopener noreferrer"
      //       className="text-indigo-500 hover:text-indigo-600 underline mt-1 inline-block"
      //     >
      //       View on MidenScan
      //     </a>
      //   </div>
      // );

      // lets try unauthenticated input note

      const target = AccountId.fromHex("0x19f40c2206cdba1000001cf339984d");
      const sender = AccountId.fromHex("0x9212eb1c5521971000009dc2768586");
      const faucet = AccountId.fromHex("0x3b037e3e8298ef200006aafe79e232");
      const amount = BigInt(16);

      const noteMetadata = new NoteMetadata(
        sender,
        NoteType.Private,
        NoteTag.fromAccountId(target, NoteExecutionMode.newLocal()),
        NoteExecutionHint.always(),
        new Felt(BigInt(0))
      );
      const noteAsset = new NoteAssets([new FungibleAsset(faucet, amount)]);
      const noteRecipient = new NoteRecipient(
        Word.newFromFelts([
          new Felt(BigInt(1)),
          new Felt(BigInt(2)),
          new Felt(BigInt(3)),
          new Felt(BigInt(4)),
        ]),
        NoteScript.p2id(),
        new NoteInputs(new FeltArray([target.suffix(), target.prefix()]))
      );
      const note = new Note(noteAsset, noteMetadata, noteRecipient);

      let unauthenticatedNote = new NoteAndArgs(note);

      const txRequest = new TransactionRequestBuilder()
        .withUnauthenticatedInputNotes(
          new NoteAndArgsArray([unauthenticatedNote])
        )
        .build();

      const txResult = await client.newTransaction(target, txRequest);
      await client.submitTransaction(txResult);

      console.log("TX RESULT", txResult);
    } catch (error) {
      toast.dismiss();
      console.log("CONSUME PRIVATE NOTE ERROR", error);
      toast.error("Error consuming private note");
    }
  };

  const handleWalletSendPrivateNote = async () => {
    try {
      await requestTransaction?.({
        type: TransactionType.Consume,
        payload: {
          faucetId: "0x2f3da6aa8735e7200006e8d6e06a8c",
          noteId:
            "0x22f1141025ecef05b39632ca222544a605ce3515c2790636178794aa32335128",
          noteType: "private",
          amount: 1,
        },
      });
    } catch (error) {}
  };

  return (
    <div>
      <button
        onClick={handleConsumePrivateNote}
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        Consume Private Note
      </button>
      <button
        onClick={handleWalletSendPrivateNote}
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        Consume Private Note from Wallet
      </button>
      {isClient ? (
        <div>
          <button
            onClick={handleDeployAccount}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            Deploy Account
          </button>
          <div>
            {localStorageAccounts &&
              localStorageAccounts.length > 0 &&
              localStorageAccounts.map((account: any, index: number) => {
                return <div key={index}>{account?.id}</div>;
              })}
          </div>
          <div>
            <Faucet
              selectedAccount={
                localStorageAccounts.length > 0
                  ? localStorageAccounts[0].id
                  : null
              }
              deployedFaucets={deployedFaucets}
              setDeployedFaucets={setDeployedFaucets}
            />
            <Notes
              selectedAccount={
                localStorageAccounts.length > 0
                  ? localStorageAccounts[0].id
                  : null
              }
              consumableNotes={consumableNotes}
              setConsumableNotes={setConsumableNotes}
            />
            <Send
              selectedAccount={
                localStorageAccounts.length > 0
                  ? localStorageAccounts[0].id
                  : null
              }
              deployedFaucets={deployedFaucets}
              addressBook={[]}
            />
            <Portfolio
              selectedAccount={
                localStorageAccounts.length > 0
                  ? localStorageAccounts[0].id
                  : null
              }
            />
          </div>
        </div>
      ) : (
        <div> Loading...</div>
      )}
    </div>
  );
};

export default Debug;

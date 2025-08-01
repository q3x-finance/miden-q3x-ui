"use client";
import { formatAddress } from "@/services/utils/miden/address";
import React from "react";

interface TokenItemProps {
  icon: string;
  name: string;
  address: string;
  usdValue: string;
  tokenAmount: string;
  onClick?: () => void;
}

export function TokenItem({ icon, name, address, usdValue, tokenAmount, onClick }: TokenItemProps) {
  return (
    <div
      className="flex gap-2 items-center self-stretch p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer max-md:p-3 max-sm:gap-2.5 max-sm:p-2.5"
      onClick={onClick}
    >
      <img src={icon} alt={name} className="w-10 h-10 rounded-full" />
      <div className="flex flex-col gap-1.5 justify-center items-start flex-[1_0_0] max-sm:gap-1">
        <h3 className="self-stretch text-sm font-medium tracking-tight leading-4 text-white max-md:text-sm max-sm:text-sm">
          {name}
        </h3>
        {address && (
          <p className="self-stretch text-xs tracking-tight leading-4 text-neutral-400 max-sm:text-xs">
            {formatAddress(address)}
          </p>
        )}
      </div>
      {address && (
        <div className="flex flex-col gap-1.5 justify-center items-start flex-[1_0_0] max-sm:gap-1">
          <div className="self-stretch text-sm font-medium tracking-tight leading-4 text-right max-md:text-sm max-sm:text-xs">
            <span className="text-zinc-500 mr-1">US$</span>
            <span className="text-white">{usdValue}</span>
          </div>
          <p className="self-stretch text-xs tracking-tight leading-4 text-right text-neutral-400 max-md:text-xs max-sm:text-xs">
            {tokenAmount}
          </p>
        </div>
      )}
    </div>
  );
}

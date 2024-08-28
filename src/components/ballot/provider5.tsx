"use client";
import { PropsWithChildren, createContext, useContext, useEffect } from "react";
import {
  Round4Ballot,
  Round5Ballot,
  useBallot,
  useRemoveAllocation,
  useRound5Ballot,
  useSaveAllocation,
} from "@/hooks/useBallot";
import { useBallotEditor } from "@/hooks/useBallotEditor";
import { useAccount } from "wagmi";
import { useBallotRound5Editor } from "@/hooks/useBallotRound5Editor";
import { useSaveRound5Allocation } from "@/hooks/useBallotRound5";

type BallotRound5Context = ReturnType<typeof useBallotRound5Editor>;
const BallotRound5Context = createContext(
  {} as BallotRound5Context & {
    isPending: boolean;
    ballot?: Round5Ballot | undefined;
  }
);

export function BallotRound5Provider({ children }: PropsWithChildren) {
  const { address } = useAccount();
  const { data: ballot, isFetched, isPending } = useRound5Ballot(address);
  const save = useSaveRound5Allocation();

  const editor = useBallotRound5Editor({
    onUpdate: save.mutate,
  });

  useEffect(() => {
    isFetched && editor.reset(ballot?.catgory_allocation);
  }, [isFetched]); // Only trigger when isFetched is changed

  const value = { ballot, isPending, ...editor };

  return (
    <BallotRound5Context.Provider value={value}>{children}</BallotRound5Context.Provider>
  );
}

export function useBallotRound5Context() {
  return useContext(BallotRound5Context);
}

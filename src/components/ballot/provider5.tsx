'use client';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { Round5Ballot, useRound5Ballot } from '@/hooks/useBallotRound5';
import { useAccount } from 'wagmi';
import { useBallotRound5Editor } from '@/hooks/useBallotRound5Editor';
import { useSaveRound5Allocation } from '@/hooks/useBallotRound5';

type BallotRound5Context = ReturnType<typeof useBallotRound5Editor> & {
  isPending: boolean;
  ballot?: Round5Ballot | undefined;
  updateBallotState: () => Promise<void>;
};

const BallotRound5Context = createContext({} as BallotRound5Context);

export function BallotRound5Provider({ children }: PropsWithChildren) {
  const { address } = useAccount();
  const {
    data: ballot,
    isFetched,
    isPending,
    refetch,
  } = useRound5Ballot(address);
  const save = useSaveRound5Allocation();
  const [localBallot, setLocalBallot] = useState<Round5Ballot | undefined>(
    ballot
  );

  const editor = useBallotRound5Editor({
    onUpdate: save.mutate,
  });

  useEffect(() => {
    isFetched && editor.reset(ballot?.project_allocations);
    setLocalBallot(ballot);
  }, [isFetched, ballot]);

  const updateBallotState = useCallback(async () => {
    if (localBallot) {
      const updatedBallot = {
        ...localBallot,
        projects_to_be_evaluated: [],
        total_projects: localBallot.project_allocations.length,
      };
      setLocalBallot(updatedBallot);
      await refetch();
    }
  }, [localBallot, refetch]);

  const value = {
    ballot: localBallot,
    isPending,
    ...editor,
    updateBallotState,
  };

  return (
    <BallotRound5Context.Provider value={value}>
      {children}
    </BallotRound5Context.Provider>
  );
}

export function useBallotRound5Context() {
  return useContext(BallotRound5Context);
}

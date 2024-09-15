"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { CategoryId, Round5Allocation } from "@/types/shared";
import {
  getRetroFundingRoundBallotById,
  updateRetroFundingRoundCategoryAllocation,
  getRetroFundingRoundBallotByIdResponse,
  updateRetroFundingRoundCategoryAllocationResponse,
} from "@/__generated__/api/agora";
import {
  RetroFundingBallot5ProjectsAllocation,
  RetroFundingBallotCategoriesAllocation,
  Round5Ballot,
} from "@/__generated__/api/agora.schemas";

export function useBudget(roundId: number) {
  const { toast } = useToast();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const getBudget = useQuery({
    enabled: Boolean(address),
    queryKey: ["budget", address, roundId],
    queryFn: async () => {
      if (!address) throw new Error("No address provided");
      return getRetroFundingRoundBallotById(roundId, address).then(
        (response: getRetroFundingRoundBallotByIdResponse) => {
          const ballot = response.data as Round5Ballot;
          const allocations = ballot.category_allocations;
          return allocations as RetroFundingBallotCategoriesAllocation[];
        }
      );
    },
  });

  const saveAllocation = useMutation({
    mutationKey: ["save-budget", roundId],
    mutationFn: async (allocation: Round5Allocation) => {
      if (!address) throw new Error("No address provided");
      return updateRetroFundingRoundCategoryAllocation(
        roundId,
        address,
        allocation
      ).then((response: updateRetroFundingRoundCategoryAllocationResponse) => {
        const updatedBallot = response.data as Round5Ballot;
        queryClient.setQueryData(
          ["budget", address, roundId],
          updatedBallot.category_allocations
        );
        return updatedBallot.category_allocations as RetroFundingBallot5ProjectsAllocation[];
      });
    },
    onError: () =>
      toast({
        variant: "destructive",
        title: "Error saving budget allocation",
      }),
  });

  // dummy api calls
  const getBudgetAmount = useQuery({
    enabled: Boolean(address),
    queryKey: ["budget-amount", address, roundId],
    queryFn: async () => {
      return new Promise<number>((resolve) => {
        setTimeout(() => {
          resolve(8000000);
        }, 500);
      });
    },
  });

  const setBudgetAmount = useMutation({
    mutationKey: ["set-budget-amount", roundId],
    mutationFn: async (amount: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },
    onError: () =>
      toast({
        variant: "destructive",
        title: "Error setting budget amount",
      }),
  });

  return {
    getBudget,
    saveAllocation,
    getBudgetAmount,
    setBudgetAmount,
  };
}

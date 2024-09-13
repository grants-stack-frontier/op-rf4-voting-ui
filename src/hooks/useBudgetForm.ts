'use client';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { CategoryId, Round5Allocation } from "@/types/shared";
import {
  getRetroFundingRoundBallotById,
  updateRetroFundingRoundCategoryAllocation,
  getRetroFundingRoundBallotByIdResponse,
  updateRetroFundingRoundCategoryAllocationResponse,
} from '@/__generated__/api/agora';
import { useState } from "react";
import { RetroFundingBallot5ProjectsAllocation, RetroFundingBallotCategoriesAllocation, Round5Ballot } from "@/__generated__/api/agora.schemas";

export function useBudgetForm(roundId: number) {
  const { toast } = useToast();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});

  const getBudget = useQuery({
    enabled: Boolean(address),
    queryKey: ["budget", address, roundId],
    queryFn: async () => {
      if (!address) throw new Error("No address provided");
      return getRetroFundingRoundBallotById(roundId, address)
        .then((response: getRetroFundingRoundBallotByIdResponse) => {
          const ballot = response.data as Round5Ballot;
          const allocations = ballot.category_allocations;
          console.log('allocations', allocations)
          if (allocations) {
            setLockedFields(
              allocations.reduce((acc, allocation) => {
                if (allocation && allocation.category_slug !== undefined) {
                  acc[allocation.category_slug] = allocation.locked ?? false;
                }
                return acc;
              }, {} as Record<string, boolean>)
            );
          }
          console.log('allocations', allocations)
          return allocations as RetroFundingBallotCategoriesAllocation[];
        });
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
        queryClient.setQueryData(["budget", address, roundId], updatedBallot.category_allocations);
        return updatedBallot.category_allocations as RetroFundingBallot5ProjectsAllocation[];
      });
    },
    onError: () =>
      toast({
        variant: "destructive",
        title: "Error saving budget allocation",
      }),
  });

  const submitBudget = useMutation({
    mutationKey: ["submit-budget", roundId],
    mutationFn: async (allocations: Round5Allocation[]) => {
      if (!address) throw new Error("No address provided");
      const promises = allocations.map(allocation =>
        updateRetroFundingRoundCategoryAllocation(roundId, address, allocation)
      );
      return Promise.all(promises);
    },
    onSuccess: () => toast({ title: "Budget submitted successfully" }),
    onError: () =>
      toast({ variant: "destructive", title: "Error submitting budget" }),
  });

  const toggleLock = async (categoryId: CategoryId) => {
    const newLockedState = !lockedFields[categoryId];
    setLockedFields((prev) => ({ ...prev, [categoryId]: newLockedState }));
    
    const currentAllocations = queryClient.getQueryData<Round5Allocation[]>(["budget", address, roundId]);
    if (currentAllocations) {
      const updatedAllocation = currentAllocations.find(a => a.category_slug === categoryId);
      if (updatedAllocation) {
        await saveAllocation.mutateAsync({
          ...updatedAllocation,
          locked: newLockedState
        });
      }
    }
  };

  return {
    getBudget,
    saveAllocation,
    submitBudget,
    lockedFields,
    toggleLock,
  };
}
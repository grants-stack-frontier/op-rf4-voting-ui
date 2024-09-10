// useBudgetForm.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { request } from "@/lib/request";
import { agoraRoundsAPI } from "@/config";
import { useState } from "react";

export type CategoryId =
  | "ETHEREUM_CORE_CONTRIBUTIONS"
  | "OP_STACK_RESEARCH_AND_DEVELOPMENT"
  | "OP_STACK_TOOLING";

export type Round5Allocation = {
  category_slug: CategoryId;
  allocation: string;
  locked: boolean;
};

export function useBudgetForm(roundId: string) {
  const { toast } = useToast();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});

  const getBudget = useQuery({
    enabled: Boolean(address),
    queryKey: ["budget", address, roundId],
    queryFn: async () =>
      request
        .get(
          `${agoraRoundsAPI}/ballots/${address}/categories`
        )
        .json<Round5Allocation[]>()
        .then((allocations) => {
          setLockedFields(
            allocations.reduce((acc, allocation) => {
              acc[allocation.category_slug] = allocation.locked;
              return acc;
            }, {} as Record<string, boolean>)
          );
          return allocations;
        }),
  });

  const saveAllocation = useMutation({
    mutationKey: ["save-budget", roundId],
    mutationFn: async (allocation: Round5Allocation) => {
      return request
        .post(
          `${agoraRoundsAPI}/ballots/${address}/categories`,
          {
            json: allocation,
          }
        )
        .json<Round5Allocation[]>()
        .then((r) => {
          queryClient.setQueryData(["budget", address, roundId], r);
          return r;
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
      const promises = allocations.map(allocation =>
        request
          .post(
            `${agoraRoundsAPI}/ballots/${address}/categories`,
            {
              json: allocation,
            }
          )
          .json()
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
"use client";

import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { agoraRoundsAPI } from "@/config";

import { useAccount, useSignMessage } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { request } from "@/lib/request";
import { ProjectAllocation } from "./useMetrics";
import debounce from "lodash.debounce";
import { useRef } from "react";
import { useBallotContext } from "@/components/ballot/provider";

export type CategoryId =
  | "ETHEREUM_CORE_CONTRIBUTIONS"
  | "OP_STACK_RESEARCH_AND_DEVELOPMENT"
  | "OP_STACK_TOOLING";

export type Round5Allocation = {
  category_slug: CategoryId;
  allocation: number;
  locked: boolean;
};

export type Round5ProjectAllocation = {
  project_id: string;
  name: string;
  image: string;
  position: number;
  allocation: number;
  impact: number;
};

export type Round5BallotStatus = "NOT STARTED" | "RANKED" | "PENDING SUBMISSION" | "SUBMITTED";

export type Round5Ballot = {
  address: string;
  round_id: number;
  status: Round5BallotStatus;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  category_allocations: Round5Allocation[];
  projects_allocations: Round5ProjectAllocation[];
  projects_to_be_evaluated: string[];
  total_projects: number;
  distribution_method?: string;
}

export function useRound5Ballot(address?: string) {
  return useQuery({
    enabled: Boolean(address),
    queryKey: ["ballot-round5", address],
    queryFn: async () =>
      request
        .get(`${agoraRoundsAPI}/ballots/${address}`)
        .json<Round5Ballot>()
        .then((r) => r ?? null),
  });
}

export function useSaveRound5Allocation() {
  const { toast } = useToast();
  const { address } = useAccount();

  const queryClient = useQueryClient();

  const debounceToast = useRef(
    debounce(
      () => toast({ title: "Your ballot is saved automatically" }),
      2000,
      { leading: true, trailing: false }
    )
  ).current;

  return useMutation({
    mutationKey: ["save-ballot"],
    mutationFn: async (allocation: Round5Allocation) => {
      return request
        .post(`${agoraRoundsAPI}/ballots/${address}/categories`, {
          json: { ...allocation, category_slug: allocation["category_slug"] },
        })
        .json<Round5Ballot[]>()
        .then((r) => {
          queryClient.setQueryData(["ballot-round5", address], r?.[0]);
          return r;
        });
    },
    // onSuccess: debounceToast,
    onError: () =>
      toast({ variant: "destructive", title: "Error saving ballot" }),
  });
}

export function useSubmitBallot({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const { address } = useAccount();
  const { refetch } = useRound5Ballot(address);
  const { signMessageAsync } = useSignMessage();
  return useMutation({
    mutationFn: async () => {
      const { data: ballot } = await refetch();
      const allocations = ballot?.category_allocations.map((alloc: any) => ({
        [alloc.category_slug]: alloc.allocation,
      }));
      const ballot_content = {
        allocations,
      };
      const signature = await signMessageAsync({
        message: JSON.stringify(ballot_content),
      });

      return request
        .post(`${agoraRoundsAPI}/ballots/${address}/submit`, {
          json: {
            address,
            ballot_content,
            signature,
          },
        })
        .json();
    },
    onSuccess,
    onError: () =>
      toast({ variant: "destructive", title: "Error publishing ballot" }),
  });
}

export function useDistributionMethod(params: { distribution_method: string }) {
  const { distribution_method } = params;
  const { address } = useAccount();
  return useQuery({
    enabled: Boolean(address),
    queryKey: ["distribution-method", address],
    queryFn: async () =>
      request.post(`${agoraRoundsAPI}/ballots/${address}/distribution_method`, {
        json: { distribution_method },
      }).json(),
  });
}

export function useIsSavingRound5Ballot() {
  return Boolean(useIsMutating({ mutationKey: ["save-ballot"] }));
}

export function useRound5BallotWeightSum() {
  const { ballot } = useBallotContext();
  return Math.round(
    ballot?.allocations.reduce((sum, x) => (sum += Number(x.allocation)), 0) ??
      0
  );
}

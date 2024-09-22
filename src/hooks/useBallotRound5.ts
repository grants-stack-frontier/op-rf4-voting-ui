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
import debounce from "lodash.debounce";
import { useRef } from "react";
import { useBallotRound5Context } from "@/components/ballot/provider5";
import { CategoryId } from "@/types/shared";
import { Loader2 } from "lucide-react";
import { RetroFunding5BallotSubmissionContent } from "@/__generated__/api/agora.schemas";
import { submitRetroFundingBallot } from "@/__generated__/api/agora";


export type Round5CategoryAllocation = {
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
  category_allocations: Round5CategoryAllocation[];
  project_allocations: Round5ProjectAllocation[];
  projects_to_be_evaluated: string[];
  total_projects: number;
  distribution_method?: string;
  budget?: number;
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
    mutationKey: ["save-round5-ballot"],
    mutationFn: async (allocation: {project_id: string, allocation: number}) => {
      const res = await request
        .post(`${agoraRoundsAPI}/ballots/${address}/projects/${allocation.project_id}/allocation/${allocation.allocation}`, {})
        .json<Round5Ballot>()
        .then((r) => {
          queryClient.setQueryData(["ballot-round5", address], r);
          return r;
        });
        console.log("Allocation response:", res);
        return res;
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
      const ballot_content: RetroFunding5BallotSubmissionContent = {
        budget: ballot?.budget,
        category_allocation: ballot?.category_allocations.map(({ category_slug, allocation, locked }) => ({
          category_slug,
          allocation,
          locked,
        })),
        projects_allocation: ballot?.project_allocations.map(({ project_id, allocation, impact }) => ({
          project_id,
          allocation,
          impact,
        }))
      };
      const signature = await signMessageAsync({
        message: JSON.stringify(ballot_content),
      });

      return await submitRetroFundingBallot(5, address!, {
        address,
        ballot_content,
        signature,
      });

      // return request
      //   .post(`${agoraRoundsAPI}/ballots/${address}/submit`, {
      //     json: {
      //       address,
      //       ballot_content,
      //       signature,
      //     },
      //   })
      //   .json();
    },
    onSuccess,
    onError: () =>
      toast({ variant: "destructive", title: "Error publishing ballot" }),
  });
}

export function useSaveRound5Position() {
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
    mutationKey: ["save-round5-position"],
    mutationFn: async (project: {id: string, position: number}) => {
      return request
        .post(`${agoraRoundsAPI}/ballots/${address}/projects/${project.id}/position/${project.position}`, {})
        .json<Round5Ballot>()
        // .then((r) => {
        //   queryClient.setQueryData(["ballot-round5", address], r);
        //   return r;
        // });
    },
    // onSuccess: debounceToast,
    onError: () =>
      toast({ variant: "destructive", title: "Error saving ballot" }),
  });
}

export enum DistributionMethod {
  TOP_TO_BOTTOM = "TOP_TO_BOTTOM",
  IMPACT_GROUPS = "IMPACT_GROUPS",
  TOP_WEIGHTED = "TOP_WEIGHTED",
  CUSTOM = "CUSTOM",
}

export function saveDistributionMethodToLocalStorage(method: DistributionMethod|string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('distributionMethod', method);
  }
};

export function getDistributionMethodFromLocalStorage(): DistributionMethod | string | null {
  if (typeof window !== 'undefined') {
    const savedMethod = localStorage.getItem('distributionMethod');
    return savedMethod as DistributionMethod | null;
  }
  return null;
};

export function useDistributionMethodFromLocalStorage() {
  const queryClient = useQueryClient();

  const getDistributionMethod = useQuery({
    queryKey: ['distribution-method-local-storage'],
    queryFn: () => getDistributionMethodFromLocalStorage(),
    initialData: getDistributionMethodFromLocalStorage,
  });

  const update = useMutation({
    mutationKey: ['update-distribution-method-local-storage'],
    mutationFn: async (method: DistributionMethod) => {
      saveDistributionMethodToLocalStorage(method);
      queryClient.setQueryData(["distribution-method-local-storage"], method);
    },
  });

  return {
    ...getDistributionMethod,
    update: update.mutate,
  };
}


export function useDistributionMethod() {
  const { address } = useAccount();
  // return useQuery({
  //   enabled: Boolean(address),
  //   queryKey: ["distribution-method", address],
  //   queryFn: async () =>
  //     request.post(`${agoraRoundsAPI}/ballots/${address}/distribution_method`, {
  //       json: { distribution_method },
  //     }).json(),
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationKey: ["save-round5-distribution-method"],
    mutationFn: async (distribution_method: DistributionMethod) => {
      const res = await request
        .post(`${agoraRoundsAPI}/ballots/${address}/distribution_method/${distribution_method}`, {})
        .json<Round5Ballot>()
        .then((r) => {
          console.log("Distribution method response:", r);
          queryClient.setQueryData(["ballot-round5", address], r);
          return r;
        });
        return res;
    },
    // onSuccess: debounceToast,
    onMutate: () => toast({
      title: "Loading...",
    }),
    onError: () =>
      toast({ variant: "destructive", title: "Error setting distribution method" }),
  });
}

export function useIsSavingRound5Ballot() {
  return Boolean(useIsMutating({ mutationKey: ["save-round5-ballot"] }));
}

export function useRound5BallotWeightSum() {
  const { ballot } = useBallotRound5Context();
  return Math.round(
    ballot?.project_allocations?.reduce((sum, x) => (sum += Number(x.allocation)), 0) ??
      0
  );
}

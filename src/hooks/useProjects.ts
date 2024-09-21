"use client";

import {
  getRetroFundingRoundProjectById,
  getRetroFundingRoundProjectByIdResponse,
  getRetroFundingRoundProjects,
  getRetroFundingRoundProjectsResponse,
  updateRetroFundingRoundProjectImpact,
  updateRetroFundingRoundProjects,
} from "@/__generated__/api/agora";
import {
  GetRetroFundingRoundProjectsCategory,
  PageMetadata,
  Project,
  UpdateRetroFundingRoundProjectsBody,
  UpdateRetroFundingRoundProjectsBodyProjectsItem,
} from "@/__generated__/api/agora.schemas";
import { CategoryType } from "@/data/categories";
import { CategoryId } from "@/types/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { ImpactScore } from "./useProjectScoring";
import { toast } from "@/components/ui/use-toast";

export const categoryMap: Record<CategoryType, string> = {
  ETHEREUM_CORE_CONTRIBUTIONS: "eth_core",
  OP_STACK_RESEARCH_AND_DEVELOPMENT: "op_rnd",
  OP_STACK_TOOLING: "op_tooling",
};

export type ProjectsResponse = {
  metadata?: PageMetadata;
  data?: Project[];
};

export interface ProjectsParams {
  limit?: number;
  offset?: number;
  category?: GetRetroFundingRoundProjectsCategory;
}

export function useProjects(params?: ProjectsParams) {
  const { limit, offset, category } = params ?? {};
  return useQuery({
    queryKey: ["projects", limit, offset, category],
    queryFn: async () => {
      if (limit !== undefined) {
        const results: getRetroFundingRoundProjectsResponse =
          await getRetroFundingRoundProjects(5, {
            limit,
            offset,
            category: category ?? "all",
          });
        return results.data?.projects ?? [];
      } else {
        const allProjects: Project[] = [];
        let currentOffset = offset ?? 0;
        const pageLimit = 100;

        while (true) {
          const results: getRetroFundingRoundProjectsResponse =
            await getRetroFundingRoundProjects(5, {
              limit: pageLimit,
              offset: currentOffset,
              category: category ?? "all",
            });

          const res: ProjectsResponse = results.data;

          if (!res.data || res.data.length === 0) {
            break;
          }

          allProjects.push(...res.data);
          currentOffset += pageLimit;

          if (res.data.length < pageLimit) {
            break;
          }
        }

        return allProjects;
      }
    },
  });
}

export function useProjectsByCategory(categoryId: CategoryId) {
  return useQuery({
    queryKey: ["projects-by-category", categoryId],
    queryFn: async () =>
      getRetroFundingRoundProjects(5, {
        limit: 100,
        category: categoryMap[
          categoryId
        ] as GetRetroFundingRoundProjectsCategory,
      }).then((results: getRetroFundingRoundProjectsResponse) => {
        const res: ProjectsResponse = results.data;
        return res.data;
      }),
  });
}

export function useSaveProjectImpact() {
  const { address } = useAccount();
  return useMutation({
    mutationKey: ["save-project-impact"],
    mutationFn: async ({
      projectId,
      impact,
    }: {
      projectId: string;
      impact: ImpactScore;
    }) => {
      return updateRetroFundingRoundProjectImpact(
        5,
        address as string,
        projectId,
        impact as number
      );
    },
  });
}

export function useSaveProjects() {
  const {address} = useAccount()
  return useMutation({
    mutationKey: ["save-projects"],
    mutationFn: async (projects: {
      project_id: string,
      allocation: number,
      impact: ImpactScore
    }[]) => {
      return updateRetroFundingRoundProjects(
        5, 
        address as string, 
        {
          projects: projects.map(p => ({
            project_id: p.project_id,
            allocation: p.allocation.toString(),
            impact: p.impact
          })) as UpdateRetroFundingRoundProjectsBodyProjectsItem[]
        }
      )
    },
    onMutate: () => {
      toast({ title: "Saving projects..." });
    },
    onError: () =>
      toast({ variant: "destructive", title: "Error saving projects" }),
  });
}


export function useProjectById(projectId: string) {
  return useQuery({
    queryKey: ["projects-by-id", projectId],
    queryFn: async () =>
      getRetroFundingRoundProjectById(5, projectId).then(
        (results: getRetroFundingRoundProjectByIdResponse) => {
          return results.data;
        }
      ),
  });
}

export function useAllProjectsByCategory() {
  return useQuery({
    queryKey: ["all-projects-by-category"],
    queryFn: async () => {
      const categories = Object.values(categoryMap);
      const projectsByCategory: Record<string, Project[]> = {};

      for (const category of categories) {
        let allProjects: Project[] = [];
        let currentOffset = 0;
        const pageLimit = 100;

        while (true) {
          const results: getRetroFundingRoundProjectsResponse =
            await getRetroFundingRoundProjects(5, {
              limit: pageLimit,
              offset: currentOffset,
              category: category as GetRetroFundingRoundProjectsCategory,
            });

          const res: ProjectsResponse = results.data;

          if (!res.data || res.data.length === 0) {
            break;
          }

          allProjects.push(...res.data);
          currentOffset += pageLimit;

          if (res.data.length < pageLimit) {
            break;
          }
        }

        projectsByCategory[category] = allProjects;
      }

      return projectsByCategory;
    },
  });
}

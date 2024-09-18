'use client';

import {
	getRetroFundingRoundProjectById,
	getRetroFundingRoundProjectByIdResponse,
	getRetroFundingRoundProjects,
	getRetroFundingRoundProjectsResponse,
	updateRetroFundingRoundProjectImpact,
} from '@/__generated__/api/agora';
import { GetRetroFundingRoundProjectsCategory, PageMetadata, Project, RetroFundingBallotCategoriesAllocationCategorySlug } from '@/__generated__/api/agora.schemas';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { ImpactScore } from './useProjectScoring';
import { CategoryType } from '@/data/categories';
import { CategoryId } from '@/types/shared';

const categoryMap: Record<CategoryType, string> = {
	ETHEREUM_CORE_CONTRIBUTIONS: 'eth_core',
	OP_STACK_RESEARCH_AND_DEVELOPMENT: 'op_tooling',
	OP_STACK_TOOLING: 'op_rnd',
};

export type ProjectsResponse = {
	metadata?: PageMetadata;
	data?: Project[];
};

export function useProjects() {
	return useQuery({
		queryKey: ['projects'],
		queryFn: async () =>
			getRetroFundingRoundProjects(5, { limit: 100 }).then((results: getRetroFundingRoundProjectsResponse) => {
				const res: ProjectsResponse = results.data;
				return res.data;
			}),
	});
}

export function useProjectsByCategory(categoryId: CategoryId) {
	return useQuery({
		queryKey: ['projects-by-category', categoryId],
		queryFn: async () =>
			getRetroFundingRoundProjects(5, { limit: 100, category: categoryMap[categoryId] as GetRetroFundingRoundProjectsCategory }).then((results: getRetroFundingRoundProjectsResponse) => {
				const res: ProjectsResponse = results.data;
				return res.data;
			}),
	});
}

export function useSaveProjectImpact() {
	const { address } = useAccount();
	return useMutation({
		mutationKey: ['save-project-impact'],
		mutationFn: async ({ projectId, impact }: { projectId: string; impact: ImpactScore }) => {
			return updateRetroFundingRoundProjectImpact(5, address as string, projectId, impact as number);
		},
	});
}

export function useProjectById(projectId: string) {
	return useQuery({
		queryKey: ['projects-by-id', projectId],
		queryFn: async () =>
			// getRetroFundingRoundProjects(5).then((results: getProjectsResponse) => {
			// 	const res: ProjectsResponse = results.data;
			// 	const filtered = res.data?.filter((p) => p.projectId === projectId);
			// 	return filtered?.[0];
			// }),
      getRetroFundingRoundProjectById(5, projectId).then((results: getRetroFundingRoundProjectByIdResponse) => {
				return results.data;
			}),
	});
}

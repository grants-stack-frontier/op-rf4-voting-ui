'use client';

import {
	getProjectsResponse,
	getRetroFundingRoundProjects,
	getRetroFundingRoundProjectsResponse,
	updateRetroFundingRoundProjectImpact,
} from '@/__generated__/api/agora';
import { PageMetadata, Project } from '@/__generated__/api/agora.schemas';
import { toast } from '@/components/ui/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { ImpactScore } from './useProjectScoring';

export type ProjectsResponse = {
	metadata?: PageMetadata;
	data?: Project[];
};

export function useProjects() {
	return useQuery({
		queryKey: ['projects'],
		queryFn: async () =>
			getRetroFundingRoundProjects(5).then((results: getRetroFundingRoundProjectsResponse) => {
				const res: ProjectsResponse = results.data;
				return res.data;
			}),
	});
}

export function useSaveProjectImpact() {
	const { address } = useAccount();
	return useMutation({
		mutationKey: ['save-impact'],
		mutationFn: async ({ projectId, impact }: { projectId: string; impact: ImpactScore }) => {
			return updateRetroFundingRoundProjectImpact(5, address as string, projectId, impact as number);
		},
		onError: () => toast({ variant: 'destructive', title: 'Error saving ballot' }),
	});
}

export function useProjectsByCategory(categoryId: string) {
	return useQuery({
		queryKey: ['projects-by-category', categoryId],
		queryFn: async () =>
			getRetroFundingRoundProjects(5).then((results: getRetroFundingRoundProjectsResponse) => {
				const res: ProjectsResponse = results.data;
				return res.data?.filter((p) => p.applicationCategory === categoryId);
			}),
	});
}

export function useProjectById(projectId: string) {
	return useQuery({
		queryKey: ['projects-by-id', projectId],
		queryFn: async () =>
			getRetroFundingRoundProjects(5).then((results: getProjectsResponse) => {
				const res: ProjectsResponse = results.data;
				const filtered = res.data?.filter((p) => p.projectId === projectId);
				return filtered?.[0];
			}),
	});
}

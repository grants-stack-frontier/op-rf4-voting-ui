'use client';

import { agoraRoundsAPI } from '@/config';
import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/request';

export type Project = {
	id: string;
	name: string;
	category: string;
	organization: {
		name: string;
		profileAvatarUrl: string;
	} | null;
	description: string;
	profileAvatarUrl: string;
	projectCoverImageUrl: string;
	socialLinks: {
		twitter?: string;
		farcaster?: string[];
		mirror?: string;
		website?: string[];
	};
	team: string[];
	github: string[];
	packages: string[];
	links: string[];
	contracts: {
		address: string;
		deploymentTxHash: string;
		deployerAddress: string;
		chainId: number;
	}[];
	grantsAndFunding: {
		ventureFunding: {
			amount: string;
			year: string;
			details: string;
		}[];
		grants: {
			grant: string;
			link: string;
			amount: string;
			date: string;
			details: string;
		}[];
		revenue: {
			amount: string;
			details: string;
		}[];
	};
};

export type ProjectsResponse = {
	metadata: {
		has_next: boolean;
		total_returned: number;
		next_offset: number;
	};
	data: Project[];
};

export function useProjectsByCategory(categoryId: string) {
	return useQuery({
		queryKey: ['category', { categoryId }],
		queryFn: async () => {
			return request.get(`${agoraRoundsAPI}/projects`).json<ProjectsResponse>();
		},
	});
}

export function useProjectById(projectId: string) {
	return useQuery({
		queryKey: ['projectId', { projectId }],
		queryFn: async () => {
			return request.get(`${agoraRoundsAPI}/projects/${projectId}`).json<Project>();
		},
	});
}

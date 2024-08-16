'use client';

import { getProjects, getProjectsResponse } from '@/__generated__/api/agora';
import { GetProjects200 } from '@/__generated__/api/agora.schemas';
import { useQuery } from '@tanstack/react-query';

export function useProjects() {
	return useQuery({
		queryKey: ['projects'],
		queryFn: async () => getProjects(),
	});
}

export function useProjectsByCategory(categoryId: string) {
	console.log({ categoryId });
	return useQuery({
		queryKey: ['projects-by-category', categoryId],
		queryFn: async () =>
			getProjects().then((results: getProjectsResponse) => {
				const res: GetProjects200 = results.data;
				console.log({ res });
				const filtered = res.projects?.filter((p) => p.category === categoryId);
				console.log({ filtered });
				return filtered;
			}),
	});
}

export function useProjectById(projectId: string) {
	return useQuery({
		queryKey: ['projects-by-id', projectId],
		queryFn: async () => getProjects().then((results) => results.data.projects?.filter((p) => p.id === projectId)),
	});
}

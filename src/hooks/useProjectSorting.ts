import { Project } from '@/__generated__/api/agora.schemas';
import { ProjectsScored } from '@/utils/localStorage';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Round5Ballot } from './useBallotRound5';

export function useProjectSorting(
	projects: Project[] | undefined,
	ballot: Round5Ballot | undefined,
	projectsScored: ProjectsScored,
	id: string
) {
	const router = useRouter();

	const sortedProjects = useMemo(() => {
		if (!projects || !ballot) return [];

		return [...projects].sort((a, b) => {
			const aId = a.applicationId ?? '';
			const bId = b.applicationId ?? '';

			const aVoted =
				ballot.project_allocations.some((p) => p.project_id === aId) || projectsScored.votedIds.includes(aId);
			const bVoted =
				ballot.project_allocations.some((p) => p.project_id === bId) || projectsScored.votedIds.includes(bId);

			const aSkipped = projectsScored.skippedIds.includes(aId);
			const bSkipped = projectsScored.skippedIds.includes(bId);

			if ((aVoted || aSkipped) === (bVoted || bSkipped)) return 0;
			if (aVoted || aSkipped) return 1;
			if (bVoted || bSkipped) return -1;
			return 0;
		});
	}, [projects, ballot, projectsScored.votedIds, projectsScored.skippedIds]);

	const isVoted = useMemo(() => {
		if (!ballot || !projects) return false;
		const project = projects.find((p) => p.applicationId === id);
		return (
			ballot.project_allocations.some((p) => p.project_id === project?.applicationId) ||
			projectsScored.votedIds.includes(project?.applicationId ?? id)
		);
	}, [ballot, projects, projectsScored, id]);

	const handleNavigation = useCallback(() => {
		if (sortedProjects.length > 0) {
			const currentIndex = sortedProjects.findIndex((p) => p.applicationId === id);
			let nextIndex = (currentIndex + 1) % sortedProjects.length;

			while (nextIndex !== currentIndex) {
				const nextProject = sortedProjects[nextIndex];
				const nextId = nextProject.applicationId ?? '';
				if (
					!projectsScored.votedIds.includes(nextId) &&
					!projectsScored.skippedIds.includes(nextId) &&
					!ballot?.project_allocations.some((p) => p.project_id === nextId)
				) {
					router.push(`/project/${nextId}`);
					return;
				}
				nextIndex = (nextIndex + 1) % sortedProjects.length;
			}
		}
	}, [sortedProjects, id, projectsScored, ballot, router]);

	return { sortedProjects, isVoted, handleNavigation };
}

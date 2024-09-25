import { Project } from '@/__generated__/api/agora.schemas';
import { ProjectsScored } from '@/utils/localStorage';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Round5Ballot } from './useBallotRound5';

export function useProjectSorting(
  projects: Project[] | undefined,
  ballot: Round5Ballot | undefined,
  projectsScored: ProjectsScored | undefined,
  currentId: string
) {
  const router = useRouter();

  const sortedProjects = useMemo(() => {
    if (!projects || !ballot || !projectsScored) return [];

    return [...projects].sort((a, b) => {
      const aId = a.applicationId ?? '';
      const bId = b.applicationId ?? '';

      const aVoted =
        ballot.project_allocations.some((p) => p.project_id === aId) ||
        projectsScored.votedIds.includes(aId);
      const bVoted =
        ballot.project_allocations.some((p) => p.project_id === bId) ||
        projectsScored.votedIds.includes(bId);

      const aSkipped = projectsScored?.skippedIds?.includes(aId) ?? false;
      const bSkipped = projectsScored?.skippedIds?.includes(bId) ?? false;

      if (aVoted !== bVoted) return aVoted ? 1 : -1;
      if (aSkipped !== bSkipped) return aSkipped ? 1 : -1;
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
  }, [projects, ballot, projectsScored]);

  const isVoted = useMemo(() => {
    if (!ballot || !projects || !projectsScored) return false;
    const project = projects.find((p) => p.applicationId === currentId);
    return (
      ballot.project_allocations.some(
        (p) => p.project_id === project?.applicationId
      ) || projectsScored.votedIds.includes(project?.applicationId ?? currentId)
    );
  }, [ballot, projects, projectsScored, currentId]);

  const handleNavigation = useCallback(() => {
    if (!projectsScored) return;
    if (sortedProjects.length > 0) {
      const nextProject = sortedProjects.find((p) => {
        const nextId = p.applicationId ?? '';
        return (
          nextId !== currentId &&
          !projectsScored?.votedIds?.includes(nextId) &&
          !projectsScored?.skippedIds?.includes(nextId) &&
          !ballot?.project_allocations?.some(
            (allocation) => allocation.project_id === nextId
          )
        );
      });

      if (nextProject) {
        router.push(`/project/${nextProject.applicationId}`);
      } else {
        // If no next project is found, you might want to handle this case
        console.log('No more projects to vote on');
        // Optionally, redirect to a summary page or show a message
      }
    }
  }, [sortedProjects, projectsScored, ballot, router, currentId]);

  return { sortedProjects, isVoted, handleNavigation };
}

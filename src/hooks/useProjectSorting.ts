import { Project } from '@/__generated__/api/agora.schemas';
import { getProjectsSkipped } from '@/utils/localStorage';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Address } from 'viem';
import { Round5Ballot } from './useBallotRound5';

export function useProjectSorting(
  projects: Project[] | undefined,
  ballot: Round5Ballot | undefined,
  currentProject: Project | undefined,
  walletAddress: Address | undefined
) {
  const router = useRouter();
  const projectsSkipped = useMemo(() => {
    if (!walletAddress) return { skippedProjectIds: [] };
    return getProjectsSkipped(
      currentProject?.applicationCategory ?? '',
      walletAddress
    );
  }, [currentProject, walletAddress]);

  const projectsScored = useMemo(() => {
    if (ballot) {
      return {
        total: ballot.total_projects,
        votedCount: ballot.project_allocations?.length,
        allocations: ballot.project_allocations,
        toBeEvaluated: ballot.projects_to_be_evaluated,
      };
    }
    return {
      total: 0,
      votedCount: 0,
      allocations: [],
      toBeEvaluated: 0,
    };
  }, [ballot]);

  const sortedProjects = useMemo(() => {
    if (!projects || !ballot || !projectsScored) return [];

    return [...projects].sort((a, b) => {
      const aId = a.applicationId ?? '';
      const bId = b.applicationId ?? '';

      const aVoted = projectsScored.allocations.some(
        (p) => p.project_id === aId
      );
      const bVoted = projectsScored.allocations.some(
        (p) => p.project_id === bId
      );

      const aSkipped =
        projectsSkipped.skippedProjectIds?.includes(aId) ?? false;
      const bSkipped =
        projectsSkipped.skippedProjectIds?.includes(bId) ?? false;

      if (aVoted !== bVoted) return aVoted ? 1 : -1;
      if (aSkipped !== bSkipped) return aSkipped ? 1 : -1;
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
  }, [projects, ballot, projectsScored, projectsSkipped]);

  const isVoted = useMemo(() => {
    if (!ballot || !projects || !projectsScored) return false;
    const project = projects.find(
      (p) => p.applicationId === currentProject?.applicationId
    );
    return ballot.project_allocations.some(
      (p) => p.project_id === project?.applicationId
    );
  }, [ballot, projects, projectsScored, currentProject]);

  const handleNavigation = useCallback(() => {
    if (!projectsScored) return;
    if (sortedProjects.length > 0) {
      const nextProject = sortedProjects.find((p) => {
        const nextId = p.applicationId ?? '';
        return (
          nextId !== currentProject?.applicationId &&
          !projectsScored.allocations.some(
            (allocation) => allocation.project_id === nextId
          )
        );
      });

      if (nextProject) {
        router.push(`/project/${nextProject.applicationId}`);
      } else {
        // If no next project is found, you might want to handle this case
        // Optionally, redirect to a summary page or show a message
      }
    }
  }, [sortedProjects, projectsScored, router, currentProject]);

  return { sortedProjects, isVoted, handleNavigation };
}

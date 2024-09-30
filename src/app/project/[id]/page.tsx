'use client';
import { useBallotRound5Context } from '@/components/ballot/provider5';
import { UnlockBallotDialog } from '@/components/ballot/unlock-ballot';
import { LoadingDialog } from '@/components/common/loading-dialog';
import { PageView } from '@/components/common/page-view';
import { ProjectDetails } from '@/components/project-details';
import { ProjectBreadcrumb } from '@/components/project-details/project-breadcrumb';
import { ReviewSidebar } from '@/components/project-details/review-sidebar';
import { useSession } from '@/hooks/useAuth';
import { ImpactScore, useProjectScoring } from '@/hooks/useProjectScoring';
import { useProjectSorting } from '@/hooks/useProjectSorting';
import { useProjectById, useProjectsByCategory } from '@/hooks/useProjects';
import { CategoryId } from '@/types/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data: session } = useSession();
  const { data: project, isPending: isProjectLoading } = useProjectById(id);
  const { data: projects, isPending: isProjectsLoading } =
    useProjectsByCategory(project?.applicationCategory as CategoryId);
  const { ballot } = useBallotRound5Context();
  const { address } = useAccount();

  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
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

  const currentProject = useMemo(
    () => (project ? { ...project } : undefined),
    [project]
  );

  const walletAddress: Address | undefined = useMemo(
    () => session?.siwe?.address,
    [session?.siwe?.address]
  );
  const userCategory: CategoryId | undefined = useMemo(
    () => session?.category as CategoryId | undefined,
    [session?.category]
  );
  const isUserCategory = useMemo(
    () =>
      !!userCategory &&
      !!project?.applicationCategory &&
      userCategory === project?.applicationCategory,
    [userCategory, project?.applicationCategory]
  );

  const { allProjectsScored, handleScoreSelect, isSaving } = useProjectScoring(
    currentProject?.applicationCategory ?? '',
    currentProject?.applicationId ?? '',
    walletAddress,
    ballot
  );

  const { sortedProjects, isVoted, handleNavigation } = useProjectSorting(
    projects,
    ballot,
    currentProject,
    walletAddress
  );

  const isLastProject = useMemo(() => {
    if (!projectsScored || !sortedProjects) return false;
    return projectsScored.votedCount === sortedProjects.length - 1;
  }, [projectsScored, sortedProjects]);

  useEffect(() => {
    if (address && allProjectsScored) {
      const dialogShown = localStorage.getItem(
        `unlock_dialog_shown_${address}`
      );
      const ballotUnlocked = localStorage.getItem(`ballot_unlocked_${address}`);
      if (!dialogShown && !ballotUnlocked) {
        setShowUnlockDialog(true);
        localStorage.setItem(`unlock_dialog_shown_${address}`, 'true');
      }
    }
  }, [address, allProjectsScored]);

  const handleScore = useCallback(
    async (score: ImpactScore) => {
      const { allProjectsScored } = await handleScoreSelect(score);

      if (isLastProject || allProjectsScored) {
        const dialogShown = localStorage.getItem(
          `unlock_dialog_shown_${address}`
        );
        const ballotUnlocked = localStorage.getItem(
          `ballot_unlocked_${address}`
        );
        if (!dialogShown && !ballotUnlocked) {
          setShowUnlockDialog(true);
          localStorage.setItem(`unlock_dialog_shown_${address}`, 'true');
        } else {
          handleNavigation();
        }
      } else {
        handleNavigation();
      }
    },
    [handleScoreSelect, handleNavigation, isLastProject, address]
  );

  const currentProjectScore = useMemo(() => {
    if (!ballot || !currentProject) return undefined;
    const allocation = ballot.project_allocations?.find(
      (p) => p.project_id === currentProject.applicationId
    );
    return allocation ? (allocation.impact as ImpactScore) : undefined;
  }, [ballot, currentProject]);

  const isLoading = useMemo(
    () => isProjectsLoading || isProjectLoading || !currentProject || !projects,
    [isProjectsLoading, isProjectLoading, currentProject, projects]
  );

  if (isLoading) {
    return (
      <LoadingDialog
        isOpen={true}
        setOpen={() => {}}
        message="Loading project"
      />
    );
  }

  return (
    <div className="flex gap-12 mx-auto">
      <section className="flex-1 max-w-[720px]">
        <ProjectBreadcrumb id={id} />
        <UnlockBallotDialog
          isOpen={showUnlockDialog}
          setOpen={setShowUnlockDialog}
        />
        <ProjectDetails data={currentProject} isPending={isLoading} />
        <PageView title={'project-details'} />
      </section>
      {isUserCategory && walletAddress && !showUnlockDialog && (
        <aside className="max-w-[304px]">
          <ReviewSidebar
            onScoreSelect={handleScore}
            isLoading={isLoading}
            isSaving={isSaving}
            isVoted={isVoted}
            currentProjectScore={currentProjectScore}
          />
        </aside>
      )}
    </div>
  );
}

'use client';
import { useBallotRound5Context } from '@/components/ballot/provider5';
import { UnlockBallotDialog } from '@/components/ballot/unlock-ballot';
import { ConflictOfInterestDialog } from '@/components/common/conflict-of-interest-dialog';
import { LoadingDialog } from '@/components/common/loading-dialog';
import { PageView } from '@/components/common/page-view';
import { ProjectDetails } from '@/components/project-details';
import { ProjectBreadcrumb } from '@/components/project-details/project-breadcrumb';
import { ReviewSidebar } from '@/components/project-details/review-sidebar';
import { useSession } from '@/hooks/useAuth';
import { useConflictOfInterest } from '@/hooks/useConflictOfInterest';
import { ImpactScore, useProjectScoring } from '@/hooks/useProjectScoring';
import { useProjectSorting } from '@/hooks/useProjectSorting';
import { useProjectById, useProjectsByCategory } from '@/hooks/useProjects';
import { CategoryId } from '@/types/shared';
import { ProjectsScored } from '@/utils/localStorage';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { data: session } = useSession();
  const { data: project, isPending: isProjectLoading } = useProjectById(id);
  const { data: projects, isPending: isProjectsLoading } =
    useProjectsByCategory(project?.applicationCategory as CategoryId);
  const { ballot } = useBallotRound5Context();
  const { address } = useAccount();

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

  const [projectsScored, setProjectsScored] = useState<
    ProjectsScored | undefined
  >(undefined);

  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  const {
    allProjectsScored,
    handleScoreSelect,
    isLoading: isProjectScoringLoading,
    isSaving,
  } = useProjectScoring(
    currentProject?.applicationCategory ?? '',
    currentProject?.applicationId ?? '',
    walletAddress,
    ballot?.project_allocations,
    projects,
    projectsScored,
    setProjectsScored
  );

  const { sortedProjects, isVoted } = useProjectSorting(
    projects,
    ballot,
    projectsScored,
    currentProject?.applicationId ?? id
  );

  useEffect(() => {
    if (address && allProjectsScored) {
      const ballotUnlocked =
        localStorage.getItem(`ballot_unlocked_${address}`) === 'true';
      if (!ballotUnlocked) {
        setShowUnlockDialog(true);
      }
    }
  }, [address, allProjectsScored]);

  const votedCount = useMemo(() => {
    if (!projectsScored || !ballot || !projects) return 0;
    const ballotAllocationsCount = ballot.project_allocations?.length ?? 0;
    const scoredCount = projectsScored.votedCount ?? 0;
    // Use the maximum of scored count and ballot allocations
    return Math.max(scoredCount, ballotAllocationsCount);
  }, [ballot, projectsScored, projects]);

  const handleNavigation = useCallback(() => {
    if (sortedProjects.length > 0 && projectsScored) {
      // First, try to find a project that hasn't been voted or skipped
      let nextProject = sortedProjects.find((p) => {
        const nextId = p.applicationId ?? '';
        return (
          nextId !== currentProject?.applicationId &&
          !projectsScored?.votedIds?.includes(nextId) &&
          !projectsScored?.skippedIds?.includes(nextId) &&
          !ballot?.project_allocations?.some(
            (allocation) => allocation.project_id === nextId
          )
        );
      });

      if (!nextProject) {
        // If no unvoted and unskipped projects, try to find a skipped project
        nextProject = sortedProjects.find((p) => {
          const nextId = p.applicationId ?? '';
          return (
            nextId !== currentProject?.applicationId &&
            projectsScored?.skippedIds?.includes(nextId)
          );
        });
      }

      if (nextProject) {
        router.push(`/project/${nextProject.applicationId}`);
      } else {
        console.log('No more projects to vote on');
      }
    }
  }, [sortedProjects, projectsScored, ballot, router, currentProject]);

  const handleScore = useCallback(
    async (score: ImpactScore) => {
      await handleScoreSelect(score);
      handleNavigation();
    },
    [handleScoreSelect, handleNavigation]
  );

  const {
    isConflictOfInterestDialogOpen,
    setIsConflictOfInterestDialogOpen,
    handleConflictOfInterestConfirm,
  } = useConflictOfInterest(handleScore);

  const currentProjectScore = useMemo(() => {
    if (!ballot || !currentProject) return undefined;
    const allocation = ballot.project_allocations?.find(
      (p) => p.project_id === currentProject.applicationId
    );
    return allocation ? (allocation.impact as ImpactScore) : undefined;
  }, [ballot, currentProject]);

  const isLoading = useMemo(
    () =>
      isProjectsLoading ||
      isProjectLoading ||
      !currentProject ||
      isProjectScoringLoading ||
      !projects,
    [
      isProjectsLoading,
      isProjectLoading,
      currentProject,
      isProjectScoringLoading,
      projects,
    ]
  );

  if (isLoading) {
    return (
      <LoadingDialog
        isOpen={true}
        setOpen={() => { }}
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
        <ConflictOfInterestDialog
          isOpen={isConflictOfInterestDialogOpen}
          setOpen={setIsConflictOfInterestDialogOpen}
          onConfirm={handleConflictOfInterestConfirm}
        />
        <ProjectDetails data={currentProject} isPending={isLoading} />
        <PageView title={'project-details'} />
      </section>
      {isUserCategory && walletAddress && !showUnlockDialog && (
        <aside className="max-w-[304px]">
          <ReviewSidebar
            onScoreSelect={handleScore}
            onConflictOfInterest={setIsConflictOfInterestDialogOpen}
            votedCount={votedCount}
            totalProjects={sortedProjects.length}
            isLoading={isProjectScoringLoading}
            isSaving={isSaving}
            isVoted={isVoted}
            currentProjectScore={currentProjectScore}
          />
        </aside>
      )}
    </div>
  );
}

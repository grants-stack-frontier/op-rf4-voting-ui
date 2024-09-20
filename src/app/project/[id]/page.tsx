"use client";
import { useBallotRound5Context } from "@/components/ballot/provider5";
import { UnlockBallotDialog } from "@/components/ballot/unlock-ballot";
import { ConflictOfInterestDialog } from "@/components/common/conflict-of-interest-dialog";
import { LoadingDialog } from "@/components/common/loading-dialog";
import { PageView } from "@/components/common/page-view";
import { ProjectDetails } from "@/components/project-details";
import { ProjectBreadcrumb } from "@/components/project-details/project-breadcrumb";
import { ProjectReview } from "@/components/project-details/project-review";
import { useSession } from "@/hooks/useAuth";
import { useConflictOfInterest } from "@/hooks/useConflictOfInterest";
import { ImpactScore } from "@/hooks/useProjectImpact";
import { useProjectScoring } from "@/hooks/useProjectScoring";
import { useProjectSorting } from "@/hooks/useProjectSorting";
import { useProjectById, useProjectsByCategory } from "@/hooks/useProjects";
import { CategoryId } from "@/types/shared";
import { useMemo } from "react";
import { Address } from "viem";

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
	const { id } = params;
	const { data: session } = useSession();
	const { data: project, isPending: isProjectLoading } = useProjectById(id);
	const { data: projects, isPending: isProjectsLoading } = useProjectsByCategory(project?.applicationCategory as CategoryId);
	const { ballot } = useBallotRound5Context();

	const currentProject = useMemo(() => project ? { ...project } : undefined, [project]);
	const walletAddress: Address | undefined = useMemo(() => session?.siwe?.address, [session?.siwe?.address]);
	const userCategory: CategoryId | undefined = useMemo(() => session?.category as CategoryId | undefined, [session?.category]);
	const isUserCategory = useMemo(() => !!userCategory && !!project?.applicationCategory && userCategory === project?.applicationCategory, [userCategory, project?.applicationCategory]);

	const { projectsScored, isUnlocked, setIsUnlocked, handleScoreSelect } = useProjectScoring(
		currentProject?.applicationCategory ?? '',
		currentProject?.applicationId ?? '',
		walletAddress
	);

	const { sortedProjects, isVoted, handleNavigation } = useProjectSorting(
		projects,
		ballot,
		projectsScored,
		currentProject?.applicationId ?? id
	);
	const { isConflictOfInterestDialogOpen, setIsConflictOfInterestDialogOpen, handleConflictOfInterestConfirm } = useConflictOfInterest(projectsScored.votedCount, handleScoreSelect);

	const currentProjectScore = useMemo(() => {
		if (!ballot || !currentProject) return undefined;
		const allocation = ballot.project_allocations.find(p => p.project_id === currentProject.applicationId);
		return allocation ? allocation.impact as ImpactScore : undefined;
	}, [ballot, currentProject]);

	const isLoading = useMemo(() => isProjectsLoading || isProjectLoading || !currentProject, [isProjectsLoading, isProjectLoading, currentProject]);

	if (isLoading) {
		return <LoadingDialog isOpen={true} setOpen={() => { }} message="Loading project" />;
	}

	return (
		<div className="flex gap-12 mx-auto">
			<section className="flex-1 max-w-[720px]">
				<ProjectBreadcrumb id={id} />
				<UnlockBallotDialog isOpen={isUnlocked} setOpen={setIsUnlocked} />
				<ConflictOfInterestDialog
					isOpen={isConflictOfInterestDialogOpen}
					setOpen={setIsConflictOfInterestDialogOpen}
					onConfirm={handleConflictOfInterestConfirm}
				/>
				<ProjectDetails data={currentProject} isPending={isLoading} />
				<PageView title={'project-details'} />
			</section>
			{isUserCategory && walletAddress && (
				<aside className="max-w-[304px]">
					<ProjectReview
						onScoreSelect={handleScoreSelect}
						onConflictOfInterest={setIsConflictOfInterestDialogOpen}
						projectsScored={projectsScored}
						totalProjects={sortedProjects.length}
						isVoted={isVoted}
						handleNavigation={handleNavigation}
						currentProject={currentProject}
						walletAddress={walletAddress}
						currentProjectScore={currentProjectScore}
					/>
				</aside>
			)}
		</div>
	);
}

"use client";
import { Project } from "@/__generated__/api/agora.schemas";
import { useBallotRound5Context } from "@/components/ballot/provider5";
import { UnlockBallotDialog } from "@/components/ballot/unlock-ballot";
import { ConflictOfInterestDialog } from "@/components/common/conflict-of-interest-dialog";
import { LoadingDialog } from "@/components/common/loading-dialog";
import { PageView } from "@/components/common/page-view";
import { ProjectDetails } from "@/components/project-details";
import { ReviewSidebar } from "@/components/project-details/review-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { toast } from "@/components/ui/use-toast";
import { HttpStatusCode } from "@/enums/http-status-codes";
import { useSession } from "@/hooks/useAuth";
import { ImpactScore, useProjectScoring } from "@/hooks/useProjectScoring";
import { useProjectById, useProjectsByCategory, useSaveProjectImpact } from "@/hooks/useProjects";
import { CategoryId } from "@/types/shared";
import { setProjectsScored } from "@/utils/localStorage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Address } from "viem";

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
	const { id } = params;
	const router = useRouter();
	const { data: session } = useSession();
	const { data: project, isPending: isProjectLoading } = useProjectById(id);
	const { data: projects, isPending: isProjectsLoading } = useProjectsByCategory(project?.applicationCategory as CategoryId);
	const [isConflictOfInterestDialogOpen, setIsConflictOfInterestDialogOpen] = useState(false);

	const walletAddress: Address | undefined = useMemo(() => session?.siwe?.address, [session?.siwe?.address]);
	const { projectsScored, isUnlocked, setIsUnlocked, handleScoreSelect } = useProjectScoring(
		project?.applicationCategory ?? '',
		project?.applicationId ?? id,
		walletAddress
	);

	const { mutateAsync: saveProjectImpact } = useSaveProjectImpact();
	const { ballot } = useBallotRound5Context();

	const userCategory: CategoryId | undefined = useMemo(() => session?.category, [session?.category]);
	const isUserCategory = useMemo(() => !!userCategory && !!project?.applicationCategory && userCategory === project?.applicationCategory, [userCategory, project?.applicationCategory]);

	const handleScore = useCallback(async (score: ImpactScore) => {
		toast({ variant: 'default', title: 'Saving your impact score...' });
		const totalProjects = projects?.length ?? 0;

		if (score !== 'Skip' && !projectsScored.votedIds.includes(project?.applicationId ?? id)) {
			try {
				if (!project?.applicationId) {
					throw new Error("Project ID is undefined");
				}
				await saveProjectImpact({ projectId: project?.applicationId ?? id, impact: score }, {
					onSuccess: async (data: any) => {
						if (data.status === HttpStatusCode.OK) {
							const { updatedProjectsScored, allProjectsScored } = await handleScoreSelect(score, totalProjects);
							setProjectsScored(project?.applicationCategory ?? '', (walletAddress || undefined) as Address, updatedProjectsScored);

							if (!allProjectsScored && projects) {
								const currentIndex = projects.findIndex((p: Project) => p.applicationId === id);
								const nextIndex = (currentIndex + 1) % totalProjects;
								const nextProjectId = projects[nextIndex].applicationId;
								if (nextProjectId) {
									toast({ variant: 'default', title: 'Impact score was saved successfully!' });
									router.push(`/project/${nextProjectId}`);
								}
							}
						} else {
							toast({ variant: 'destructive', title: "Error saving impact score" });
						}
					},
					onError: (error: Error) => {
						if (error instanceof Error) {
							toast({ variant: 'destructive', title: error.message });
						}
					}
				});
			} catch (error) {
				toast({ variant: 'destructive', title: 'Error saving impact score' });
			}
		} else if (score === 'Skip' && projects) {
			const currentIndex = projects.findIndex((p: Project) => p.applicationId === id);
			const nextIndex = (currentIndex + 1) % totalProjects;
			const nextProjectId = projects[nextIndex].applicationId;
			if (nextProjectId) {
				router.push(`/project/${nextProjectId}`);
			}
		} else {
		}
	}, [projects, project, id, router, handleScoreSelect, saveProjectImpact, projectsScored, walletAddress]);

	const handleConflictOfInterest = useCallback(() => {
		setIsConflictOfInterestDialogOpen(true);
	}, []);

	const handleConflictOfInterestConfirm = useCallback(() => {
		setIsConflictOfInterestDialogOpen(false);
		handleScore(0);
	}, [handleScore]);

	const currentProject = project;
	const isLoading = isProjectsLoading || isProjectLoading || !currentProject;

	const isVoted = useMemo(() => {
		if (!ballot || !project) return false;
		return !ballot.projects_to_be_evaluated.includes(project.applicationId ?? id) || projectsScored.votedIds.includes(project.applicationId ?? id);
	}, [ballot, project, projectsScored, id]);

	const sidebarProps = useMemo(() => ({
		onScoreSelect: handleScore,
		onConflictOfInterest: handleConflictOfInterest,
		projectsScored: projectsScored.count,
		totalProjects: projects?.length ?? 0,
		isVoted: isVoted,
	}), [handleScore, handleConflictOfInterest, projectsScored, projects, isVoted]);

	if (isLoading) {
		return <LoadingDialog isOpen={true} setOpen={() => { }} message="Loading project" />;
	}

	return (
		<div className="flex gap-12 mx-auto">
			<section className="flex-1 max-w-[720px]">
				<Breadcrumb className="mb-6">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/ballot">Ballot</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href={`/project/${id}`}>Project</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<UnlockBallotDialog isOpen={isUnlocked} setOpen={setIsUnlocked} />
				<ConflictOfInterestDialog
					isOpen={isConflictOfInterestDialogOpen}
					setOpen={setIsConflictOfInterestDialogOpen}
					onConfirm={handleConflictOfInterestConfirm}
				/>
				<ProjectDetails data={currentProject} isPending={false} />
				<PageView title={'project-details'} />
			</section>
			{isUserCategory && walletAddress && (
				<aside className="max-w-[304px]">
					<ReviewSidebar {...sidebarProps} />
				</aside>
			)}
		</div>
	);
}

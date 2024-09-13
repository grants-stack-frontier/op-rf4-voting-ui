"use client";
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
import { ImpactScore, useProjectScoring } from "@/hooks/useProjectScoring";
import { useProjectById, useProjectsByCategory, useSaveProjectImpact } from "@/hooks/useProjects";
import { setProjectsScored } from "@/utils/localStorage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
	const { id } = params;
	const router = useRouter();
	const { data: project, isPending: isProjectLoading } = useProjectById(id);
	const { data: projects, isPending: isProjectsLoading } = useProjectsByCategory(project?.applicationCategory ?? '');
	const [isNextProjectLoading, setIsNextProjectLoading] = useState(false);
	const [isConflictOfInterestDialogOpen, setIsConflictOfInterestDialogOpen] = useState(false);
	const { projectsScored, isUnlocked, setIsUnlocked, handleScoreSelect } = useProjectScoring(project?.applicationCategory ?? '', project?.projectId ?? id);
	const { mutateAsync: saveProjectImpact } = useSaveProjectImpact();
	const { ballot } = useBallotRound5Context();

	console.log({project})

	const handleScore = useCallback(async (score: ImpactScore) => {
		setIsNextProjectLoading(true);
		const totalProjects = projects?.length ?? 0;

		if (score !== 'Skip' && !projectsScored.votedIds.includes(project?.projectId ?? id)) {
			try {
				if (!project?.projectId) {
					throw new Error("Project ID is undefined");
				}
				await saveProjectImpact({ projectId: project.projectId, impact: score }, {
					onSuccess: async (data) => {
						if (data.status === HttpStatusCode.OK) {
							const { updatedProjectsScored, allProjectsScored } = await handleScoreSelect(score, totalProjects);
							setProjectsScored(updatedProjectsScored);
							setIsNextProjectLoading(false);

							if (!allProjectsScored && projects) {
								const currentIndex = projects.findIndex(p => p.projectId === project?.projectId || p.id === id);
								const nextIndex = (currentIndex + 1) % totalProjects;
								const nextProjectId = projects[nextIndex].projectId;
								if (nextProjectId) {
									router.push(`/project/${nextProjectId}`);
								}
							}
						} else {
							setIsNextProjectLoading(false);
							toast({ variant: 'destructive', title: "Error saving project impact" });
						}
					},
					onError: (error) => {
						if (error instanceof Error) {
							setIsNextProjectLoading(false);
							toast({ variant: 'destructive', title: error.message });
						}
					}
				});
			} catch (error) {
				setIsNextProjectLoading(false);
				toast({ variant: 'destructive', title: 'Error saving project impact' });
			}
		} else if (score === 'Skip' && projects) {
			const currentIndex = projects.findIndex(p => p.projectId === project?.projectId || p.id === id);
			const nextIndex = (currentIndex + 1) % totalProjects;
			const nextProjectId = projects[nextIndex].projectId;
			if (nextProjectId) {
				router.push(`/project/${nextProjectId}`);
			}
			setIsNextProjectLoading(false);
		} else {
			setIsNextProjectLoading(false);
		}
	}, [projects, project, id, router, handleScoreSelect, saveProjectImpact, projectsScored]);

	const handleConflictOfInterest = useCallback(() => {
		setIsConflictOfInterestDialogOpen(true);
	}, []);

	const handleConflictOfInterestConfirm = useCallback(() => {
		setIsNextProjectLoading(true);
		setIsConflictOfInterestDialogOpen(false);
		handleScore(0);
		setIsNextProjectLoading(false);
	}, [handleScore, setIsNextProjectLoading]);

	const currentProject = project;
	const isLoading = isProjectsLoading || isProjectLoading || !currentProject;

	const isVoted = useMemo(() => {
		if (!ballot || !project) return false;
		return ballot.projects_to_be_evaluated.includes(project.projectId ?? id) || projectsScored.votedIds.includes(project.projectId ?? id);
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
		<>
			<section className="flex-1 space-y-6">
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
				<LoadingDialog isOpen={isNextProjectLoading} setOpen={setIsNextProjectLoading} message="Loading next project" />
				<ProjectDetails data={currentProject} isPending={false} />
				<PageView title={'project-details'} />
			</section>
			<aside>
				<ReviewSidebar {...sidebarProps} />
			</aside>
		</>
	);
}

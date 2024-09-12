"use client";
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
import { ImpactScore, useProjectScoring } from "@/hooks/useProjectScoring";
import { useProjectsByCategory, useSaveProjectImpact } from "@/hooks/useProjects";
import { setProjectsScored } from "@/utils/localStorage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function ProjectDetailsPage({ params, searchParams }: { params: { id: string }, searchParams: { category: string } }) {
	const { id } = params;
	const { category } = searchParams;
	const router = useRouter();
	const { data: projects, isPending: isProjectsLoading } = useProjectsByCategory(category);
	const [isNextProjectLoading, setIsNextProjectLoading] = useState(false);
	const [isConflictOfInterestDialogOpen, setIsConflictOfInterestDialogOpen] = useState(false);
	const { projectsScored, isUnlocked, setIsUnlocked, handleScoreSelect } = useProjectScoring(category, id);
	const { mutateAsync: saveProjectImpact } = useSaveProjectImpact();

	const handleScore = useCallback(async (score: ImpactScore) => {
		setIsNextProjectLoading(true);
		const totalProjects = projects?.length ?? 0;
		const { updatedProjectsScored, allProjectsScored } = await handleScoreSelect(score, totalProjects);

		if (score !== 'Skip' && !projectsScored.votedIds.includes(id)) {
			try {
				await saveProjectImpact({ projectId: id, impact: score }, {
					onSuccess: () => {
						setProjectsScored(updatedProjectsScored);
						setIsNextProjectLoading(false);

						if (!allProjectsScored && projects) {
							const currentIndex = projects.findIndex(project => project.projectId === id);
							const nextIndex = (currentIndex + 1) % totalProjects;
							const nextProjectId = projects[nextIndex].projectId;
							if (nextProjectId) {
								router.push(`/project/${nextProjectId}?category=${category}`);
							}
						}
					},
					onError: () => {
						setIsNextProjectLoading(false);
						toast({ variant: 'destructive', title: 'Error saving project impact' });
					}
				});
			} catch (error) {
				setIsNextProjectLoading(false);
				toast({ variant: 'destructive', title: 'Error saving project impact' });
			}
		} else if (score === 'Skip' && projects) {
			const currentIndex = projects.findIndex(project => project.projectId === id);
			const nextIndex = (currentIndex + 1) % totalProjects;
			const nextProjectId = projects[nextIndex].projectId;
			if (nextProjectId) {
				router.push(`/project/${nextProjectId}?category=${category}`);
			}
			setIsNextProjectLoading(false);
		} else {
			setIsNextProjectLoading(false);
		}
	}, [projects, id, category, router, handleScoreSelect, saveProjectImpact, projectsScored]);

	const handleConflictOfInterest = useCallback(() => {
		setIsConflictOfInterestDialogOpen(true);
	}, []);

	const handleConflictOfInterestConfirm = useCallback(() => {
		setIsNextProjectLoading(true);
		setIsConflictOfInterestDialogOpen(false);
		handleScore(0);
		setIsNextProjectLoading(false);
	}, [handleScore, setIsNextProjectLoading]);

	const currentProject = projects?.find(project => project.projectId === id);
	const isLoading = isProjectsLoading || !currentProject;

	const sidebarProps = useMemo(() => ({
		onScoreSelect: handleScore,
		onConflictOfInterest: handleConflictOfInterest,
		projectsScored: projectsScored.count,
		totalProjects: projects?.length ?? 0,
		isVoted: projectsScored.votedIds.includes(id),
	}), [handleScore, handleConflictOfInterest, projectsScored, projects, id]);

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
								<Link href={`/project/${id}?category=${category}`}>Project</Link>
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

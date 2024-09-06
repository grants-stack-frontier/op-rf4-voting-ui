"use client";
import { UnlockBallotDialog } from "@/components/ballot/unlock-ballot";
import { ConflictOfInterestDialog } from "@/components/common/conflict-of-interest-dialog";
import { LoadingDialog } from "@/components/common/loading-dialog";
import { PageView } from "@/components/common/page-view";
import { ProjectDetails } from "@/components/projects";
import { ReviewSidebar } from "@/components/projects/review-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { ImpactScore, useProjectScoring } from "@/hooks/useProjectScoring";
import { useProjectsByCategory } from "@/hooks/useProjects";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function ProjectDetailsPage({ params, searchParams }: { params: { id: string }, searchParams: { category: string } }) {
	const { id } = params;
	const { category } = searchParams;
	const router = useRouter();
	const { data: projects, isPending: isProjectsLoading } = useProjectsByCategory(category);
	const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
	const [isNextProjectLoading, setIsNextProjectLoading] = useState(false);
	const [isConflictOfInterestDialogOpen, setIsConflictOfInterestDialogOpen] = useState(false);
	const { projectsScored, isUnlocked, setIsUnlocked, handleScoreSelect } = useProjectScoring(category, id);

	useEffect(() => {
		const index = projects?.findIndex(project => project.id === id) ?? -1;
		if (index !== -1) setCurrentProjectIndex(index);
	}, [projects, id]);

	const handleScore = useCallback((score: ImpactScore) => {
		setIsNextProjectLoading(true);
		const totalProjects = projects?.length ?? 0;
		const allProjectsScored = handleScoreSelect(score, totalProjects);

		if (!allProjectsScored) {
			const nextIndex = (currentProjectIndex + 1) % totalProjects;
			const nextProjectId = projects?.[nextIndex].id;
			if (nextProjectId) {
				router.push(`/project/${nextProjectId}?category=${category}`);
			}
		}
		setIsNextProjectLoading(false);
	}, [projects, currentProjectIndex, category, router, handleScoreSelect]);

	const handleConflictOfInterest = useCallback(() => {
		setIsConflictOfInterestDialogOpen(true);
	}, []);

	const handleConflictOfInterestConfirm = useCallback(() => {
		setIsNextProjectLoading(true);
		setIsConflictOfInterestDialogOpen(false);
		handleScore(0);
		setIsNextProjectLoading(false);
	}, [handleScore, setIsNextProjectLoading]);

	const currentProject = projects?.[currentProjectIndex];
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

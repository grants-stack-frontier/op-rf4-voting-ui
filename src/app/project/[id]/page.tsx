"use client";
import { UnlockBallotDialog } from "@/components/ballot/unlock-ballot";
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
import { useProjectsByCategory } from "@/hooks/useProjects";
import { ProjectsScored, addScoredProject, clearProjectsScored, getProjectsScored } from "@/utils/localStorage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Score = 0 | 1 | 2 | 3 | 4 | 5 | "Skip";

export default function ProjectDetailsPage({ params, searchParams }: { params: { id: string }, searchParams: { category: string } }) {
	const { id } = params;
	const { category } = searchParams;
	const router = useRouter();
	const { data: projects, isPending: isProjectsLoading } = useProjectsByCategory(category);
	const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
	const [projectsScored, setProjectsScored] = useState<ProjectsScored>({ category, count: 0, votedIds: [] });
	const [isUnlocked, setIsUnlocked] = useState(false);
	const [isNextProjectLoading, setIsNextProjectLoading] = useState(false);
	useEffect(() => {
		setProjectsScored(getProjectsScored(category));
	}, [category]);

	useEffect(() => {
		if (projects) {
			const index = projects.findIndex(project => project.id === id);
			if (index !== -1) {
				setCurrentProjectIndex(index);
			}
		}
	}, [projects, id]);

	const handleScoreSelect = (score: Score) => {
		setIsNextProjectLoading(true);
		let updatedProjectsScored = projectsScored;

		if (score !== "Skip" && !projectsScored.votedIds.includes(id)) {
			updatedProjectsScored = addScoredProject(category, id);
			setProjectsScored(updatedProjectsScored);
		}

		const totalProjects = projects?.length || 0;
		const allProjectsScored = updatedProjectsScored.count === totalProjects;

		if (allProjectsScored) {
			setIsUnlocked(true);
			clearProjectsScored(category);
			setProjectsScored({ category, count: 0, votedIds: [] });
			setIsNextProjectLoading(false);
		} else {
			const nextIndex = (currentProjectIndex + 1) % totalProjects;
			const nextProjectId = projects?.[nextIndex].id;
			if (nextProjectId) {
				router.push(`/project/${nextProjectId}?category=${category}`);
			}
			setIsNextProjectLoading(false);
		}
	};

	const currentProject = projects?.[currentProjectIndex];
	const isLoading = isProjectsLoading || !currentProject;

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
				<LoadingDialog isOpen={isNextProjectLoading} setOpen={setIsNextProjectLoading} message="Loading next project" />
				<ProjectDetails data={currentProject} isPending={isLoading} />
				<PageView title={'project-details'} />
			</section>
			<aside>
				<ReviewSidebar
					onScoreSelect={handleScoreSelect}
					projectsScored={projectsScored.count}
					totalProjects={projects?.length || 0}
					isVoted={projectsScored.votedIds.includes(id)}
				/>
			</aside>
		</>
	);
}

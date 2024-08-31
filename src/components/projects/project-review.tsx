import { Project } from "@/__generated__/api/agora.schemas"
import { useEffect, useState } from "react"
import { ProjectDetails } from "./index"
import { ReviewSidebar } from "./review-sidebar"

// This function should be implemented to fetch projects from your API
async function fetchProjects(): Promise<Project[]> {
	// Implement API call to fetch projects
	return []
}

type Score = 0 | 1 | 2 | 3 | 4 | 5 | "Skip"

export function ProjectReview() {
	const [projects, setProjects] = useState<Project[]>([])
	const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
	const [projectsScored, setProjectsScored] = useState(0)

	useEffect(() => {
		fetchProjects().then(setProjects)
	}, [])

	const handleScoreSelect = (score: Score) => {
		// Here you would typically send the score to your backend
		// For now, we'll just move to the next project
		if (score !== "Skip") {
			setProjectsScored(prev => prev + 1)
		}
		setCurrentProjectIndex(prev => prev + 1)
	}

	const currentProject = projects[currentProjectIndex]
	const isLoading = !currentProject

	return (
		<div className="flex gap-8">
			<ProjectDetails data={currentProject} isPending={isLoading} />
			<ReviewSidebar
				onScoreSelect={handleScoreSelect}
				projectsScored={projectsScored}
				totalProjects={projects.length}
			/>
		</div>
	)
}
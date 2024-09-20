import { Project } from "@/__generated__/api/agora.schemas";
import { ReviewSidebar } from "@/components/project-details/review-sidebar";
import { toast } from "@/components/ui/use-toast";
import { HttpStatusCode } from "@/enums/http-status-codes";
import { ImpactScore } from "@/hooks/useProjectScoring";
import { useSaveProjectImpact } from "@/hooks/useProjects";
import { ProjectsScored, setProjectsScored } from "@/utils/localStorage";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { Address } from "viem";

export function ProjectReview({
	onScoreSelect,
	onConflictOfInterest,
	projectsScored,
	totalProjects,
	isVoted,
	handleNavigation,
	currentProject,
	walletAddress,
	currentProjectScore
}: {
	onScoreSelect: (score: ImpactScore, totalVotedProjects: number) => Promise<{
		updatedProjectsScored: ProjectsScored;
		allProjectsScored: boolean;
	}>;
	onConflictOfInterest: Dispatch<SetStateAction<boolean>>;
	projectsScored: ProjectsScored;
	totalProjects: number;
	isVoted: boolean;
	handleNavigation: () => void;
	currentProject: Project | undefined;
	walletAddress: Address | undefined;
	currentProjectScore?: ImpactScore;
}) {

	const [localProjectsScored, setLocalProjectsScored] = useState(projectsScored.votedCount);
	const [localCurrentProjectScore, setLocalCurrentProjectScore] = useState(currentProjectScore);

	useEffect(() => {
		setLocalProjectsScored(projectsScored.votedCount);
	}, [projectsScored]);

	const { mutateAsync: saveProjectImpact } = useSaveProjectImpact();

	const handleScore = useCallback(async (score: ImpactScore) => {
		if (score === 'Skip') {
			const { updatedProjectsScored } = await onScoreSelect(score, totalProjects);
			setLocalProjectsScored(updatedProjectsScored.votedCount);
			handleNavigation();
		} else {
			toast({ variant: 'default', title: 'Saving your impact score...' });
			try {
				if (!currentProject) {
					throw new Error("Project ID is undefined");
				}
				await saveProjectImpact({ projectId: currentProject.applicationId as string, impact: score }, {
					onSuccess: async (data: any) => {
						if (data.status === HttpStatusCode.OK) {
							const { updatedProjectsScored, allProjectsScored } = await onScoreSelect(score, totalProjects);
							setProjectsScored(currentProject.applicationCategory ?? '', walletAddress as Address, updatedProjectsScored);
							setLocalProjectsScored(updatedProjectsScored.votedCount);

							if (!allProjectsScored) {
								toast({ variant: 'default', title: 'Impact score was saved successfully!' });
								handleNavigation();
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
		}
	}, [onScoreSelect, handleNavigation, currentProject, saveProjectImpact, totalProjects, walletAddress]);

	return (
		<ReviewSidebar
			onScoreSelect={handleScore}
			onConflictOfInterest={onConflictOfInterest}
			projectsScored={localProjectsScored}
			totalProjects={totalProjects}
			isVoted={isVoted}
			currentProjectScore={localCurrentProjectScore}
			onLocalScoreUpdate={setLocalCurrentProjectScore}
		/>
	);
}
import { Project } from "@/__generated__/api/agora.schemas";
import { ReviewSidebar } from "@/components/project-details/review-sidebar";
import { ImpactScore } from "@/hooks/useProjectScoring";
import { Dispatch, SetStateAction } from "react";
import { Address } from "viem";

type ProjectReviewProps = {
	onScoreSelect: (score: ImpactScore) => Promise<void>;
	onConflictOfInterest: Dispatch<SetStateAction<boolean>>;
	votedCount: number | undefined;
	totalProjects: number;
	isVoted: boolean;
	isLoading: boolean;
	isSaving: boolean;
	currentProject: Project | undefined;
	walletAddress: Address | undefined;
	currentProjectScore?: ImpactScore;
}

export function ProjectReview({
	onScoreSelect,
	onConflictOfInterest,
	votedCount,
	totalProjects,
	isVoted,
	isLoading,
	isSaving,
	currentProjectScore
}: ProjectReviewProps) {
	return (
		<ReviewSidebar
			onScoreSelect={onScoreSelect}
			onConflictOfInterest={onConflictOfInterest}
			votedCount={votedCount}
			totalProjects={totalProjects}
			isVoted={isVoted}
			isLoading={isLoading}
			isSaving={isSaving}
			currentProjectScore={currentProjectScore}
		/>
	);
}
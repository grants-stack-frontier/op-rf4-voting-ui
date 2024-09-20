import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/components/ui/card"
import { ImpactScore, scoreLabels } from "@/hooks/useProjectScoring"
import { cn } from "@/lib/utils"
import { Dispatch, SetStateAction, useCallback, useMemo } from "react"
import { Progress } from "../ui/progress"

type CardProps = React.ComponentProps<typeof Card>

interface ReviewSidebarProps extends CardProps {
	onScoreSelect: (score: ImpactScore) => void
	onConflictOfInterest: Dispatch<SetStateAction<boolean>>
	totalProjects: number
	projectsScored: number
	isVoted: boolean
}

export function ReviewSidebar({
	className,
	onScoreSelect,
	onConflictOfInterest,
	totalProjects,
	projectsScored,
	isVoted,
	...props
}: ReviewSidebarProps) {
	const handleScore = useCallback((score: ImpactScore) => {
		if (Number(score) === 0) {
			onConflictOfInterest(true);
		} else {
			onScoreSelect(score);
		}
	}, [onConflictOfInterest, onScoreSelect]);

	const sortedScores = useMemo(() => {
		return (Object.entries(scoreLabels) as [ImpactScore, string][])
			.sort(([scoreA], [scoreB]) => {
				if (scoreA === 'Skip') return 1;
				if (scoreB === 'Skip') return -1;
				return Number(scoreB) - Number(scoreA);
			})
			.filter(([score]) => score !== 'Skip')
			.concat([['Skip', scoreLabels['Skip']] as [ImpactScore, string]]);
	}, []);

	return (
		<Card className={cn("w-[304px] h-[560px] sticky top-8", className)} {...props}>
			<CardHeader>
				<CardTitle className="text-base font-medium text-center">
					{isVoted ? "You've already voted on this project" : "How would you score this project's impact on the OP Stack?"}
				</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="flex flex-col gap-2">
					{sortedScores.map(([score, label]) => (
						<Button
							key={score}
							variant={score === "Skip" ? "link" : "outline"}
							onClick={() => handleScore(score)}
						// disabled={isVoted && score !== "Skip"}
						>
							{label}
						</Button>
					))}
				</div>
			</CardContent>
			<CardFooter className="flex flex-col gap-3">
				<Progress value={(projectsScored / totalProjects) * 100} />
				<p className="text-sm text-muted-foreground">You&apos;ve scored {projectsScored} out of {totalProjects} projects</p>
			</CardFooter>
		</Card>
	)
}

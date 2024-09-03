import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import React from "react"
import { Progress } from "../ui/progress"

type CardProps = React.ComponentProps<typeof Card>

type Score = 0 | 1 | 2 | 3 | 4 | 5 | "Skip"

interface ReviewSidebarProps extends CardProps {
	onScoreSelect: (score: Score) => void
	totalProjects: number
	projectsScored: number
	isVoted: boolean
}

const scoreLabels: Record<Score, string> = {
	5: "Very High",
	4: "High",
	3: "Medium",
	2: "Low",
	1: "Very Low",
	0: "Conflict of interest",
	"Skip": "Skip"
}

export function ReviewSidebar({ className, onScoreSelect, totalProjects, projectsScored, isVoted, ...props }: ReviewSidebarProps) {
	return (
		<Card className={cn("w-[304px] h-[560px]", className)} {...props}>
			<CardHeader>
				<CardTitle className="text-base font-medium text-center">
					{isVoted ? "You've already voted on this project" : "How would you score this project's impact on the OP Stack?"}
				</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="flex flex-col gap-2">
					{(Object.entries(scoreLabels) as [Score, string][]).map(([score, label]) => (
						<Button
							key={score}
							variant={score === "Skip" ? "link" : "outline"}
							onClick={() => onScoreSelect(score)}
							disabled={isVoted && score !== "Skip"}
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

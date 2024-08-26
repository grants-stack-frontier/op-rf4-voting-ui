
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Progress } from "../ui/progress"

type CardProps = React.ComponentProps<typeof Card>

export function ReviewSidebar({ className, ...props }: CardProps) {
	return (
		<Card className={cn("w-[304px] h-[560px]", className)} {...props}>
			<CardHeader>
				<CardTitle className="text-base font-medium text-center">How would you score this project&apos;s impact on the OP Stack?</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="flex flex-col gap-2">
					<Button variant="outline">Very High</Button>
					<Button variant="outline">High</Button>
					<Button variant="outline">Medium</Button>
					<Button variant="outline">Low</Button>
					<Button variant="outline">Very Low</Button>
					<Button variant="outline">Conflict of interest</Button>
					<Button variant="ghost">Skip</Button>
				</div>
			</CardContent>
			<CardFooter className="flex flex-col gap-3">
				<Progress value={0} />
				<p className="text-sm text-muted-foreground">You&apos;ve scored 0 out of 20 projects</p>
			</CardFooter>
		</Card>
	)
}

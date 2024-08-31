"use client";
import { LockKeyholeOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { ComponentProps, useState } from "react";
import { LoadingDialog } from "../common/loading-dialog";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from "../ui/dialog";

export function UnlockBallotDialog({
	isOpen,
	setOpen,
}: {
	isOpen: boolean;
	setOpen: ComponentProps<typeof Dialog>["onOpenChange"];
}) {
	const [isUnlockedLoading, setIsUnlockedLoading] = useState(false);
	const router = useRouter();
	const handleUnlock = () => {
		setIsUnlockedLoading(true);
		setTimeout(() => {
			setIsUnlockedLoading(false);
			router.push("/ballot");
		}, 2000);
	};
	return (
		<>
			<Dialog open={isOpen} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader className="flex flex-col items-center gap-4">
						<DialogTitle><LockKeyholeOpen className="w-16 h-16 text-black" /></DialogTitle>
						<DialogDescription className="text-xl font-medium">Nice work! You&apos;re ready to unlock your ballot and allocate rewards</DialogDescription>
						<p className="text-sm text-muted-foreground">We&apos;ll use your scores to position projects in your unlocked ballot.</p>
						<Button className="w-full" variant="destructive" onClick={handleUnlock}>Unlock ballot</Button>
					</DialogHeader>
				</DialogContent>
			</Dialog>
			<LoadingDialog isOpen={isUnlockedLoading} setOpen={setIsUnlockedLoading} message="Unlocking your ballot" />
		</>
	);
}

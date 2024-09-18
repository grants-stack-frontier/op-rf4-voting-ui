"use client";
import { LockKeyholeOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { ComponentProps, useState } from "react";
import { LoadingDialog } from "../common/loading-dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Button } from "../ui/button";

export function UnlockBallotDialog({
	isOpen,
	setOpen,
}: {
	isOpen: boolean;
	setOpen: ComponentProps<typeof AlertDialog>["onOpenChange"];
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
			<AlertDialog open={isOpen} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader className="flex flex-col items-center gap-4">
						<AlertDialogTitle><LockKeyholeOpen className="w-16 h-16 text-black" /></AlertDialogTitle>
						<AlertDialogDescription className="text-xl font-medium">Nice work! You&apos;re ready to unlock your ballot and allocate rewards</AlertDialogDescription>
						<p className="text-sm text-muted-foreground">We&apos;ll use your scores to position projects in your unlocked ballot.</p>
						<Button className="w-full" variant="destructive" onClick={handleUnlock} disabled={isUnlockedLoading}>Unlock ballot</Button>
					</AlertDialogHeader>
				</AlertDialogContent>
			</AlertDialog>
			<LoadingDialog isOpen={isUnlockedLoading} setOpen={setIsUnlockedLoading} message="Unlocking your ballot" />
		</>
	);
}

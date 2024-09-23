import { RiErrorWarningFill } from "@remixicon/react";
import { ComponentProps } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "../ui/alert-dialog";

export function ConflictOfInterestDialog({
	isOpen,
	setOpen,
	onConfirm,
}: {
	isOpen: boolean;
	setOpen: ComponentProps<typeof AlertDialog>["onOpenChange"];
	onConfirm: () => void;
}) {
	return (
		<>
			<AlertDialog open={isOpen} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader className="flex flex-col items-center gap-4">
						<AlertDialogTitle><RiErrorWarningFill className="w-16 h-16" /></AlertDialogTitle>
						<AlertDialogDescription className="text-xl font-medium">Declare a conflict of interest</AlertDialogDescription>
						<p className="text-muted-foreground text-center">A conflict of interest exists if you get income from this organization or project, or if any portion of this project&apos;s rewards will flow to you.</p>
						<AlertDialogFooter className="w-full sm:flex-col gap-2">
							<AlertDialogAction className="bg-red-600 text-white hover:bg-red-800" onClick={onConfirm}>Mark this project as conflict of interest</AlertDialogAction>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
						</AlertDialogFooter>
					</AlertDialogHeader>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

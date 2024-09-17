"use client";

import Image from "next/image";
import { ComponentProps } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

export function ContributorsDialog({
	isOpen,
	setOpen,
	contributors,
}: {
	isOpen: boolean;
	setOpen: ComponentProps<typeof Dialog>["onOpenChange"];
	contributors: { url: string; name: string }[];
}) {
	return (
		<Dialog open={isOpen} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader className="flex flex-col items-center gap-4">
					<DialogTitle>Contributors</DialogTitle>
					<ScrollArea className="w-[458px] h-[343px]">
						{contributors.map((contributor, index) => (
							<Card key={index} className="mb-1.5">
								<CardContent className="flex items-center space-x-2 p-3">
									<Image src={contributor.url} alt={contributor.name} className="w-8 h-8 rounded-full" width={28} height={28} />
									<span>{contributor.name}</span>
								</CardContent>
							</Card>
						))}
					</ScrollArea>
				</DialogHeader>
				<DialogFooter>
					<Button className="w-full" variant="destructive" type="button" onClick={() => setOpen?.(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

"use client";
import { PropsWithChildren, useRef, useState } from "react";

import { ProjectAllocation } from "@/hooks/useMetrics";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import { useIntersection } from "react-use";
import AvatarPlaceholder from "../../../public/avatar-placeholder.svg";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Heading } from "../ui/headings";
import { ScrollArea } from "../ui/scroll-area";
import { OpenSourceIcon } from "./opensource-icon";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Category } from "@/data/categories";
import { Skeleton } from "../ui/skeleton";
import { ManualDialog } from "./manual-dialog";

export function ProjectsSidebar({
	id,
	data,
	isPending,
}: {
	id: string;
	data?: Category[];
	isPending: boolean;
}) {
	const category = data?.find(cat => cat.id === id);
	const { projects } = category ?? {};
	const intersectionRef = useRef(null);
	const intersection = useIntersection(intersectionRef, {
		root: null,
		rootMargin: "0px",
		threshold: 1,
	});

	return (
		<Card
			className={cn("w-[300px] sticky top-4", {
				["opacity-50 animate-pulse"]: isPending,
			})}
		>
			<div className="p-3">
				{data && projects?.length && (
					<>
						{projects?.length > 1 ? (
							<Heading variant="h3">There are {projects?.length} projects in this category</Heading>
						) : (
							<Heading variant="h3">There is 1 project in this category</Heading>
						)}
					</>
				)}
			</div>
			<div className="p-3 space-y-2">
				<ScrollArea className="h-[328px] relative">
					{isPending &&
						Array(8)
							.fill(0)
							.map((_, i) => (
								<AllocationItem key={i} isLoading>
									--
								</AllocationItem>
							))}
					{projects?.map((item) => (
						<AllocationItem key={item.name} {...item}>
							{item.name}
						</AllocationItem>
					))}
					<div ref={intersectionRef} />
					{(intersection?.intersectionRatio ?? 0) < 1 && (
						<Badge
							variant="outline"
							className="animate-in fade-in zoom-in absolute bottom-2 left-1/2 -translate-x-1/2 bg-white"
						>
							More <ArrowDown className="ml-2 size-3 " />
						</Badge>
					)}
				</ScrollArea>
			</div>
		</Card>
	);
}

function AllocationItem({
	name,
	image = AvatarPlaceholder.src,
	allocations_per_metric,
	is_os,
	isLoading,
	children,
}: PropsWithChildren<Partial<ProjectAllocation>> & { isLoading?: boolean }) {
	const [isOpen, setOpen] = useState(false);
	return (
		<>
			<TooltipProvider
				delayDuration={allocations_per_metric?.length ? 500 : 1000000}
			>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="flex text-xs items-center justify-between py-2 flex-1 border-b text-muted-foreground">
							<div className="flex gap-2 items-center max-w-[204px] ">
								<div
									className="size-6 rounded-lg bg-gray-100 bg-cover bg-center flex-shrink-0"
									style={{
										backgroundImage: `url(${image})`,
									}}
								/>
								<div className="truncate">
									{name || <Skeleton className="h-3 w-16" />}
								</div>
								{is_os && (
									<OpenSourceIcon className="size-3 flex-shrink-0 mr-1" />
								)}
							</div>
							<div className={cn({ ["text-gray-400"]: isLoading })}>
								{children}
							</div>
						</div>
					</TooltipTrigger>
					<TooltipContent
						side="bottom"
						className="max-w-[300px]"
						align="end"
						alignOffset={-14}
					>

					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<ManualDialog open={isOpen} onOpenChange={setOpen} />
		</>
	);
}
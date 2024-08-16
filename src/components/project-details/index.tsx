"use client";
import { Heading } from "@/components/ui/headings";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import {Project} from "@/__generated__/api/agora.schemas";
export function ProjectDetails({
	data,
	isPending,
}: {
	data?: Project;
	isPending: boolean;
}) {
	const { id, profileAvatarUrl, name, projectCoverImageUrl } = data || {};
	return (
		<section className="space-y-16">
			<div className="space-y-6">
				{isPending ? (
					<>
						<Skeleton className="w-96 h-8" />
						<div className="space-y-2">
							<Skeleton className="w-full h-4" />
							<Skeleton className="w-full h-4" />
							<Skeleton className="w-4/5 h-4" />
						</div>
					</>
				) : (
					<>
						{projectCoverImageUrl && (
							<Image className="rounded-md" src={projectCoverImageUrl} alt={name || ''} width={720} height={180} />
						)}
						<Heading variant="h2">{name}</Heading>
						{/* <Markdown className="dark:text-white">{description}</Markdown> */}
					</>
				)}
			</div>
		</section>
	);
}

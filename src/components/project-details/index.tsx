"use client";
import { Heading } from "@/components/ui/headings";
import { Project } from "@/hooks/useProjects";
import { Link2 } from "lucide-react";
import Image from "next/image";
import { AvatarENS } from "../ens";
import { Markdown } from "../markdown";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
export function ProjectDetails({
	data,
	isPending,
}: {
	data?: Project;
	isPending: boolean;
}) {
	const { id, profileAvatarUrl, name, projectCoverImageUrl, description, socialLinks, category } = data ?? {};
	const { twitter, farcaster, mirror, website } = socialLinks ?? {};
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
						{projectCoverImageUrl && profileAvatarUrl && (
							<div className="w-full h-56">
								<Image className="rounded-md" src={projectCoverImageUrl} alt={name || ''} width={720} height={180} />
								<Image className="rounded-md -mt-10 ml-6" src={profileAvatarUrl} alt={name || ''} width={80} height={80} />
							</div>
						)}
						<Heading variant="h2">{name}</Heading>
						<div className="flex items-center gap-2">
							<p className="font-medium">By</p>
							{id && <AvatarENS address={id} />}
							<p className="font-medium">{name}</p>
						</div>
						<Markdown className="dark:text-white line-clamp-3">{description}</Markdown>
						<div className="flex flex-wrap items-center gap-2">
							<p className="flex items-center gap-1"><Link2 className="-rotate-45 h-4 w-4" /> {website}</p>
							<p className="flex items-center gap-1"><Link2 className="-rotate-45 h-4 w-4" /> {twitter}</p>
							<p className="flex items-center gap-1"><Link2 className="-rotate-45 h-4 w-4" /> {farcaster}</p>
							<p className="flex items-center gap-1"><Link2 className="-rotate-45 h-4 w-4" /> {mirror}</p>
						</div>
						<Badge
							variant={null}
							className="cursor-pointer border-0 bg-green-500/25 text-green-600 font-medium"
						>
							{category}
						</Badge>
						<p className="font-medium">Repos, links and contracts</p>
					</>
				)}
			</div>
		</section>
	);
}

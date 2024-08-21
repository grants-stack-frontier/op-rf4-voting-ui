"use client";
import { Heading } from "@/components/ui/headings";
import { Category, CategoryType } from "@/data/categories";
import { useProjectsByCategory } from "@/hooks/useProjects";
import Image from "next/image";
import { Markdown } from "../markdown";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
export function CategoryDetails({
	id,
	data,
}: {
	id: string;
	data?: Category[];
}) {
	const category = data?.find(cat => cat.id === id);
	const { data: projects, isPending } = useProjectsByCategory(id);
	const { name, image, description, eligibility, examples } = category ?? {};
	const { eligible_projects, note } = eligibility ?? {};

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
						<Image className="rounded-md" src={image} alt={name || id} width={100} height={100} />
						<Heading variant="h2">{name}</Heading>
						<Markdown className="dark:text-white">{description}</Markdown>
						<div className="flex items-center gap-2">
							<Badge
								variant="secondary"
								className="cursor-pointer font-medium"
							>
								{projects?.length} project(s)
							</Badge>
							{id === CategoryType.ETHEREUM_CORE_CONTRIBUTIONS && (
								<Badge
									variant={null}
									className="cursor-pointer border-0 bg-green-500/25 text-green-600 font-medium"
								>
									This is your voting category
								</Badge>
							)}
						</div>
						<Heading variant="h2">Eligibility</Heading>
						<p>Projects who are eligible can be described as one of the following:
							<ul className="list-disc ml-6">
								{eligible_projects?.map((project, index) => (
									<li key={index}>{project}</li>
								))}
							</ul>
							{note}
						</p>
						<Heading variant="h2">Examples</Heading>
						<p>
							{examples?.join(", ")}
						</p>
					</>
				)}
			</div>
		</section>
	);
}

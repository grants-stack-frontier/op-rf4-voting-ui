"use client";
import { PageView } from "@/components/common/page-view";
import { ProjectDetails } from "@/components/project-details";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { useProjectById } from "@/hooks/useProjects";
import Link from "next/link";

export default function ProjectDetailsPage({ params: { id = "" } }) {
	const { data: project = {}, isPending } = useProjectById(id);
	console.log({ project });
	return (
		<>
			<section className="flex-1 space-y-6">
				<Breadcrumb className="mb-6">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/ballot">Ballot</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/ballot/project">Project</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<ProjectDetails {...project} isPending={isPending} />
				<PageView title={'project-details'} />
				{/* <CategoryPagination id={id} /> */}
			</section>
			{/* <aside>
				<ProjectsSidebar
					id={id}
					{...category}
				/>
			</aside> */}
		</>
	);
}

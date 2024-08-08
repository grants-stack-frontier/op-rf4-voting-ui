"use client";
import { CategoryDetails } from "@/components/category-details";
import { CategoryPagination } from "@/components/category/category-pagination";
import { PageView } from "@/components/common/page-view";
import { DistributionSidebar } from "@/components/metrics/distribution-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { useCategories } from "@/hooks/useCategories";
import Link from "next/link";

export default function CategoryDetailsPage({ params: { id = "" } }) {
	const category = useCategories();
	return (
		<>
			<section className="flex-1 space-y-6">
				<Breadcrumb className="mb-6">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/budget">Budget</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/budget/category">Category</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<CategoryDetails {...category} />
				<PageView title={'category-details'} />
				<CategoryPagination id={id} />
			</section>
			<aside>
				<DistributionSidebar id={id} />
			</aside>
		</>
	);
}

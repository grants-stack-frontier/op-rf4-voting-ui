"use client";
import { CategoryDetails } from "@/components/category-details";
import { PageView } from "@/components/common/page-view";
import { ProjectsSidebar } from "@/components/projects/projects-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryType } from "@/data/categories";
import { useCategories } from "@/hooks/useCategories";
import Link from "next/link";

export default function CategoryDetailsPage() {
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
				<Tabs defaultValue={CategoryType.ETHEREUM_CORE_CONTRIBUTIONS} className="w-full pt-3">
					<TabsList className="grid w-full grid-cols-3">
						{Object.values(CategoryType).map((categoryType) => (
							<TabsTrigger key={categoryType} value={categoryType}>
								{categoryType.replace(/_/g, ' ')}
							</TabsTrigger>
						))}
					</TabsList>
					{Object.values(CategoryType).map((categoryType) => (
						<TabsContent className="pt-10" key={categoryType} value={categoryType}>
							<section className="flex items-start justify-between">
								<CategoryDetails {...category} id={categoryType} />
								<aside>
									<ProjectsSidebar
										id={categoryType}
										{...category}
									/>
								</aside>
							</section>
						</TabsContent>
					))}
				</Tabs>
				<PageView title={'category-details'} />
			</section>
		</>
	);
}

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
import { useRouter } from "next/navigation";

export default function CategoryDetailsPage({ params: { id = "" } }) {
	const category = useCategories();
	const router = useRouter();

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
								<Link href={`/category/${id}`}>Category</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<Tabs defaultValue={id} className="w-full pt-3">
					<TabsList className="grid w-full grid-cols-3">
						{Object.values(CategoryType).map((categoryType) => {
							let categoryName = categoryType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
							if (categoryName.startsWith('Op')) {
								categoryName = categoryName.replace('Op', 'OP')
							}
							return (
								<TabsTrigger onClick={() => router.push(`/category/${categoryType}`)} key={categoryType} value={categoryType}>
									{categoryName}
								</TabsTrigger>
							)
						})}
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

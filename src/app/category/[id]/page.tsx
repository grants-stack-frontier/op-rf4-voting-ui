"use client";
import { CategoryDetails } from "@/components/category-details";
import { PageView } from "@/components/common/page-view";
import { ProjectsSidebar } from "@/components/project-details/projects-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories } from "@/data/categories";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CategoryDetailsPage({ params: { id = "" } }) {
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
                        {categories.map(({ id: categoryType, name }) => (
                            <TabsTrigger
                                onClick={() => router.push(`/category/${categoryType}`)}
                                key={categoryType}
                                value={categoryType}
                                className={`${id === categoryType ? 'text-black' : 'text-gray-500'}`}
                            >
                                {name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {categories.map(({ id: categoryType, ...category }) => (
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
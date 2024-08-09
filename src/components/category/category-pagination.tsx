"use client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

export function CategoryPagination({ id = "" }) {
  const categories = useCategories()
  const { data, isPending } = categories
  if (isPending) return null;
  const current = data?.findIndex((category) => category.id === id) ?? 0;
  const pageIds = data?.map((category) => category.id) ?? [];
  const pages = pageIds ?? [];

  return (
    <div className="fixed z-10 bottom-10 bg-white dark:bg-black shadow border rounded-lg p-2 left-1/2 -translate-x-1/2">
      <Pagination>
        <PaginationContent>
          <PaginationItem
            className={cn({
              ["pointer-events-none opacity-50"]: current === 0,
            })}
          >
            <PaginationPrevious href={`/category/${pages[current - 1]}`} />
          </PaginationItem>

          {pages.map((category, index) => (
            <PaginationItem key={category}>
              <PaginationLink
                href={`/category/${category}`}
                isActive={index === current}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem
            className={cn({
              ["pointer-events-none opacity-50"]: current === pages.length - 1,
            })}
          >
            <PaginationNext href={`/category/${pages[current + 1]}`} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

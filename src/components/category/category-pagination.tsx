"use client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export function CategoryPagination({ id = "" }) {
  if (!id) return null;
  const current = 0;
  const pages: string[] = [];

  return (
    <div className="fixed z-10 bottom-10 bg-white shadow border rounded-lg p-2 left-1/2 -translate-x-1/2">
      <Pagination>
        <PaginationContent>
          <PaginationItem
            className={cn({
              ["pointer-events-none opacity-50"]: current === 0,
            })}
          >
            <PaginationPrevious href={`/category/${pages[current - 1]}`} />
          </PaginationItem>

          {pages.map((pageId, index) => (
            <PaginationItem key={pageId}>
              <PaginationLink
                href={`/category/${pageId}`}
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

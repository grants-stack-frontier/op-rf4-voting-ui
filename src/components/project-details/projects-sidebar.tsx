"use client";
import { PropsWithChildren, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import { useIntersection } from "react-use";
import AvatarPlaceholder from "../../../public/avatar-placeholder.svg";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Heading } from "../ui/headings";
import { ScrollArea } from "../ui/scroll-area";

import { Project } from "@/__generated__/api/agora.schemas";
import { Category } from "@/data/categories";
import { useProjectsByCategory } from "@/hooks/useProjects";
import Link from "next/link";
import { ManualDialog } from "../common/manual-dialog";
import { Skeleton } from "../ui/skeleton";

export function ProjectsSidebar({
  id,
  data,
}: {
  id: string;
  data?: Category[];
}) {
  const { data: projects, isPending } = useProjectsByCategory(id);
  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: "0px",
    threshold: 1,
  });

  return (
    <Card
      className={cn("w-[300px] sticky top-8", {
        ["opacity-50 animate-pulse"]: isPending,
      })}
    >
      <div className="p-3">
        {data && projects?.length && (
          <>
            {projects?.length > 1 ? (
              <Heading variant="h3">There are {projects?.length} projects in this category</Heading>
            ) : (
              <Heading variant="h3">There are no projects in this category</Heading>
            )}
          </>
        )}
      </div>
      <div className="p-3 space-y-2">
        <ScrollArea className="h-[328px] relative">
          {isPending &&
            Array(8)
              .fill(0)
              .map((_, i) => (
                <ProjectItem key={i} isLoading>
                  --
                </ProjectItem>
              ))}
          {projects?.map((item) => (
            <Link key={item.name} href={`/project/${item.id}`}>
              <ProjectItem  {...item}>
                {item.name}
              </ProjectItem>
            </Link>
          ))}
          <div ref={intersectionRef} />
          {(intersection?.intersectionRatio ?? 0) < 1 && (
            <Badge
              variant="outline"
              className="animate-in fade-in zoom-in absolute bottom-2 left-1/2 -translate-x-1/2 bg-white"
            >
              More <ArrowDown className="ml-2 size-3 " />
            </Badge>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
}

function ProjectItem({
  name,
  profileAvatarUrl = AvatarPlaceholder.src,
  isLoading,
}: PropsWithChildren<Project> & { isLoading?: boolean }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <div className="flex text-xs items-center justify-between py-2 flex-1 border-b text-muted-foreground">
        <div className="flex gap-2 items-center max-w-[204px] ">
          <div
            className="size-6 rounded-lg bg-gray-100 bg-cover bg-center flex-shrink-0"
            style={{
              backgroundImage: `url(${profileAvatarUrl})`,
            }}
          />
          <div className="truncate">
            {name || <Skeleton className="h-3 w-16" />}
          </div>
        </div>
        <div className={cn({ ["text-gray-400"]: isLoading })}>
          {/* {children} */}
        </div>
      </div>
      <ManualDialog open={isOpen} onOpenChange={setOpen} />
    </>
  );
}
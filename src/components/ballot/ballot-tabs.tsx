"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

export function BallotTabs() {
  const path = usePathname();

  return (
    <section className="flex gap-6 text-2xl">
      <div>
        <Link
          className={cn("text-gray-400 font-semibold", {
            ["text-foreground"]: "/budget" === path, // is active
          })}
          href="/budget"
        >
          Budget
        </Link>
      </div>
      <Separator orientation="vertical" className="h-8 text-gray-400 w-[2px]" />
      <div>
        <Link
          className={cn("text-gray-400 font-semibold", {
            ["text-foreground"]: "/ballot" === path, // is active
          })}
          href="/ballot"
        >
          Ballot
        </Link>
      </div>
    </section>
  );
}

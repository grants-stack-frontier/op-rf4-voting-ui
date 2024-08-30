"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

const tabs = [
  {
    children: "Budget",
    href: "/budget",
  },
  {
    children: "Ballot",
    href: "/ballot",
  },
  // {
  //   children: "Metrics",
  //   href: "/ballot/metrics",
  // },
];

export function BallotTabs() {
  const path = usePathname();

  return (
    <section className="flex gap-6 text-2xl">
      {tabs.map((tab, i) => (
        <>
        {i != 0 && <Separator orientation="vertical" className="h-8 text-gray-400 w-[2px]" />}
        <Link
          key={i}
          className={cn("text-gray-400 font-semibold", {
            ["text-foreground"]: tab.href === path, // is active
          })}
          {...tab}
        />
        </>
      ))}
    </section>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { useBudgetContext } from "../budget/provider";

export function BallotTabs() {
  const path = usePathname();
  const { error, allocations } = useBudgetContext();

  const isBallotDisabled = !!error || Object.keys(allocations).length === 0;

  return (
    <section className='flex gap-6 text-2xl'>
      <div>
        <Link
          className={cn("text-gray-400 font-semibold", {
            ["text-foreground"]: "/budget" === path,
          })}
          href='/budget'
        >
          Budget
        </Link>
      </div>
      <Separator orientation='vertical' className='h-8 text-gray-400 w-[2px]' />
      <div>
        {isBallotDisabled ? (
          <span className='text-gray-300 font-semibold cursor-not-allowed'>
            Ballot
          </span>
        ) : (
          <Link
            className={cn("text-gray-400 font-semibold", {
              ["text-foreground"]: "/ballot" === path,
            })}
            href='/ballot'
          >
            Ballot
          </Link>
        )}
      </div>
    </section>
  );
}

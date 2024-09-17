"use client";
import { NumericFormat } from "react-number-format";
import { InfoIcon, Minus, Plus, Trash2 } from "lucide-react";
import { Heading } from "@/components/ui/headings";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useBallotContext } from "../ballot/provider";
import { useSortBallot } from "@/hooks/useBallotEditor";
import { BallotFilter } from "../ballot/ballot-filter";
import { Metric } from "@/hooks/useMetrics";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import mixpanel from "@/lib/mixpanel";
import { DistributionChart } from "../metrics/distribution-chart";
import { Card } from "../ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { DistributionMethod, useDistributionMethod } from "@/hooks/useBallotRound5";

export function MetricsEditor({
  onAllocationMethodSelect,
}: {
  onAllocationMethodSelect?: (data: { x: number; y: number }[]) => void;
}) {
  const { state, inc, dec, set, remove } = useBallotContext();
  const { mutate: saveDistributionMethod } = useDistributionMethod();

  const { sorted } = useSortBallot(state);

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const exponentialDecay = (x: number, initialValue: number = 100, decayRate: number = 0.1): number => {
    return initialValue * Math.exp(-decayRate * x);
  };

  const distributeTopWeighted = (numPoints: number = 40): { x: number; y: number }[] => {
    return Array.from({ length: numPoints }, (_, i) => ({
      x: i,
      y: Math.round(exponentialDecay(i))
    }));
  };

  const linearDecline = (x: number, initialValue: number = 100, slope: number = 2.5): number => {
    const y = initialValue - slope * x;
    return Math.max(y, 0); // Ensure y doesn't go below 0
  };

  const distributeTopToBottomLinear = (numPoints: number = 40): { x: number; y: number }[] => {
    return Array.from({ length: numPoints }, (_, i) => ({
      x: i,
      y: Math.round(linearDecline(i))
    }));
  };

  // const distributeImpactGroups = (numPoints: number = 40): { x: number; y: number }[] => {
  //   const initialValue = 100;
  //   const numOfGroups = 5;
  //   let group = 0;
  //   return Array.from({ length: numPoints }, (_, i) => {
  //     const mod = i % numOfGroups;
  //     if (mod === 0) {
  //       group++;
  //     }
  //     return {
  //       x: i,
  //       y: Math.round(linearDecline(i, initialValue))
  //     }
  //   });
  // };

  // Dummy data for the allocation methods
  const allocationMethods = [
    {
      data: [
        {x: 0, y: 340},
        {x: 10, y: 340},
        {x: 10, y: 255},
        {x: 20, y: 255},
        {x: 20, y: 170},
        {x: 30, y: 170},
        {x: 30, y: 85},
        {x: 40, y: 85},
        {x: 40, y: 0},
        {x: 50, y: 0},
      ],
      // data: distributeImpactGroups(),
      formatChartTick: (tick: number) => `${tick}k`,
      name: "Impact groups",
      description: "blah blah blah",
      method: DistributionMethod.IMPACT_GROUPS,
    },
    {
      // data: [
      //   {x: 0, y: 340},
      //   {x: 10, y: 255},
      //   {x: 20, y: 170},
      //   {x: 30, y: 85},
      //   {x: 40, y: 0},
      // ],
      data: distributeTopToBottomLinear(),
      formatChartTick: (tick: number) => `${tick}k`,
      name: "Top to bottom",
      description: "blah blah blah",
      method: DistributionMethod.TOP_TO_BOTTOM,
    },
    {
      // data: [
      //   {x: 0, y: 400},
      //   {x: 10, y: 100},
      //   {x: 20, y: 50},
      //   {x: 30, y: 30},
      //   {x: 40, y: 20},
      // ],
      data: distributeTopWeighted(),
      formatChartTick: (tick: number) => `${tick}k`,
      name: "Top weighted",
      description: "blah blah blah",
      method: DistributionMethod.TOP_WEIGHTED,
    },
    {
      data: [],
      formatChartTick: (tick: number) => `--k`,
      name: "Custom",
      description: "blah blah blah",
      method: "CUSTOM", // To Do: Change to enum
    },
  ]
  const allocationAmount = "3,333,333";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="mb-4">
          <Heading variant={"h3"}>Your ballot</Heading>
          {/* <div className="text-sm">
            You&apos;ve added {count} of {metrics.length} metrics
          </div> */}
        </div>
        <BallotFilter />
      </div>

      {/* This sections is a work in progress */}
      <div className=" flex flex-col gap-4 py-4 text-sm">
        <p>First, review your project rankings in the list below.</p>
        <p>Then, choose a method to easily allocate rewards across prjects. You can also customize percentages at any time.</p>
        <p>OP calculations in this ballot are based on your budget of {allocationAmount} OP</p>
      </div>

      <div className="flex flex-row justify-between items-end">
        <p className="font-semibold mb-2">Allocation method</p>
        <p className="font-semibold mb-2 text-sm">None selected</p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
        {allocationMethods.map((method, index) => (
          <Card
            key={index}
            className={cn("cursor-pointer", {
              "border-2 border-blue-500": selectedMethod === method.method
            })}
            onClick={() => {
              setSelectedMethod(method.method);
              // onAllocationMethodSelect(method.data);
              if (
                method.method === DistributionMethod.IMPACT_GROUPS
                || method.method === DistributionMethod.TOP_TO_BOTTOM
                || method.method === DistributionMethod.TOP_WEIGHTED
              ) {
                saveDistributionMethod(method.method);
              }
            }}
          >
            <DistributionChart data={method.data} formatChartTick={method.formatChartTick} />
            <div className="mb-2 mx-4 flex flex-row justify-between items-center">
              <p className="font-bold text-sm">{method.name}</p>
              <InfoIcon className="h-4 w-4" />
            </div>
          </Card>
        ))}
      </div>
      {/* ^^This sections is a work in progress^^ */}
    </div>
  );
}

const LockFillLocked = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.6667 6.66732H13.3333C13.7015 6.66732 14 6.96578 14 7.33398V14.0007C14 14.3689 13.7015 14.6673 13.3333 14.6673H2.66667C2.29848 14.6673 2 14.3689 2 14.0007V7.33398C2 6.96578 2.29848 6.66732 2.66667 6.66732H3.33333V6.00065C3.33333 3.42332 5.42267 1.33398 8 1.33398C10.5773 1.33398 12.6667 3.42332 12.6667 6.00065V6.66732ZM11.3333 6.66732V6.00065C11.3333 4.1597 9.84093 2.66732 8 2.66732C6.15905 2.66732 4.66667 4.1597 4.66667 6.00065V6.66732H11.3333ZM7.33333 9.33398V12.0007H8.66667V9.33398H7.33333Z"
      fill="currentColor"
    />
  </svg>
);

const LockFillUnlocked = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.66667 6.66732H13.3333C13.7015 6.66732 14 6.96578 14 7.33398V14.0007C14 14.3689 13.7015 14.6673 13.3333 14.6673H2.66667C2.29848 14.6673 2 14.3689 2 14.0007V7.33398C2 6.96578 2.29848 6.66732 2.66667 6.66732H3.33333V6.00065C3.33333 3.42332 5.42267 1.33398 8 1.33398C9.827 1.33398 11.4087 2.38385 12.1749 3.9132L10.9821 4.50961C10.4348 3.41722 9.305 2.66732 8 2.66732C6.15905 2.66732 4.66667 4.1597 4.66667 6.00065V6.66732ZM6.66667 10.0007V11.334H9.33333V10.0007H6.66667Z"
      fill="currentColor"
    />
  </svg>
);

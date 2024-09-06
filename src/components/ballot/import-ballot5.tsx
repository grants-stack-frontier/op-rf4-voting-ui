"use client";

import { ComponentProps, useCallback, useRef } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { format, parse } from "@/lib/csv";
import { Round5Ballot, Round5ProjectAllocation, useSaveRound5Allocation } from "@/hooks/useBallotRound5";
import { useBallotContext } from "./provider";
import { useMetricIds } from "@/hooks/useMetrics";
import mixpanel from "@/lib/mixpanel";
import { CategoryId, Round5Allocation } from "@/hooks/useBallot";
import { useBallotRound5Context } from "./provider5";

export function ImportBallotDialog({
  isOpen,
  onOpenChange,
}: ComponentProps<typeof Dialog> & { isOpen: boolean }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import ballot</DialogTitle>
          <DialogDescription>
            Heads up! If you import a ballot, you&apos;ll lose your existing
            work. The accepted format is .csv.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <ImportBallotButton />
          <ExportBallotButton />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImportBallotButton() {
  const save = useSaveRound5Allocation();
  const editor = useBallotRound5Context();
  // const { data: metricIds } = useMetricIds();

  const ref = useRef<HTMLInputElement>(null);

  const importCSV = useCallback(
    (csvString: string) => {
      console.log("import csv");
      // Parse CSV and build the ballot data (remove name column)
      const { data } = parse<Round5ProjectAllocation>(csvString);
      const allocations = data
        // .map(({ category_slug, allocation, locked }) => ({
        //   category_slug,
        //   allocation: Number(allocation),
        //   // Only the string "true" and "1" will be matched as locked
        //   locked: ["true", "1"].includes(String(locked)) ? true : false,
        // }))
        // .filter((m) => metricIds?.includes(m.category_slug));

      if (allocations.length !== data.length) {
        alert(
          "One or more of the metric IDs were not correct and have been removed."
        );
      }
      console.log(allocations);
      editor.reset(allocations);

      mixpanel.track("Import CSV", { ballotSize: allocations.length });

      allocations.forEach((allocation) => save.mutate(allocation));
    },
    [editor]
  );

  return (
    <>
      <Button variant="destructive" onClick={() => ref.current?.click()}>
        Import
      </Button>
      <input
        ref={ref}
        type="file"
        accept="*.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => importCSV(String(reader.result));
            reader.onerror = () => console.log(reader.error);
          }
        }}
      />
    </>
  );
}

function ExportBallotButton() {
  // const emptyBallot: Round5Allocation[] = [
  //   { category_slug: 'ETHEREUM_CORE_CONTRIBUTIONS', allocation: 0, locked: false },
  // ];
  const emptyBallot: Round5ProjectAllocation[] = [];

  return (
    <Button variant="outline" onClick={() => exportRound5Ballot(emptyBallot)}>
      Download ballot template
    </Button>
  );
}

export function exportRound5Ballot(ballot: Round5ProjectAllocation[]) {
  const csv = format(
    ballot,
    // ballot.map((alloc) => ({
    //   category_slug: alloc.category_slug,
    //   allocation: alloc.allocation,
    //   locked: alloc.locked,
    // })),
    {}
  );
  console.log(csv);
  mixpanel.track("Export CSV", { ballotSize: ballot.length });
  window.open(`data:text/csv;charset=utf-8,${csv}`);
}

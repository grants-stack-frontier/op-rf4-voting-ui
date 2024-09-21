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
import { Round5ProjectAllocation, useSaveRound5Allocation } from "@/hooks/useBallotRound5";
import mixpanel from "@/lib/mixpanel";
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

  const ref = useRef<HTMLInputElement>(null);

  const importCSV = useCallback(
    (csvString: string) => {
      console.log("import csv");
      // Parse CSV and build the ballot data (remove name column)
      const { data } = parse<Round5ProjectAllocation>(csvString);
      const allocations = data
        .map(({ project_id, allocation }) => ({
          project_id,
          name: editor.ballot?.project_allocations.find(p => p.project_id === project_id)?.name,
          image: editor.ballot?.project_allocations.find(p => p.project_id === project_id)?.image,
          position: editor.ballot?.project_allocations.find(p => p.project_id === project_id)?.position,
          allocation: Number(allocation),
          impact: editor.ballot?.project_allocations.find(p => p.project_id === project_id)?.impact,
        }) as Round5ProjectAllocation)

      if (allocations.length !== data.length) {
        alert(
          "One or more of the project IDs were not correct and have been removed."
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
  const {ballot} = useBallotRound5Context()
  const emptyBallot: any[] = ballot ? 
    ballot.project_allocations.map(alloc => ({
      project_id: alloc.project_id,
      name: alloc.name,
      allocation: 0,
    }))
    : [
      { project_id: "0x0", name: "Some project", allocation: 0 },
    ];

  return (
    <Button variant="outline" onClick={() => exportRound5Ballot(emptyBallot)}>
      Download ballot template
    </Button>
  );
}

export function exportRound5Ballot(ballot: Round5ProjectAllocation[]) {
  const csv = format(
    ballot.filter(alloc => alloc.impact !== 0).map((alloc) => ({
      project_id: alloc.project_id,
      name: alloc.name,
      allocation: alloc.allocation,
    })),
    {}
  );
  console.log(csv);
  mixpanel.track("Export CSV", { ballotSize: ballot.length });
  window.open(`data:text/csv;charset=utf-8,${csv}`);
}

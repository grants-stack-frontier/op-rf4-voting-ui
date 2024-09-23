"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import { useBallotRound5Context } from "./provider5";
import { exportRound5Ballot, ImportBallotDialog } from "./import-ballot5";

export function BallotFilter() {
  const [isOpen, setOpen] = useState(false);
  const { state, ballot } = useBallotRound5Context();

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant={"secondary"}>...</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Import ballot
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => exportRound5Ballot(ballot?.project_allocations ?? [])}
          >
            Export ballot
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ImportBallotDialog isOpen={isOpen} onOpenChange={setOpen} />
    </div>
  );

}

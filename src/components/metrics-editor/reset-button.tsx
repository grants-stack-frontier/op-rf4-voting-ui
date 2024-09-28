'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useBallotRound5Context } from '../ballot/provider5';
import { useSaveProjects } from '@/hooks/useProjects';
import { ImpactScore } from '@/hooks/useProjectImpact';
import { useDistributionMethodFromLocalStorage } from '@/hooks/useBallotRound5';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';

export function ResetButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { ballot } = useBallotRound5Context();
  const { mutateAsync: saveProjects, isPending } = useSaveProjects();
  const { reset: resetDistributionMethod } =
    useDistributionMethodFromLocalStorage();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const handleReset = async () => {
    if (!ballot?.project_allocations || !address) return;
    await saveProjects(
      ballot.project_allocations.map((project) => ({
        project_id: project.project_id,
        allocation: '0',
        impact: project.impact as ImpactScore,
      }))
    );

    resetDistributionMethod();

    queryClient.invalidateQueries({ queryKey: ['ballot-round5', address] });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer flex flex-row items-center gap-1">
          <p className="font-semibold text-sm hover:underline">Reset</p>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.3335 8.00065C1.3335 11.6825 4.31826 14.6673 8.00016 14.6673C11.682 14.6673 14.6668 11.6825 14.6668 8.00065C14.6668 4.31875 11.682 1.33398 8.00016 1.33398V2.66732C10.9457 2.66732 13.3335 5.05513 13.3335 8.00065C13.3335 10.9462 10.9457 13.334 8.00016 13.334C5.05464 13.334 2.66683 10.9462 2.66683 8.00065C2.66683 6.35808 3.40938 4.88894 4.57712 3.9106L6.00016 5.33398V1.33398H2.00016L3.63115 2.96502C2.22356 4.18733 1.3335 5.99005 1.3335 8.00065Z"
              fill="#0F111A"
            />
          </svg>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to reset your ballot?</DialogTitle>
          <DialogDescription>
            You&apos;ll lose any changes you&apos;ve made.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            variant={'destructive'}
            isLoading={isPending}
            onClick={handleReset}
          >
            Reset ballot
          </Button>
          <DialogClose asChild>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

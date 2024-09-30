'use client';

import { Text } from '@/components/ui/text';
import { useMemo } from 'react';
import { Progress } from '../ui/progress';
import { useBallotRound5Context } from './provider5';

export function ScoringProgressBar() {
  const { ballot } = useBallotRound5Context();

  const quantities = useMemo(() => {
    if (ballot) {
      return {
        total: ballot.total_projects,
        toBeEvaluated: ballot.projects_to_be_evaluated.length,
      };
    }
    return {
      total: 0,
      toBeEvaluated: 0,
    };
  }, [ballot]);

  return (
    <>
      <Progress
        value={
          ((quantities.total - quantities.toBeEvaluated) / quantities.total) *
          100
        }
        className="w-60"
      />
      <Text className="text-center max-w-lg mx-auto text-sm text-muted-foreground">
        You&apos;ve scored {quantities.total - quantities.toBeEvaluated} of{' '}
        {quantities.total} projects
      </Text>
    </>
  );
}
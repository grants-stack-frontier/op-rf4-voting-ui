import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ImpactScore, scoreLabels } from '@/hooks/useProjectScoring';
import { cn } from '@/lib/utils';
import { RiCheckLine } from '@remixicon/react';
import { useCallback, useMemo, useState } from 'react';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import { ConflictOfInterestDialog } from '../common/conflict-of-interest-dialog';

type CardProps = React.ComponentProps<typeof Card>;

interface ReviewSidebarProps extends CardProps {
  onScoreSelect: (score: ImpactScore) => void;
  totalProjects: number;
  votedCount: number | undefined;
  isSaving: boolean;
  isVoted: boolean;
  currentProjectScore?: ImpactScore;
  isLoading: boolean;
}

export function ReviewSidebar({
  className,
  onScoreSelect,
  totalProjects,
  votedCount,
  isVoted,
  isSaving,
  isLoading,
  currentProjectScore,
  ...props
}: ReviewSidebarProps) {
  const [localScore, setLocalScore] = useState<ImpactScore | undefined>(
    currentProjectScore
  );
  const [allProjectsScored, setAllProjectsScored] = useState(
    votedCount === totalProjects
  );
  const [isConflictOfInterestDialogOpen, setIsConflictOfInterestDialogOpen] =
    useState(false);

  const handleScore = useCallback(
    (score: ImpactScore) => {
      if (Number(score) === 0) {
        setIsConflictOfInterestDialogOpen(true);
        return;
      } else {
        onScoreSelect(score);
      }
      if (score !== 'Skip') {
        setLocalScore(score);
      }
    },
    [setIsConflictOfInterestDialogOpen, onScoreSelect]
  );

  const sortedScores = useMemo(() => {
    return (Object.entries(scoreLabels) as [ImpactScore, string][])
      .sort(([scoreA], [scoreB]) => {
        if (scoreA === 'Skip') return 1;
        if (scoreB === 'Skip') return -1;
        return Number(scoreB) - Number(scoreA);
      })
      .filter(([score]) => score !== 'Skip')
      .concat([['Skip', scoreLabels['Skip']] as [ImpactScore, string]]);
  }, []);

  return (
    <Card
      className={cn('w-[304px] h-[560px] sticky top-8', className)}
      {...props}
    >
      <CardHeader>
        <CardTitle className="text-base font-medium text-center">
          {isVoted
            ? "You've already voted on this project"
            : "How would you score this project's impact on the OP Stack?"}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col gap-2">
          {sortedScores.map(([score, label]) => {
            return (
              <Button
                key={score}
                variant={score === 'Skip' ? 'link' : 'outline'}
                className={cn(
                  label === 'Conflict of interest'
                    ? 'hover:bg-red-200 hover:text-red-600'
                    : label !== 'Skip'
                      ? 'hover:bg-blue-200 hover:text-blue-600'
                      : '',
                  isVoted &&
                    Number(localScore) === Number(score) &&
                    label !== 'Conflict of interest'
                    ? 'bg-green-200 text-green-600'
                    : isVoted &&
                        Number(localScore) === 0 &&
                        label === 'Conflict of interest'
                      ? 'bg-red-200 text-red-600'
                      : ''
                )}
                onClick={() => handleScore(score)}
                disabled={
                  isLoading ||
                  isSaving ||
                  (score === 'Skip' && allProjectsScored)
                }
              >
                {isVoted && Number(localScore) === Number(score) && (
                  <RiCheckLine className="h-5 w-5 mr-2" />
                )}
                <span>{label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        ) : (
          <>
            <Progress
              value={(votedCount ? votedCount / totalProjects : 0) * 100}
            />
            <p className="text-sm text-muted-foreground">
              You&apos;ve scored {votedCount} out of {totalProjects} projects
            </p>
          </>
        )}
      </CardFooter>
      <ConflictOfInterestDialog
        isOpen={isConflictOfInterestDialogOpen}
        setOpen={setIsConflictOfInterestDialogOpen}
        onConfirm={() => {
          onScoreSelect(0);
          setLocalScore(0);
        }}
      />
    </Card>
  );
}

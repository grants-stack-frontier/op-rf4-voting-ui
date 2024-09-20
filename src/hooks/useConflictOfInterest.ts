import { ProjectsScored } from '@/utils/localStorage';
import { useCallback, useState } from 'react';
import { ImpactScore } from './useProjectScoring';

export function useConflictOfInterest(totalVotedProjects: number, handleScoreSelect: (score: ImpactScore, totalVotedProjects: number) => Promise<{
	updatedProjectsScored: ProjectsScored;
	allProjectsScored: boolean;
}>) {
  const [isConflictOfInterestDialogOpen, setIsConflictOfInterestDialogOpen] = useState(false);

  const handleConflictOfInterestConfirm = useCallback(() => {
    setIsConflictOfInterestDialogOpen(false);
    handleScoreSelect(0 as ImpactScore, totalVotedProjects);
  }, [handleScoreSelect, totalVotedProjects]);

  return {
    isConflictOfInterestDialogOpen,
    setIsConflictOfInterestDialogOpen,
    handleConflictOfInterestConfirm,
  };
}
import { useCallback, useState } from 'react';
import { ImpactScore } from './useProjectScoring';

export function useConflictOfInterest(handleScoreSelect: (score: ImpactScore) => Promise<void>) {
	const [isConflictOfInterestDialogOpen, setIsConflictOfInterestDialogOpen] = useState(false);

	const handleConflictOfInterestConfirm = useCallback(() => {
		setIsConflictOfInterestDialogOpen(false);
		handleScoreSelect(0 as ImpactScore);
	}, [handleScoreSelect]);

	return {
		isConflictOfInterestDialogOpen,
		setIsConflictOfInterestDialogOpen,
		handleConflictOfInterestConfirm,
	};
}

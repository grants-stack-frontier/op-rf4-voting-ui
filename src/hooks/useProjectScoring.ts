import { ProjectsScored, addScoredProject, clearProjectsScored, getProjectsScored } from '@/utils/localStorage';
import { useCallback, useEffect, useState } from 'react';
import { Address } from 'viem';

export type ImpactScore = 0 | 1 | 2 | 3 | 4 | 5 | 'Skip';

export const scoreLabels: Record<ImpactScore, string> = {
	0: 'Conflict of interest',
	1: 'Very low',
	2: 'Low',
	3: 'Medium',
	4: 'High',
	5: 'Very high',
	Skip: 'Skip',
};

// Custom hook for project scoring logic
export const useProjectScoring = (category: string, id: string, walletAddress: Address | undefined) => {
	const [projectsScored, setProjectsScored] = useState<ProjectsScored>({ count: 0, votedIds: [] });
	const [isUnlocked, setIsUnlocked] = useState(false);

	useEffect(() => {
		if (walletAddress) {
			setProjectsScored(getProjectsScored(category, walletAddress));
		}
	}, [category, walletAddress]);

	const handleScoreSelect = useCallback(
		async (score: ImpactScore, totalProjects: number) => {
			if (!walletAddress) {
				console.warn('Wallet address not available');
				return { updatedProjectsScored: projectsScored, allProjectsScored: false };
			}

			let updatedProjectsScored = projectsScored;

			if (score !== 'Skip' && !projectsScored.votedIds.includes(id)) {
				updatedProjectsScored = addScoredProject(category, id, walletAddress);
				setProjectsScored(updatedProjectsScored);
			}

			const allProjectsScored = updatedProjectsScored.count === totalProjects;

			if (allProjectsScored) {
				setIsUnlocked(true);
				clearProjectsScored(category, walletAddress);
				setProjectsScored({ count: 0, votedIds: [] });
			}

			return { updatedProjectsScored, allProjectsScored };
		},
		[category, id, projectsScored, walletAddress]
	);

	return { projectsScored, isUnlocked, setIsUnlocked, handleScoreSelect };
};

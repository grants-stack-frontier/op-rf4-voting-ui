import { Project } from '@/__generated__/api/agora.schemas';
import {
	ProjectsScored,
	addScoredProject,
	addSkippedProject,
	clearProjectsScored,
	getProjectsScored,
} from '@/utils/localStorage';
import { useCallback, useEffect, useState } from 'react';
import { Address } from 'viem';
import { Round5Ballot } from './useBallotRound5';

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
export const useProjectScoring = (
	category: string,
	id: string,
	walletAddress: Address | undefined,
	ballot: Round5Ballot | undefined,
	projects: Project[] | undefined
) => {
	const [projectsScored, setProjectsScored] = useState<ProjectsScored>({
		votedCount: 0,
		votedIds: [],
		skippedCount: 0,
		skippedIds: [],
	});
	const [isUnlocked, setIsUnlocked] = useState(false);

	useEffect(() => {
		if (walletAddress) {
			let storedProjectsScored = getProjectsScored(category, walletAddress);

			// Compare project_allocations with projects and update votedIds and votedCount
			if (ballot && ballot.project_allocations && projects) {
				const allocatedIds = ballot.project_allocations.map((allocation: any) => allocation.project_id);
				const projectIds = projects.map((project: any) => project.applicationId);

				const newVotedIds = projectIds.filter((id: string) => allocatedIds.includes(id));

				if (newVotedIds.length > 0) {
					const updatedVotedIds = Array.from(new Set([...storedProjectsScored.votedIds, ...newVotedIds]));
					storedProjectsScored = {
						...storedProjectsScored,
						votedCount: updatedVotedIds.length,
						votedIds: updatedVotedIds,
					};
					setProjectsScored(storedProjectsScored);
				}
			}

			setProjectsScored(storedProjectsScored);
		}
	}, [category, walletAddress, ballot, projects]);

	const handleScoreSelect = useCallback(
		async (score: ImpactScore, totalVotedProjects: number) => {
			if (!walletAddress) {
				console.warn('Wallet address not available');
				return { updatedProjectsScored: projectsScored, allProjectsScored: false };
			}

			let updatedProjectsScored = projectsScored;

			if (score === 'Skip') {
				updatedProjectsScored = addSkippedProject(category, id, walletAddress);
				setProjectsScored(updatedProjectsScored);
			} else if (!updatedProjectsScored.votedIds.includes(id)) {
				updatedProjectsScored = addScoredProject(category, id, walletAddress);
				setProjectsScored(updatedProjectsScored);
			}

			const allProjectsScored = updatedProjectsScored.votedCount === totalVotedProjects;

			if (allProjectsScored) {
				setIsUnlocked(true);
				clearProjectsScored(category, walletAddress);
				setProjectsScored({ votedCount: 0, votedIds: [], skippedCount: 0, skippedIds: [] });
			}

			return { updatedProjectsScored, allProjectsScored };
		},
		[category, id, projectsScored, walletAddress]
	);

	return { projectsScored, isUnlocked, setIsUnlocked, handleScoreSelect };
};

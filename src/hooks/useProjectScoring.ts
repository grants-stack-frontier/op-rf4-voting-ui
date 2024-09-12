import { ProjectsScored, addScoredProject, clearProjectsScored, getProjectsScored } from '@/utils/localStorage';
import { useCallback, useEffect, useState } from 'react';

export type ImpactScore = 0 | 1 | 2 | 3 | 4 | 5 | 'Skip';

export const scoreLabels: Record<ImpactScore, string> = {
	0: 'Conflict of Interest',
	1: 'Very Low',
	2: 'Low',
	3: 'Medium',
	4: 'High',
	5: 'Very High',
	Skip: 'Skip',
};

// Custom hook for project scoring logic
export const useProjectScoring = (category: string, id: string) => {
	const [projectsScored, setProjectsScored] = useState<ProjectsScored>({ category, count: 0, votedIds: [] });
	const [isUnlocked, setIsUnlocked] = useState(false);

	useEffect(() => {
		setProjectsScored(getProjectsScored(category));
	}, [category]);

	const handleScoreSelect = useCallback(
		async (score: ImpactScore, totalProjects: number) => {
			let updatedProjectsScored = projectsScored;

			if (score !== 'Skip' && !projectsScored.votedIds.includes(id)) {
				updatedProjectsScored = addScoredProject(category, id);
			}

			const allProjectsScored = updatedProjectsScored.count === totalProjects;

			if (allProjectsScored) {
				setIsUnlocked(true);
				clearProjectsScored(category);
				setProjectsScored({ category, count: 0, votedIds: [] });
			}

			return { updatedProjectsScored, allProjectsScored };
		},
		[category, id, projectsScored]
	);

	return { projectsScored, isUnlocked, setIsUnlocked, handleScoreSelect };
};

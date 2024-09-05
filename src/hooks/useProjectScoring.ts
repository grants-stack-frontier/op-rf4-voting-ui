import { ProjectsScored, addScoredProject, clearProjectsScored, getProjectsScored } from '@/utils/localStorage';
import { useCallback, useEffect, useState } from 'react';
import { useSaveProjectImpact } from './useProjects';

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
	const saveProjectImpact = useSaveProjectImpact();

	useEffect(() => {
		setProjectsScored(getProjectsScored(category));
	}, [category]);

	const handleScoreSelect = useCallback(
		(score: ImpactScore, totalProjects: number) => {
			let updatedProjectsScored = projectsScored;

			if (score !== 'Skip' && !projectsScored.votedIds.includes(id)) {
				updatedProjectsScored = addScoredProject(category, id);
				saveProjectImpact.mutate({ projectId: id, impact: score });
				setProjectsScored(updatedProjectsScored);
			}

			const allProjectsScored = updatedProjectsScored.count === totalProjects;

			if (allProjectsScored) {
				setIsUnlocked(true);
				clearProjectsScored(category);
				setProjectsScored({ category, count: 0, votedIds: [] });
			}

			return allProjectsScored;
		},
		[category, id, projectsScored, saveProjectImpact]
	);

	return { projectsScored, isUnlocked, setIsUnlocked, handleScoreSelect };
};

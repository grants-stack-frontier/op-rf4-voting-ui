const PROJECTS_SCORED_KEY = 'projectsScored';

export type ProjectsScored = {
	category: string;
	count: number;
	votedIds: string[];
};

export const getProjectsScored = (category: string): ProjectsScored => {
	if (typeof window === 'undefined') return { category, count: 0, votedIds: [] };
	const stored = localStorage.getItem(PROJECTS_SCORED_KEY);
	const allData = stored ? JSON.parse(stored) : {};
	return allData[category] || { category, count: 0, votedIds: [] };
};

export const setProjectsScored = (data: ProjectsScored): void => {
	if (typeof window === 'undefined') return;
	const stored = localStorage.getItem(PROJECTS_SCORED_KEY);
	const allData = stored ? JSON.parse(stored) : {};
	allData[data.category] = data;
	localStorage.setItem(PROJECTS_SCORED_KEY, JSON.stringify(allData));
};

export const addScoredProject = (category: string, projectId: string): ProjectsScored => {
	const current = getProjectsScored(category);
	if (!current.votedIds.includes(projectId)) {
		current.count += 1;
		current.votedIds.push(projectId);
		setProjectsScored(current);
	}
	return current;
};

export function clearProjectsScored(category: string): void {
	const stored = localStorage.getItem(PROJECTS_SCORED_KEY);
	if (stored) {
		const allData = JSON.parse(stored);
		delete allData[category];
		localStorage.setItem(PROJECTS_SCORED_KEY, JSON.stringify(allData));
	}
}

import { Address } from "viem";

const PROJECTS_SCORED_KEY = 'projectsScored';

export type ProjectsScored = {
	count: number;
	votedIds: string[];
};

export const getProjectsScored = (category: string, walletAddress: Address): ProjectsScored => {
	if (typeof window === 'undefined') return { count: 0, votedIds: [] };
	const stored = localStorage.getItem(PROJECTS_SCORED_KEY);
	const allData = stored ? JSON.parse(stored) : {};
	return allData[walletAddress]?.[category] || { count: 0, votedIds: [] };
};

export const setProjectsScored = (category: string, walletAddress: Address, data: ProjectsScored): void => {
	if (typeof window === 'undefined') return;
	const stored = localStorage.getItem(PROJECTS_SCORED_KEY);
	const allData = stored ? JSON.parse(stored) : {};
	if (!allData[walletAddress]) {
		allData[walletAddress] = {};
	}
	allData[walletAddress][category] = data;
	localStorage.setItem(PROJECTS_SCORED_KEY, JSON.stringify(allData));
};

export const addScoredProject = (category: string, projectId: string, walletAddress: Address): ProjectsScored => {
	const current = getProjectsScored(category, walletAddress);
	if (!current.votedIds.includes(projectId)) {
		current.count += 1;
		current.votedIds.push(projectId);
		setProjectsScored(category, walletAddress, current);
	}
	return current;
};

export function clearProjectsScored(category: string, walletAddress: Address): void {
	const stored = localStorage.getItem(PROJECTS_SCORED_KEY);
	if (stored) {
		const allData = JSON.parse(stored);
		if (allData[walletAddress]) {
			delete allData[walletAddress][category];
			if (Object.keys(allData[walletAddress]).length === 0) {
				delete allData[walletAddress];
			}
		}
		localStorage.setItem(PROJECTS_SCORED_KEY, JSON.stringify(allData));
	}
}

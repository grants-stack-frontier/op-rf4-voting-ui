import { Address } from 'viem';

const PROJECTS_SCORED_KEY = 'projectsScored';
const INTRO_SEEN_KEY = 'introSeen';

export type ProjectsScored = {
  votedCount: number;
  votedIds: string[];
  skippedCount: number;
  skippedIds: string[];
};

export const getProjectsScored = (
  category: string,
  walletAddress: Address
): ProjectsScored => {
  if (typeof window === 'undefined')
    return { votedCount: 0, votedIds: [], skippedCount: 0, skippedIds: [] };
  const stored = localStorage.getItem(PROJECTS_SCORED_KEY);
  const allData = stored ? JSON.parse(stored) : {};
  return (
    allData[walletAddress]?.[category] || {
      votedCount: 0,
      votedIds: [],
      skippedCount: 0,
      skippedIds: [],
    }
  );
};

export const setProjectsScored = (
  category: string,
  walletAddress: Address,
  data: ProjectsScored
): void => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(PROJECTS_SCORED_KEY);
  const allData = stored ? JSON.parse(stored) : {};
  if (!allData[walletAddress]) {
    allData[walletAddress] = {};
  }
  allData[walletAddress][category] = data;
  localStorage.setItem(PROJECTS_SCORED_KEY, JSON.stringify(allData));
};

export const addScoredProject = (
  category: string,
  projectId: string,
  walletAddress: Address
): ProjectsScored => {
  const current = getProjectsScored(category, walletAddress);
  if (!current.votedIds.includes(projectId)) {
    current.votedCount += 1;
    current.votedIds.push(projectId);
    setProjectsScored(category, walletAddress, current);
  }
  return current;
};

export const addSkippedProject = (
  category: string,
  projectId: string,
  walletAddress: Address
): ProjectsScored => {
  const current = getProjectsScored(category, walletAddress);
  if (!current.skippedIds?.includes(projectId)) {
    current.skippedCount += 1;
    current.skippedIds.push(projectId);
    setProjectsScored(category, walletAddress, current);
  }
  return current;
};

export function clearProjectsScored(
  category: string,
  walletAddress: Address | undefined
): void {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(PROJECTS_SCORED_KEY);
  if (stored) {
    const allData = JSON.parse(stored);
    if (
      walletAddress &&
      allData[walletAddress] &&
      category &&
      allData[walletAddress][category]
    ) {
      delete allData[walletAddress][category];
      if (Object.keys(allData[walletAddress]).length === 0) {
        delete allData[walletAddress];
      }
    }
    localStorage.setItem(PROJECTS_SCORED_KEY, JSON.stringify(allData));
  }
}

export const hasSeenIntro = (walletAddress: Address): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(INTRO_SEEN_KEY);
  const allData = stored ? JSON.parse(stored) : {};
  return !!allData[walletAddress];
};

export const markIntroAsSeen = (walletAddress: Address): void => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(INTRO_SEEN_KEY);
  const allData = stored ? JSON.parse(stored) : {};
  allData[walletAddress] = true;
  localStorage.setItem(INTRO_SEEN_KEY, JSON.stringify(allData));
};

export function updateVotedProjectsFromAllocations(
  category: string,
  walletAddress: Address,
  allocations: { project_id: string }[] | undefined
): ProjectsScored {
  const current = getProjectsScored(category, walletAddress);

  if (allocations && allocations.length > 0) {
    const votedIds = Array.from(new Set(allocations.map((a) => a.project_id)));
    const newVotedIdsString = JSON.stringify(votedIds.sort());
    const currentVotedIdsString = JSON.stringify(current.votedIds.sort());

    if (newVotedIdsString !== currentVotedIdsString) {
      const updatedData: ProjectsScored = {
        ...current,
        votedCount: votedIds.length,
        votedIds: votedIds,
      };

      setProjectsScored(category, walletAddress, updatedData);

      return updatedData;
    }
  }

  return current;
}

import { Address } from 'viem';

const PROJECTS_SKIPPED_KEY = 'projectsSkipped';
const INTRO_SEEN_KEY = 'introSeen';

export type ProjectsSkipped = {
  ids: string[];
};

export const getProjectsSkipped = (
  category: string,
  walletAddress: Address
): ProjectsSkipped => {
  if (typeof window === 'undefined') return { ids: [] };
  const stored = localStorage.getItem(PROJECTS_SKIPPED_KEY);
  const allData = stored ? JSON.parse(stored) : {};
  return (
    allData[walletAddress]?.[category] || {
      ids: [],
    }
  );
};

export const setProjectsSkipped = (
  category: string,
  walletAddress: Address,
  data: ProjectsSkipped | undefined
): void => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(PROJECTS_SKIPPED_KEY);
  const allData = stored ? JSON.parse(stored) : {};
  if (!allData[walletAddress]) {
    allData[walletAddress] = {};
  }
  if (data) {
    allData[walletAddress][category] = data;
  } else {
    delete allData[walletAddress][category];
  }
  localStorage.setItem(PROJECTS_SKIPPED_KEY, JSON.stringify(allData));
};

export const addSkippedProject = (
  category: string,
  projectId: string,
  walletAddress: Address
): ProjectsSkipped => {
  const current = getProjectsSkipped(category, walletAddress);
  if (!current.ids?.includes(projectId)) {
    current.ids.push(projectId);
    setProjectsSkipped(category, walletAddress, current);
  }
  return current;
};

export function removeSkippedProject(
  category: string,
  projectId: string,
  walletAddress: Address
): ProjectsSkipped {
  const current = getProjectsSkipped(category, walletAddress);
  current.ids = current.ids.filter((id) => id !== projectId);
  setProjectsSkipped(category, walletAddress, current);
  return current;
}

export function clearProjectsSkipped(
  category: string,
  walletAddress: Address | undefined
): void {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(PROJECTS_SKIPPED_KEY);
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
    localStorage.setItem(PROJECTS_SKIPPED_KEY, JSON.stringify(allData));
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

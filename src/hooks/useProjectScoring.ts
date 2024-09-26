import { Project } from '@/__generated__/api/agora.schemas';
import { toast } from '@/components/ui/use-toast';
import { HttpStatusCode } from '@/enums/http-status-codes';
import { useSaveProjectImpact } from '@/hooks/useProjects';
import {
  ProjectsScored,
  addScoredProject,
  addSkippedProject,
  getProjectsScored,
  updateVotedProjectsFromAllocations,
} from '@/utils/localStorage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'viem';
import { Round5ProjectAllocation } from './useBallotRound5';

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
  allocations: Round5ProjectAllocation[] | undefined,
  projects: Project[] | undefined,
  projectsScored: ProjectsScored | undefined,
  setProjectsScored: React.Dispatch<
    React.SetStateAction<ProjectsScored | undefined>
  >
) => {
  const [allProjectsScored, setAllProjectsScored] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { mutateAsync: saveProjectImpact } = useSaveProjectImpact();

  // Ensure projects are loaded before calculating totalProjects
  const totalProjects = useMemo(() => {
    return projects && projects.length > 0 ? projects.length : undefined;
  }, [projects]);

  // Calculate initial state during render
  const initialProjectsScored = useMemo(() => {
    if (!walletAddress || !category || !allocations || !totalProjects) {
      return undefined;
    }
    const storedProjectsScored = getProjectsScored(category, walletAddress);
    const totalAllocations = allocations.length;

    if (
      (storedProjectsScored.votedCount === 0 &&
        totalAllocations !== totalProjects) ||
      storedProjectsScored.votedCount > totalAllocations
    ) {
      return storedProjectsScored;
    } else {
      if (storedProjectsScored.votedCount === totalProjects) {
        setAllProjectsScored(true);
      }
      return updateVotedProjectsFromAllocations(
        category,
        walletAddress,
        allocations
      );
    }
  }, [category, walletAddress, allocations, totalProjects]);

  useEffect(() => {
    if (initialProjectsScored) {
      setProjectsScored(initialProjectsScored);
      setIsLoading(false);
    }
  }, [initialProjectsScored, setProjectsScored]);

  const handleScoreSelect = useCallback(
    async (score: ImpactScore) => {
      if (!walletAddress) {
        console.warn('Wallet address not available');
        return {
          updatedProjectsScored: projectsScored,
          allProjectsScored: false,
        };
      }

      let updatedProjectsScored;

      if (score === 'Skip') {
        updatedProjectsScored = addSkippedProject(category, id, walletAddress);
      } else {
        setIsSaving(true);
        toast({
          variant: 'default',
          loading: true,
          title: 'Saving your impact score...',
        });
        try {
          const result = await saveProjectImpact({
            projectId: id,
            impact: score,
          });
          if (result.status === HttpStatusCode.OK) {
            updatedProjectsScored = addScoredProject(
              category,
              id,
              walletAddress
            );
            toast({
              variant: 'default',
              title: 'Impact score was saved successfully!',
            });
          } else {
            throw new Error('Error saving impact score');
          }
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error saving impact score' });
          setIsSaving(false);
          return {
            updatedProjectsScored: projectsScored,
            allProjectsScored: false,
          };
        } finally {
          setIsSaving(false);
        }
      }

      setProjectsScored(updatedProjectsScored);

      // Only set allProjectsScored if totalProjects is defined and greater than 0
      if (
        totalProjects &&
        updatedProjectsScored.votedCount +
          updatedProjectsScored.skippedCount ===
          totalProjects
      ) {
        setAllProjectsScored(true);
      }

      return {
        updatedProjectsScored,
        allProjectsScored:
          updatedProjectsScored.votedCount +
            updatedProjectsScored.skippedCount ===
          totalProjects,
      };
    },
    [
      category,
      id,
      projectsScored,
      walletAddress,
      totalProjects,
      saveProjectImpact,
      setProjectsScored,
    ]
  );

  return { allProjectsScored, handleScoreSelect, isLoading, isSaving };
};

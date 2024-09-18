import { useState, useEffect, useRef, useCallback } from "react";
import { useProjects } from "@/hooks/useProjects";
import { CategoryId } from "@/types/shared";
import debounce from "lodash.debounce";
import { calculateBalancedAmounts, isCloseEnough } from "@/lib/budget-helpers";
import { useBudget } from "./useBudget";
import { categories } from "@/data/categories";
import { useAccount } from "wagmi";
import { updateRetroFundingRoundBudgetAllocation } from "@/__generated__/api/agora";

export function useBudgetForm() {
  const roundId = 5;

  const projects = useProjects();
  const { getBudget, saveAllocation, getBudgetAmount } = useBudget(roundId);
  const [totalBudget, setTotalBudget] = useState<number>(2000000);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});
  const [countPerCategory, setCountPerCategory] = useState<
    Record<string, number>
  >({});
  const [error, setError] = useState("");
  const { address } = useAccount();

  const allocationsRef = useRef(allocations);
  const lockedFieldsRef = useRef(lockedFields);

  const checkTotalAllocation = useCallback((allocs: Record<string, number>) => {
    const total = Object.values(allocs).reduce((sum, value) => sum + value, 0);
    const diff = (100 - total).toFixed(5);

    if (!isCloseEnough(total, 100)) {
      if (total < 100) {
        setError(
          `Percentages must equal 100% (add ${diff}% to your categories)`
        );
      } else {
        setError(
          `Percentages must equal 100% (remove ${Math.abs(
            Number(diff)
          )}% from your categories)`
        );
      }
      return false;
    }
    setError("");
    return true;
  }, []);

  const getDefaultAllocations = useCallback((categories: any[]) => {
    return categories.reduce((acc, category) => {
      acc[category.id] = 33.33;
      return acc;
    }, {} as Record<string, number>);
  }, []);

  useEffect(() => {
    if (getBudget.data) {
      setTotalBudget(getBudget.data.budget ?? 2000000);
      
      const newAllocations: Record<string, number> = {};
      const newLockedFields: Record<string, boolean> = {};
      getBudget.data.allocations.forEach((allocation) => {
        if (allocation.category_slug !== undefined) {
          newAllocations[allocation.category_slug] = Number(allocation.allocation);
          newLockedFields[allocation.category_slug] = allocation.locked ?? false;
        }
      });
      setAllocations(newAllocations);
      setLockedFields(newLockedFields);
      checkTotalAllocation(newAllocations);
    }
  }, [getBudget.data, checkTotalAllocation]);

  useEffect(() => {
    allocationsRef.current = allocations;
  }, [allocations]);

  useEffect(() => {
    lockedFieldsRef.current = lockedFields;
  }, [lockedFields]);

  useEffect(() => {
    if (projects.data && categories) {
      const counts = projects.data.reduce((acc, project) => {
        const categoryId = project.applicationCategory;
        if (categoryId !== undefined) {
          acc[categoryId] = (acc[categoryId] ?? 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      setCountPerCategory(counts);

      if (getBudget?.data?.allocations && getBudget?.data?.allocations.length > 0) {
        setAllocations((prevAllocations) => {
          const newAllocations: Record<string, number> = {};
          getBudget?.data?.allocations.forEach((allocation) => {
            if (allocation.category_slug !== undefined) {
              newAllocations[allocation.category_slug] = Number(
                allocation.allocation
              );
            }
          });

          return Object.keys(newAllocations).some(
            (key) => newAllocations[key] !== prevAllocations[key]
          )
            ? newAllocations
            : prevAllocations;
        });

        setLockedFields((prevLockedFields) => {
          const newLockedFields: Record<string, boolean> = {};
          getBudget?.data?.allocations.forEach((allocation) => {
            if (allocation.category_slug !== undefined) {
              newLockedFields[allocation.category_slug] =
                allocation.locked ?? false;
            }
          });

          return Object.keys(newLockedFields).some(
            (key) => newLockedFields[key] !== prevLockedFields[key]
          )
            ? newLockedFields
            : prevLockedFields;
        });
      } else {
        const defaultAllocations = getDefaultAllocations(categories);
        setAllocations(defaultAllocations);

        const defaultLockedFields = categories.reduce((acc, category) => {
          acc[category.id] = false;
          return acc;
        }, {} as Record<string, boolean>);

        setLockedFields(defaultLockedFields);
      }

      checkTotalAllocation(
        getBudget?.data?.allocations && getBudget?.data?.allocations.length > 0
          ? Object.fromEntries(
              getBudget?.data?.allocations.map((allocation) => [
                allocation.category_slug,
                Number(allocation.allocation),
              ])
            )
          : getDefaultAllocations(categories)
      );
    }
  }, [
    projects.data,
    getBudget?.data?.allocations,
    getDefaultAllocations,
    checkTotalAllocation,
  ]);

  const saveAllocationToBackend = useCallback(
    (categoryId: CategoryId, allocation: number, locked: boolean) => {
      saveAllocation.mutate(
        {
          category_slug: categoryId,
          allocation: allocation,
          locked: locked,
        },
        {
          onError: () => {
            setError("An error occurred while saving. Please try again.");
          },
        }
      );
    },
    [saveAllocation]
  );

  const debouncedSaveAllocation = useRef(
    debounce(saveAllocationToBackend, 300)
  ).current;

  const handleValueChange = useCallback(
    (categoryId: CategoryId, newValue: number) => {
      if (!address) return;

      const unlockedCategories = Object.entries(lockedFields).filter(
        ([_, isLocked]) => !isLocked
      );
      if (
        unlockedCategories.length === 1 &&
        unlockedCategories[0][0] === categoryId
      ) {
        setError(
          "Cannot modify the only unlocked category. Please unlock at least one other category."
        );
        return;
      }

      const validatedValue = Math.max(0, Math.min(newValue, 100));
      const tempAllocations = { ...allocations, [categoryId]: validatedValue };
      const rebalancedAllocations = calculateBalancedAmounts(
        tempAllocations,
        lockedFields,
        categoryId,
        validatedValue
      );

      if (!checkTotalAllocation(rebalancedAllocations)) return;

      setError("");

      setAllocations(rebalancedAllocations);
      setLockedFields((prev) => ({
        ...prev,
        [categoryId]: true,
      }));

      debouncedSaveAllocation(
        categoryId,
        rebalancedAllocations[categoryId],
        true
      );
    },
    [
      address,
      allocations,
      lockedFields,
      checkTotalAllocation,
      debouncedSaveAllocation,
    ]
  );

  const toggleLock = useCallback(
    (categoryId: CategoryId) => {
      setLockedFields((prev) => {
        const newLockedState = !prev[categoryId];
        saveAllocationToBackend(
          categoryId,
          allocations[categoryId],
          newLockedState
        );
        return { ...prev, [categoryId]: newLockedState };
      });
    },
    [allocations, saveAllocationToBackend]
  );
  
  const saveTotalBudgetToBackend = useCallback(
    async (budget: number) => {
      if (!address) return;
      try {
        await updateRetroFundingRoundBudgetAllocation(roundId, address, budget);
      } catch (error) {
        console.error("Failed to save budget allocation:", error);
        setError("An error occurred while saving the total budget. Please try again.");
      }
    },
    [address]
  );

  const debouncedSaveTotalBudget = useRef(
    debounce(saveTotalBudgetToBackend, 300)
  ).current;

  const handleTotalBudgetChange = useCallback(
    (newBudget: number) => {
      setTotalBudget(newBudget);
      debouncedSaveTotalBudget(newBudget);
    },
    [debouncedSaveTotalBudget]
  );

  const isLoading =
    getBudget.isLoading ||
    getBudget.isFetching ||
    projects.isLoading ||
    projects.isFetching ||
    getBudgetAmount.isLoading ||
    getBudgetAmount.isFetching ||
    saveAllocation.isPending;

  return {
    categories,
    countPerCategory,
    allocations,
    budget: getBudget.data?.budget,
    lockedFields,
    handleValueChange,
    toggleLock,
    error,
    isLoading,
    totalBudget,
    setTotalBudget: handleTotalBudgetChange,
  };
}

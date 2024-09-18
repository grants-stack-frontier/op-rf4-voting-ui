import { useState, useEffect, useRef, useCallback } from "react";
import { useProjects } from "@/hooks/useProjects";
import { CategoryId } from "@/types/shared";
import debounce from "lodash.debounce";
import { calculateBalancedAmounts, isCloseEnough } from "@/lib/budget-helpers";
import { useBudget } from "./useBudget";
import { categories } from "@/data/categories";

export function useBudgetForm() {
  const roundId = 5;

  const projects = useProjects();
  const { getBudget, saveAllocation, getBudgetAmount } = useBudget(roundId);
  const [totalBudget, setTotalBudget] = useState(8000000); // Default to 8M OP
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});
  const [countPerCategory, setCountPerCategory] = useState<
    Record<string, number>
  >({});
  const [error, setError] = useState("");

  const allocationsRef = useRef(allocations);
  const lockedFieldsRef = useRef(lockedFields);

  const checkTotalAllocation = useCallback((allocs: Record<string, number>) => {
    const total = Object.values(allocs).reduce((sum, value) => sum + value, 0);
    const diff = (100 - total).toFixed(2);

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
      const newAllocations: Record<string, number> = {};
      getBudget.data.forEach((allocation) => {
        if (allocation.category_slug !== undefined) {
          newAllocations[allocation.category_slug] = Number(
            allocation.allocation
          );
        }
      });
      setAllocations(newAllocations);
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

      if (getBudget.data && getBudget.data.length > 0) {
        setAllocations((prevAllocations) => {
          const newAllocations: Record<string, number> = {};
          getBudget.data.forEach((allocation) => {
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
          getBudget.data.forEach((allocation) => {
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
        getBudget.data && getBudget.data.length > 0
          ? Object.fromEntries(
              getBudget.data.map((allocation) => [
                allocation.category_slug,
                Number(allocation.allocation),
              ])
            )
          : getDefaultAllocations(categories)
      );
    }
  }, [projects.data, getBudget.data, getDefaultAllocations, checkTotalAllocation]);

  const debouncedSaveAllocation = useRef(
    debounce(
      (allocationToSave: {
        categoryId: CategoryId;
        allocation: number;
        locked: boolean;
      }) => {
        saveAllocation.mutate(
          {
            category_slug: allocationToSave.categoryId,
            allocation: allocationToSave.allocation,
            locked: allocationToSave.locked,
          },
          {
            onError: () => {
              setError("An error occurred while saving. Please try again.");
            },
          }
        );
      },
      300
    )
  ).current;

  const handleValueChange = useCallback(
    (categoryId: CategoryId, newValue: number, locked: boolean) => {
      const validatedValue = Math.max(0, newValue);
      const originalValue = allocations[categoryId];

      const tempAllocations = {
        ...allocationsRef.current,
        [categoryId]: validatedValue,
      };
      const rebalancedAllocations = calculateBalancedAmounts(
        tempAllocations,
        lockedFieldsRef.current,
        categoryId,
        validatedValue
      );

      if (!checkTotalAllocation(rebalancedAllocations)) {
        setAllocations((prev) => ({
          ...prev,
          [categoryId]: originalValue,
        }));
        return;
      }

      setAllocations(rebalancedAllocations);

      debouncedSaveAllocation({
        categoryId,
        allocation: validatedValue,
        locked,
      });
    },
    [debouncedSaveAllocation, allocations, checkTotalAllocation]
  );

  const toggleLock = useCallback(
    (categoryId: CategoryId) => {
      const newLockedState = !lockedFields[categoryId];
      const originalLockState = lockedFields[categoryId];

      setLockedFields((prev) => ({
        ...prev,
        [categoryId]: newLockedState,
      }));

      debouncedSaveAllocation({
        categoryId,
        allocation: allocationsRef.current[categoryId],
        locked: newLockedState,
      });

      saveAllocation.mutate(
        {
          category_slug: categoryId,
          allocation: allocationsRef.current[categoryId],
          locked: newLockedState,
        },
        {
          onError: () => {
            setError(
              "An error occurred while toggling lock. Please try again."
            );
            setLockedFields((prev) => ({
              ...prev,
              [categoryId]: originalLockState,
            }));
          },
        }
      );
    },
    [debouncedSaveAllocation, lockedFields, saveAllocation]
  );

  const refetchBudget = useCallback(() => {
    getBudget.refetch();
  }, [getBudget]);

  const isLoading =
    getBudget.isLoading ||
    getBudget.isFetching ||
    projects.isLoading ||
    projects.isFetching ||
    getBudgetAmount.isLoading ||
    getBudgetAmount.isFetching ||
    saveAllocation.isPending;

  return {
    categories: categories,
    countPerCategory,
    allocations,
    lockedFields,
    handleValueChange,
    toggleLock,
    refetchBudget,
    error,
    isLoading,
    totalBudget,
    setTotalBudget,
  };
}

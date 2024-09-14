"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useBudgetForm } from "@/hooks/useBudgetForm";
import { Category } from "@/data/categories";
import { CategoryId } from "@/types/shared";

interface BudgetContextType {
  categories: Category[] | undefined;
  countPerCategory: Record<string, number>;
  allocations: Record<string, number>;
  lockedFields: Record<string, boolean>;
  handleValueChange: (
    categoryId: CategoryId,
    newValue: number,
    locked: boolean
  ) => void;
  refetchBudget: () => void;
  toggleLock: (categoryId: CategoryId) => void;
  error: string;
  isLoading: boolean;
}

const EPSILON = 1e-10;

const isCloseEnough = (value: number, target: number): boolean => {
  return Math.abs(value - target) < EPSILON;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: React.PropsWithChildren) {
  const categories = useCategories();
  const projects = useProjects();
  const roundId = 5;
  const { getBudget, saveAllocation } = useBudgetForm(roundId);

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});
  const [countPerCategory, setCountPerCategory] = useState<
    Record<string, number>
  >({});
  const [error, setError] = useState("");

  // Remove isEditing state and references

  useEffect(() => {
    if (projects.data && categories.data) {
      const counts = projects.data.reduce((acc, project) => {
        const category = categories.data.find(
          (cat) => cat.id === project.category
        );
        if (category) {
          acc[category.id] = (acc[category.id] ?? 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      setCountPerCategory(counts);

      if (getBudget.data) {
        // Only update allocations if they have changed
        setAllocations((prevAllocations) => {
          const newAllocations: Record<string, number> = {};
          getBudget.data.forEach((allocation) => {
            if (allocation.category_slug !== undefined) {
              newAllocations[allocation.category_slug] = Number(
                allocation.allocation
              );
            }
          });

          // Compare newAllocations with prevAllocations
          const allocationsChanged = Object.keys(newAllocations).some(
            (key) => newAllocations[key] !== prevAllocations[key]
          );

          if (allocationsChanged) {
            return newAllocations;
          } else {
            return prevAllocations;
          }
        });

        setLockedFields((prevLockedFields) => {
          const newLockedFields: Record<string, boolean> = {};
          getBudget.data.forEach((allocation) => {
            if (allocation.category_slug !== undefined) {
              newLockedFields[allocation.category_slug] =
                allocation.locked ?? false;
            }
          });

          // Compare newLockedFields with prevLockedFields
          const lockedFieldsChanged = Object.keys(newLockedFields).some(
            (key) => newLockedFields[key] !== prevLockedFields[key]
          );

          if (lockedFieldsChanged) {
            return newLockedFields;
          } else {
            return prevLockedFields;
          }
        });
      } else if (categories.data) {
        const defaultAllocations = categories.data.reduce((acc, category) => {
          acc[category.id] = 100 / categories.data.length;
          return acc;
        }, {} as Record<string, number>);

        setAllocations(defaultAllocations);

        const defaultLockedFields = categories.data.reduce((acc, category) => {
          acc[category.id] = false;
          return acc;
        }, {} as Record<string, boolean>);

        setLockedFields(defaultLockedFields);
      }
    }
  }, [projects.data, categories.data, getBudget.data]);

  const autobalanceAllocations = useCallback(
    (
      allocations: Array<{ id: string; allocation: number; locked: boolean }>,
      idToSkip: string
    ) => {
      const [amountToBalance, totalUnlocked, unlockedEntities] =
        allocations.reduce(
          (acc, allocation) => {
            acc[0] -=
              allocation.locked || allocation.id === idToSkip
                ? Number(allocation.allocation.toFixed(2))
                : 0;
            return [
              acc[0] < 0 ? 0 : acc[0],
              acc[1] +
                (allocation.locked || allocation.id === idToSkip
                  ? 0
                  : Number(allocation.allocation.toFixed(2))),
              acc[2] +
                (allocation.locked || allocation.id === idToSkip ? 0 : 1),
            ];
          },
          [100, 0, 0]
        );

      return allocations.map((allocation) => {
        if (!allocation.locked && allocation.id !== idToSkip) {
          return {
            ...allocation,
            allocation: totalUnlocked
              ? (Number(allocation.allocation.toFixed(2)) / totalUnlocked) *
                amountToBalance
              : unlockedEntities
              ? amountToBalance / unlockedEntities
              : 0,
          };
        }
        return allocation;
      });
    },
    []
  );

  const calculateBalancedAmounts = useCallback(
    (
      allocations: Record<string, number>,
      changedCategoryId: string,
      newValue: number
    ) => {
      const currentLockedFields = lockedFields;

      let newAllocations = Object.entries(allocations).map(
        ([id, allocation]) => ({
          id,
          allocation: id === changedCategoryId ? newValue : allocation,
          locked: currentLockedFields[id],
        })
      );

      const balancedAllocations = autobalanceAllocations(
        newAllocations,
        changedCategoryId
      );

      return Object.fromEntries(
        balancedAllocations.map(({ id, allocation }) => [
          id,
          Number(allocation.toFixed(14)),
        ])
      );
    },
    [autobalanceAllocations, lockedFields]
  );

  const handleValueChange = useCallback(
    (categoryId: CategoryId, newValue: number, locked: boolean) => {
      const validatedValue = Math.max(0, newValue);

      const tempUpdatedAllocations = {
        ...allocations,
        [categoryId]: validatedValue,
      };

      // Attempt to rebalance immediately
      const rebalancedAllocations = calculateBalancedAmounts(
        tempUpdatedAllocations,
        categoryId,
        validatedValue
      );

      // Check if the rebalanced total is close enough to 100%
      const rebalancedTotal = Object.values(rebalancedAllocations).reduce(
        (sum, value) => sum + value,
        0
      );

      if (rebalancedTotal > 100 && !isCloseEnough(rebalancedTotal, 100)) {
        setError(
          "This change would result in a total allocation significantly over 100%. Please adjust your input."
        );
        return;
      }

      setError("");

      const isLocked = lockedFields[categoryId];

      if (isLocked) {
        setLockedFields((prevLockedFields) => ({
          ...prevLockedFields,
          [categoryId]: false,
        }));
        locked = false;
      }

      // Optimistically update allocations
      setAllocations(rebalancedAllocations);

      saveAllocation.mutate(
        {
          category_slug: categoryId,
          allocation: rebalancedAllocations[categoryId],
          locked,
        },
        {
          onError: (error, variables, context) => {
            // Rollback to previous allocations on error
            setAllocations((prevAllocations) => ({
              ...prevAllocations,
              [categoryId]: allocations[categoryId],
            }));
            setError("An error occurred while saving. Please try again.");
          },
        }
      );
    },
    [allocations, calculateBalancedAmounts, lockedFields, saveAllocation]
  );

  const toggleLock = useCallback(
    (categoryId: CategoryId) => {
      const newLockedState = !lockedFields[categoryId];

      // Optimistically update locked fields
      setLockedFields((prev) => ({
        ...prev,
        [categoryId]: newLockedState,
      }));

      saveAllocation.mutate(
        {
          category_slug: categoryId,
          allocation: allocations[categoryId],
          locked: newLockedState,
        },
        {
          onError: () => {
            // Rollback on error
            setLockedFields((prev) => ({
              ...prev,
              [categoryId]: !newLockedState,
            }));
            setError(
              "An error occurred while toggling lock. Please try again."
            );
          },
        }
      );
    },
    [allocations, lockedFields, saveAllocation]
  );

  const refetchBudget = useCallback(() => {
    getBudget.refetch();
  }, [getBudget]);

  const isLoading = getBudget.isLoading || saveAllocation.isPending;

  const value = {
    categories: categories.data,
    countPerCategory,
    allocations,
    lockedFields,
    handleValueChange,
    toggleLock,
    refetchBudget,
    error,
    isLoading,
  };

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudgetContext must be used within a BudgetProvider");
  }
  return context;
};

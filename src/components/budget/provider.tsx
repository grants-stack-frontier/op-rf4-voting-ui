"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useBudgetForm } from "@/hooks/useBudgetForm";
import { Category } from "@/data/categories";
import { CategoryId } from "@/types/shared";
import debounce from "lodash.debounce";

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
  totalBudget: number;
  setTotalBudget: (budget: number) => void;
}

const EPSILON = 1e-3;

const isCloseEnough = (value: number, target: number): boolean => {
  return Math.abs(value - target) < EPSILON;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: React.PropsWithChildren) {
  const categories = useCategories();
  const projects = useProjects();
  const roundId = 5;
  const { getBudget, saveAllocation, getBudgetAmount } = useBudgetForm(roundId);
  const [totalBudget, setTotalBudget] = useState(8000000); // Default to 8M OP

  // Fetch total budget amount on mount
  useEffect(() => {
    if (getBudgetAmount.data) {
      setTotalBudget(getBudgetAmount.data);
    }
  }, [getBudgetAmount.data]);

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});
  const [countPerCategory, setCountPerCategory] = useState<
    Record<string, number>
  >({});
  const [error, setError] = useState("");

  const allocationsRef = useRef(allocations);
  const lockedFieldsRef = useRef(lockedFields);

  useEffect(() => {
    allocationsRef.current = allocations;
  }, [allocations]);

  useEffect(() => {
    lockedFieldsRef.current = lockedFields;
  }, [lockedFields]);

  useEffect(() => {
    if (projects.data && categories.data) {
      const counts = projects.data.reduce((acc, project) => {
        const categoryId = project.applicationCategory;
        if (categoryId !== undefined) {
          acc[categoryId] = (acc[categoryId] ?? 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      setCountPerCategory(counts);

      if (getBudget.data) {
        setAllocations((prevAllocations) => {
          const newAllocations: Record<string, number> = {};
          getBudget.data.forEach((allocation) => {
            if (allocation.category_slug !== undefined) {
              newAllocations[allocation.category_slug] = Number(
                allocation.allocation
              );
            }
          });

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

          const lockedFieldsChanged = Object.keys(newLockedFields).some(
            (key) => newLockedFields[key] !== prevLockedFields[key]
          );

          if (lockedFieldsChanged) {
            return newLockedFields;
          } else {
            return prevLockedFields;
          }
        });
      } else {
        const defaultAllocations = categories.data.reduce((acc, category) => {
          acc[category.id] = 33.33;
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
      const currentLockedFields = lockedFieldsRef.current;

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
    [autobalanceAllocations]
  );

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

      setAllocations((prevAllocations) => {
        const tempUpdatedAllocations = {
          ...prevAllocations,
          [categoryId]: validatedValue,
        };

        const rebalancedAllocations = calculateBalancedAmounts(
          tempUpdatedAllocations,
          categoryId,
          validatedValue
        );

        const rebalancedTotal = Object.values(rebalancedAllocations).reduce(
          (sum, value) => sum + value,
          0
        );

        if (rebalancedTotal > 100 && !isCloseEnough(rebalancedTotal, 100)) {
          setError(
            "This change would result in a total allocation significantly over 100%. Please adjust your input."
          );
          return prevAllocations;
        }

        setError("");

        const isLocked = lockedFieldsRef.current[categoryId];

        if (isLocked) {
          setLockedFields((prevLockedFields) => ({
            ...prevLockedFields,
            [categoryId]: false,
          }));
          locked = false;
        }

        allocationsRef.current = rebalancedAllocations;

        debouncedSaveAllocation({
          categoryId,
          allocation: rebalancedAllocations[categoryId],
          locked,
        });

        return rebalancedAllocations;
      });
    },
    [calculateBalancedAmounts, debouncedSaveAllocation]
  );

  const toggleLock = useCallback(
    (categoryId: CategoryId) => {
      const newLockedState = !lockedFields[categoryId];

      setLockedFields((prev) => ({
        ...prev,
        [categoryId]: newLockedState,
      }));

      debouncedSaveAllocation({
        categoryId,
        allocation: allocationsRef.current[categoryId],
        locked: newLockedState,
      });
    },
    [debouncedSaveAllocation, lockedFields]
  );

  const refetchBudget = useCallback(() => {
    getBudget.refetch();
  }, [getBudget]);

  const isLoading =
    getBudget.isLoading ||
    getBudget.isFetching ||
    categories.isLoading ||
    categories.isFetching ||
    projects.isLoading ||
    projects.isFetching ||
    getBudgetAmount.isLoading ||
    getBudgetAmount.isFetching ||
    saveAllocation.isPending;

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
    totalBudget,
    setTotalBudget,
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

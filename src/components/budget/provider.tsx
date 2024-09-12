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
import { Round5Allocation, CategoryId } from "@/types/shared";
import debounce from "lodash.debounce";
import Decimal from "decimal.js";

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
  toggleLock: (categoryId: CategoryId) => void;
  isSubmitting: boolean;
  refetchBudget: () => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: React.PropsWithChildren) {
  const categories = useCategories();
  const projects = useProjects();
  const roundId = 5;
  const { getBudget, saveAllocation, lockedFields, toggleLock } =
    useBudgetForm(roundId);

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countPerCategory, setCountPerCategory] = useState<
    Record<string, number>
  >({});

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
    }
  }, [projects.data, categories.data]);

  useEffect(() => {
    if (getBudget.data) {
      setAllocations(
        getBudget.data.reduce((acc, allocation) => {
          acc[allocation.category_slug] = Number(allocation.allocation);
          return acc;
        }, {} as Record<string, number>)
      );
    } else if (categories.data) {
      setAllocations(
        categories.data.reduce((acc, category) => {
          acc[category.id] = 100 / categories.data.length;
          return acc;
        }, {} as Record<string, number>)
      );
    }
  }, [getBudget.data, categories.data]);

  const calculateBalancedAmounts = useCallback(
    (
      state: Record<string, number>,
      changedCategoryId: string,
      newValue: number
    ) => {
      const allocations = Object.entries(state).map(([id, allocation]) => ({
        id,
        allocation: new Decimal(allocation),
        locked: lockedFields[id],
      }));
      console.log("allocations", allocations);

      const [amountToBalance, totalUnlocked, unlockedEntities] =
        allocations.reduce(
          (acc, allocation) => {
            acc[0] -=
              allocation.locked || allocation.id === changedCategoryId
                ? Number(
                    allocation.id === changedCategoryId
                      ? new Decimal(newValue).toFixed(2)
                      : allocation.allocation.toFixed(2)
                  )
                : 0;
            return [
              acc[0] < 0 ? 0 : acc[0],
              acc[1] +
                (allocation.locked || allocation.id === changedCategoryId
                  ? 0
                  : Number(allocation.allocation.toFixed(2))),
              acc[2] +
                (allocation.locked || allocation.id === changedCategoryId
                  ? 0
                  : 1),
            ];
          },
          [100, 0, 0]
        );

      const result = allocations.map((allocation) => {
        if (!allocation.locked && allocation.id !== changedCategoryId) {
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
        return allocation.id === changedCategoryId
          ? { ...allocation, allocation: newValue }
          : allocation;
      });

      return Object.fromEntries(
        result.map(({ id, allocation }) => [id, Number(allocation.toFixed(3))])
      );
    },
    [lockedFields]
  );

  const saveAllocationRef = useRef(
    debounce((allocation: Round5Allocation) => {
      saveAllocation.mutate(allocation);
    }, 300)
  );

  const handleValueChange = useCallback(
    (categoryId: CategoryId, newValue: number, locked: boolean) => {
      setAllocations((prevAllocations) => {
        const updatedAllocations = calculateBalancedAmounts(
          prevAllocations,
          categoryId,
          newValue
        );

        saveAllocationRef.current({
          category_slug: categoryId,
          allocation: updatedAllocations[categoryId],
          locked,
        });

        return updatedAllocations;
      });
    },
    [calculateBalancedAmounts]
  );

  const refetchBudget = () => {
    getBudget.refetch();
  };

  const value = {
    categories: categories.data,
    countPerCategory,
    allocations,
    lockedFields,
    handleValueChange,
    toggleLock,
    isSubmitting,
    refetchBudget,
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

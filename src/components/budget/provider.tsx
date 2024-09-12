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

interface BudgetContextType {
  categories: Category[] | undefined;
  countPerCategory: Record<string, number>;
  allocations: Record<string, number>;
  lockedFields: Record<string, boolean>;
  handleValueChange: (categoryId: CategoryId, newValue: number) => void;
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
        allocation,
        locked: lockedFields[id],
      }));

      const [amountToBalance, totalUnlocked, unlockedEntities] =
        allocations.reduce(
          (acc, allocation) => {
            if (allocation.id === changedCategoryId) {
              acc[0] -= newValue;
            } else if (allocation.locked) {
              acc[0] -= allocation.allocation;
            } else {
              acc[1] += allocation.allocation;
              acc[2]++;
            }
            return acc;
          },
          [100, 0, 0]
        );

      return Object.fromEntries(
        allocations.map((allocation) => {
          if (allocation.id === changedCategoryId) {
            return [allocation.id, newValue];
          } else if (!allocation.locked) {
            const newAllocation = totalUnlocked
              ? (allocation.allocation / totalUnlocked) * amountToBalance
              : unlockedEntities
              ? amountToBalance / unlockedEntities
              : 0;
            return [allocation.id, Number(newAllocation.toFixed(2))];
          }
          return [allocation.id, allocation.allocation];
        })
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
    (categoryId: CategoryId, newValue: number) => {
      setAllocations((prevAllocations) => {
        const updatedAllocations = calculateBalancedAmounts(
          prevAllocations,
          categoryId,
          newValue
        );

        saveAllocationRef.current({
          category_slug: categoryId,
          allocation: updatedAllocations[categoryId],
          locked: lockedFields[categoryId],
        });

        return updatedAllocations;
      });
    },
    [calculateBalancedAmounts, lockedFields]
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

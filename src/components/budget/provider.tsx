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
      // Calculate count per category
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
  
      // Set allocations
      if (getBudget.data) {
        setAllocations(
          getBudget.data.reduce((acc, allocation) => {
            if (allocation.category_slug !== undefined) {
              acc[allocation.category_slug] = Number(allocation.allocation);
            }
            return acc;
          }, {} as Record<string, number>)
        );
      } else {
        setAllocations(
          categories.data.reduce((acc, category) => {
            acc[category.id] = 100 / categories.data.length;
            return acc;
          }, {} as Record<string, number>)
        );
      }
    }
  }, [projects.data, categories.data, getBudget.data]);
  
  const autobalanceAllocations = (
    allocations: Array<{ id: string; allocation: number; locked: boolean }>,
    idToSkip: string
  ) => {
    const [amountToBalance, totalUnlocked, unlockedEntities] = allocations.reduce(
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
          acc[2] + (allocation.locked || allocation.id === idToSkip ? 0 : 1),
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
  };
  
  const roundToPrecision = (value: number, precision: number = 14): number => {
    return Number(new Decimal(value).toFixed(precision));
  };
  
  const calculateBalancedAmounts = useCallback(
    (
      allocations: Record<string, number>,
      changedCategoryId: string,
      newValue: number
    ) => {
      let newAllocations = Object.entries(allocations).map(([id, allocation]) => ({
        id,
        allocation: id === changedCategoryId ? newValue : allocation,
        locked: lockedFields[id],
      }));
  
      const balancedAllocations = autobalanceAllocations(newAllocations, changedCategoryId);
      
      return Object.fromEntries(
        balancedAllocations.map(({ id, allocation }) => [id, roundToPrecision(allocation)])
      );
    },
    [lockedFields]
  );

  const saveAllocationRef = useRef(
    debounce((allocations: Record<string, number>, categoryId: CategoryId, locked: boolean) => {
      const updatedAllocations = calculateBalancedAmounts(
        allocations,
        categoryId,
        allocations[categoryId]
      );
      
      setAllocations(updatedAllocations);
      
      saveAllocation.mutate({
        category_slug: categoryId,
        allocation: updatedAllocations[categoryId],
        locked,
      });
    }, 300)
  );

  const handleValueChange = useCallback(
    (categoryId: CategoryId, newValue: number, locked: boolean) => {
      setAllocations((prevAllocations) => {
        const updatedAllocations = {
          ...prevAllocations,
          [categoryId]: newValue
        };
        
        saveAllocationRef.current(updatedAllocations, categoryId, locked);

        return updatedAllocations;
      });
    },
    []
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

"use client";
import React, { createContext, useContext } from "react";
import { Category } from "@/data/categories";
import { CategoryId } from "@/types/shared";
import { useBudgetForm } from "@/hooks/useBudgetForm";

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

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: React.PropsWithChildren) {
  const {
    categories,
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
  } = useBudgetForm();

  const value = {
    categories,
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

"use client";
import { BallotTabs } from "@/components/ballot/ballot-tabs";
import { PageView } from "@/components/common/page-view";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetForm } from "@/components/budget/budget-form";
import { useBudgetForm } from "@/hooks/useBudgetForm";
import { Round5Allocation } from "@/types/shared";

export default function BudgetBallotPage() {
  const categories = useCategories();
  const projects = useProjects();
  const roundId = 5;

  const { getBudget, saveAllocation, submitBudget, lockedFields, toggleLock } =
    useBudgetForm(roundId);

  const countPerCategory = projects.data?.reduce((acc, project) => {
    const category = categories.data?.find(
      (cat) => cat.id === project.category
    );
    if (!category) return acc;
    return { ...acc, [category.id]: (acc[category.id] ?? 0) + 1 };
  }, {} as Record<string, number>);

  return (
    <section className='flex-1 space-y-6'>
      <BallotTabs />
      <p>
        Decide how much of the overall budget (10M OP) should go to each
        category.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between pb-6'>
            Your Budget
            <Button
              className='outline-none hover:bg-transparent'
              variant='ghost'
              size='icon'
              onClick={() => getBudget.refetch()}
            >
              <RotateCw className='h-4 w-4' />
            </Button>
          </CardTitle>
        </CardHeader>
        <BudgetForm
          categories={categories.data}
          countPerCategory={countPerCategory}
          saveAllocation={(allocation: Round5Allocation) => {
            console.log('allocation', allocation)
            
            
              return saveAllocation.mutateAsync({
                ...allocation,
                locked: false,
              }) as Promise<Round5Allocation[]>
          }
          }
          submitBudget={submitBudget.mutateAsync}
          initialAllocations={getBudget.data as Round5Allocation[] | undefined}
          lockedFields={lockedFields}
          toggleLock={toggleLock}
        />
      </Card>
      <PageView title={"budget-ballot"} />
    </section>
  );
}
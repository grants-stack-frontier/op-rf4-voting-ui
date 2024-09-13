"use client";
import { BallotTabs } from "@/components/ballot/ballot-tabs";
import { PageView } from "@/components/common/page-view";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetForm } from "@/components/budget/budget-form";
import { BudgetProvider, useBudgetContext } from "@/components/budget/provider";

function BudgetContent() {
  const { refetchBudget } = useBudgetContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between pb-6'>
          Your Budget
          <Button
            className='outline-none hover:bg-transparent'
            variant='ghost'
            size='icon'
            onClick={refetchBudget}
          >
            <RotateCw className='h-4 w-4' />
          </Button>
        </CardTitle>
      </CardHeader>
      <BudgetForm />
    </Card>
  );
}

export default function BudgetBallotPage() {
  return (
    <BudgetProvider>
      <section className='flex-1 space-y-6'>
        <BallotTabs />
        <p>
          Decide how much of the overall budget (10M OP) should go to each
          category.
        </p>
        <BudgetContent />
        <PageView title={"budget-ballot"} />
      </section>
    </BudgetProvider>
  );
}

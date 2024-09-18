"use client";
import { BallotTabs } from "@/components/ballot/ballot-tabs";
import { PageView } from "@/components/common/page-view";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetForm } from "@/components/budget/budget-form";
import { BudgetProvider } from "@/components/budget/provider";
import { InfoBox } from "@/components/budget/info-box";
import { Separator } from "@/components/ui/separator";

const foundationGrants = [
  {
    title: "Foundation Grant A",
    description: "a project focusing on improving scalability",
    bounty: 20000,
    durationMonths: 2,
  },
  {
    title: "Foundation Grant B",
    description: "a project focusing on enhancing security",
    bounty: 20000,
    durationMonths: 2,
  },
];

export default function BudgetBallotPage() {
  return (
    <BudgetProvider>
      <div className='flex flex-row'>
        <section className='flex-grow max-w-[740px] space-y-6'>
          <BallotTabs />
          <p className='text-gray-600'>
            Decide on the budget for this round, and then decide how much should
            go to each category. You can return to this step at any time before
            you submit your ballot.
          </p>
          <Card className='p-4'>
            <CardHeader>
              <CardTitle className='mb-4'>Your budget</CardTitle>
              <Separator />
            </CardHeader>
            <BudgetForm />
          </Card>
          <PageView title={"budget-ballot"} />
        </section>
        <aside className='w-96 ml-4 sticky top-4 h-[60vh]'>
          <InfoBox
            totalBudget={8000000}
            roundNumber={5}
            previousRoundProjects={100}
            previousRoundBudget={6500000}
            currentProjects={65}
            foundationGrants={foundationGrants}
            totalFoundationProjects={10}
            totalFoundationBudget={1000000}
            groupCallDate='September 20 at 10 AM UTC'
          />
        </aside>
      </div>
    </BudgetProvider>
  );
}

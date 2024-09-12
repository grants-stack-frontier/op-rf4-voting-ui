import React from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryItem } from "./category-item";
import { useBudgetContext } from "./provider";
import { useRouter } from "next/navigation";

export function BudgetForm() {
  const { categories, isSubmitting } = useBudgetContext();
  const router = useRouter();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/ballot");
  };

  return (
    <form onSubmit={handleContinue}>
      <CardContent>
        {categories?.map((category) => (
          <CategoryItem key={category.id} category={category} />
        ))}
      </CardContent>
      <CardFooter className='gap-2'>
        <Button variant='secondary' type='submit' disabled={isSubmitting}>
          Continue
        </Button>
      </CardFooter>
    </form>
  );
}

import React from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CategoryItem } from "./category-item";
import { useBudgetContext } from "./provider";
import { useRouter } from "next/navigation";

export function BudgetForm() {
  const { categories, error } = useBudgetContext();
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
        <Separator />
      </CardContent>
      <CardFooter className='flex flex-col gap-2 items-start'>
        {error && (
          <div className='text-sm text-red-500 mb-2 text-left'>{error}</div>
        )}
        <Button variant='destructive' type='submit'>
          Continue
        </Button>
      </CardFooter>
    </form>
  );
}

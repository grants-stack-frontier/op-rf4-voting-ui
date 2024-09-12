import { useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryItem } from "./category-item";
import { Category } from "@/data/categories";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { Round5Allocation, CategoryId } from "@/types/shared";

const BudgetSchema = z
  .object({
    categories: z.record(
      z
        .number()
        .min(0, "Budget must be at least 0")
        .max(100, "Budget cannot exceed 100%")
    ),
  })
  .refine(
    (data) => {
      const total = Object.values(data.categories).reduce(
        (sum, val) => sum + val,
        0
      );
      return Math.abs(total - 100) < 0.01;
    },
    {
      message: "The total allocation must add up to 100%",
      path: ["categories"],
    }
  );

interface FormData {
  categories: Record<string, number>;
}

interface BudgetFormProps {
  categories?: Category[];
  countPerCategory?: Record<string, number>;
  saveAllocation: (allocation: Round5Allocation) => Promise<Round5Allocation[]>;
  submitBudget: (allocations: Round5Allocation[]) => Promise<unknown>;
  initialAllocations?: Round5Allocation[];
  lockedFields: Record<string, boolean>;
  toggleLock: (categoryId: CategoryId) => void;
}

export function BudgetForm({
  categories,
  countPerCategory,
  saveAllocation,
  submitBudget,
  initialAllocations,
  lockedFields,
  toggleLock,
}: BudgetFormProps) {
    const router = useRouter();
    const previousValues = useRef<Record<string, number>>({});
    const initialSetupDone = useRef(false);
    const {
      control,
      formState: { errors, isValid },
      setValue,
      getValues,
      reset,
      trigger,
    } = useForm<FormData>({
      resolver: zodResolver(BudgetSchema),
      defaultValues: {
        categories:
          initialAllocations?.reduce((acc, allocation) => {
            acc[allocation.category_slug] = parseFloat((Number(allocation.allocation) || 0).toFixed(2));
            return acc;
          }, {} as Record<string, number>) ||
          categories?.reduce((acc, category, index) => {
            acc[category.id] = index === 0 ? 33.34 : 33.33;
            return acc;
          }, {} as Record<string, number>) ||
          {},
      },
      mode: "onChange",
    });
  
    useEffect(() => {
      if (!initialSetupDone.current && !initialAllocations && categories) {
        const initialCategoryValues = categories.reduce((acc, category, index) => {
          acc[category.id] = index === 0 ? 33.34 : 33.33;
          return acc;
        }, {} as Record<string, number>);
  
        reset({ categories: initialCategoryValues });
        previousValues.current = initialCategoryValues;
        
        // Save initial allocations
        Object.entries(initialCategoryValues).forEach(([categoryId, allocation]) => {
          saveAllocation({
            category_slug: categoryId as CategoryId,
            allocation: parseFloat(allocation.toFixed(2)),
            locked: false,
          });
        });
  
        initialSetupDone.current = true;
      }
    }, [categories, initialAllocations, reset, saveAllocation]);

  const debouncedSaveAllocation = debounce(async (allocation: Round5Allocation) => {
    try {
      await saveAllocation(allocation);
    } catch (error) {
      console.error("Error saving allocation:", error);
    }
  }, 100);

  const handleValueChange = useCallback(
    async (categoryId: CategoryId, newValue: number) => {
      const currentValues = getValues().categories;
      const otherCategories = Object.keys(currentValues).filter(
        (id) => id !== categoryId && !lockedFields[id]
      ) as CategoryId[];

      if (otherCategories.length === 0) return;

      const totalOthers = otherCategories.reduce(
        (sum, id) => sum + currentValues[id],
        0
      );
      const diff = 100 - newValue - totalOthers;
      const adjustmentPerCategory = diff / otherCategories.length;

      const updatedCategories: Record<string, number> = { [categoryId]: newValue };

      otherCategories.forEach((id) => {
        const updatedValue = parseFloat((currentValues[id] + adjustmentPerCategory).toFixed(2));
        setValue(`categories.${id}`, updatedValue);
        updatedCategories[id] = updatedValue;
      });

      setValue(`categories.${categoryId}`, newValue);

      const isValid = await trigger();
      if (isValid) {
        Object.entries(updatedCategories).forEach(([id, value]) => {
          if (value !== previousValues.current[id]) {
            debouncedSaveAllocation({
              category_slug: id as CategoryId,
              allocation: parseFloat(value.toFixed(2)),
              locked: lockedFields[id],
            });
          }
        });
        previousValues.current = { ...previousValues.current, ...updatedCategories };
      }
    },
    [getValues, lockedFields, setValue, trigger, debouncedSaveAllocation]
  );

  const onContinue = async () => {
    if (isValid) {
      const currentValues = getValues().categories;
      const allocations: Round5Allocation[] = Object.entries(currentValues).map(([id, value]) => ({
        category_slug: id as CategoryId,
        allocation: parseFloat(value.toFixed(2)),
        locked: lockedFields[id],
      }));
      await submitBudget(allocations);
      router.push("/ballot");
    }
  };

  return (
    <form>
      <CardContent>
        {categories?.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            control={control}
            errors={errors.categories ?? {}}
            getValues={getValues}
            handleValueChange={handleValueChange}
            toggleLock={() => toggleLock(category.id as CategoryId)}
            isLocked={lockedFields[category.id]}
            projectCount={countPerCategory?.[category.id] || 0}
          />
        ))}
        {errors.categories && typeof errors.categories.message === "string" && (
          <p className='text-red-500'>{errors.categories.message}</p>
        )}
      </CardContent>
      <CardFooter className='gap-2'>
        <Button variant='secondary' type='button' onClick={onContinue}>
          Continue
        </Button>
      </CardFooter>
    </form>
  );
}
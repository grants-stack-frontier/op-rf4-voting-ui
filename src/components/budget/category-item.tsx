import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Lock, LockOpenIcon, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Category } from "@/data/categories";
import { CategoryId } from "@/hooks/useBallot";

interface CategoryItemProps {
  category: Category;
  control: Control<any>;
  errors: FieldErrors;
  getValues: (fieldName: string) => number;
  handleValueChange: (
    categoryId: CategoryId,
    newValue: number
  ) => Promise<void>;
  toggleLock: (categoryId: string) => void;
  isLocked: boolean;
  projectCount: number;
}

export function CategoryItem({
  category,
  control,
  errors,
  getValues,
  handleValueChange,
  isLocked,
  toggleLock,
  projectCount,
}: CategoryItemProps) {
  return (
    <div key={category.id}>
      <Separator />
      <div className='flex items-center gap-4 py-4'>
        <Image
          src={category.image}
          alt={category.name}
          width={80}
          height={80}
        />
        <div className='flex-1'>
          <Button variant='link' asChild>
            <Link
              href={`/category/${category.id}`}
              className='flex items-center gap-2'
            >
              <span className='font-medium'>{category.name}</span>
              <ChevronRight className='h-4 w-4' />
            </Link>
          </Button>
          <p>{category.description}</p>
          <Badge variant='secondary' className='cursor-pointer font-medium'>
            {projectCount} project(s) in this category
          </Badge>
        </div>
        <div className='flex flex-col items-center'>
          <div className='flex rounded-lg bg-transparent border w-full'>
            <Button
              size='icon'
              type='button'
              variant='ghost'
              className='w-20 outline-none hover:bg-transparent'
              onClick={() =>
                handleValueChange(
                  category.id,
                  Math.max(0, getValues(`categories.${category.id}`) - 1)
                )
              }
            >
              <Minus className='h-4 w-4' />
            </Button>
            <Controller
              name={`categories.${category.id}`}
              control={control}
              render={({ field }) => (
                <Input
                  type='text'
                  value={`${field.value?.toFixed(2)}%`}
                  onChange={(e) => {
                    const inputValue = e.target.value.replace("%", "");
                    const parsedValue = parseFloat(inputValue);
                    if (!isNaN(parsedValue)) {
                      handleValueChange(category.id, parsedValue);
                    }
                  }}
                  onBlur={field.onBlur}
                  className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center'
                />
              )}
            />
            <Button
              size='icon'
              type='button'
              variant='ghost'
              className='w-20 outline-none hover:bg-transparent'
              onClick={() =>
                handleValueChange(
                  category.id,
                  Math.min(100, getValues(`categories.${category.id}`) + 1)
                )
              }
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
          <div className='text-sm text-muted-foreground text-center'>
            {Math.round(
              (getValues(`categories.${category.id}`) / 100) * 10000000
            )}{" "}
            OP
          </div>
        </div>
        <Button
          size='icon'
          variant='ghost'
          className='outline-none hover:bg-transparent'
          onClick={() => toggleLock(category.id)}
        >
          {isLocked ? (
            <Lock className='h-4 w-4 text-primary' />
          ) : (
            <LockOpenIcon className='h-4 w-4 text-muted-foreground' />
          )}
        </Button>
      </div>
      {errors[category.id] &&
        typeof errors[category.id]?.message === "string" && (
          <p className='text-red-500'>{String(errors[category.id]?.message)}</p>
        )}
      <Separator />
    </div>
  );
}

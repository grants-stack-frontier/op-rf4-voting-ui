import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Lock, LockOpenIcon, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/data/categories";
import { useBudgetContext } from "./provider";

interface CategoryItemProps {
  category: Category;
}

export function CategoryItem({ category }: CategoryItemProps) {
  const {
    allocations,
    handleValueChange,
    toggleLock,
    lockedFields,
    countPerCategory,
  } = useBudgetContext();

  const [inputValue, setInputValue] = useState("");

  const allocation = allocations[category.id] || 0;
  const isLocked = lockedFields[category.id] || false;
  const projectCount = countPerCategory[category.id] || 0;

  const formatAllocation = (value: number) => {
    return value.toFixed(3).replace(/\.?0+$/, "");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace("%", "");
    setInputValue(value);
  };

  const handleInputBlur = () => {
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue)) {
      handleValueChange(category.id, parsedValue, isLocked);
    }
    setInputValue("");
  };

  const handleIncrement = () => {
    handleValueChange(category.id, allocation + 1, isLocked);
  };

  const handleDecrement = () => {
    handleValueChange(category.id, allocation - 1, isLocked);
  };

  const handleToggleLock = () => {
    toggleLock(category.id);
    handleValueChange(category.id, allocation, !isLocked);
  };

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
              onClick={handleDecrement}
            >
              <Minus className='h-4 w-4' />
            </Button>
            <Input
              type='text'
              value={inputValue || `${formatAllocation(allocation)}%`}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center'
            />
            <Button
              size='icon'
              type='button'
              variant='ghost'
              className='w-20 outline-none hover:bg-transparent'
              onClick={handleIncrement}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
          <div className='text-sm text-muted-foreground text-center'>
            {Math.round((allocation / 100) * 10000000)} OP
          </div>
        </div>
        <Button
          type='button'
          size='icon'
          variant='ghost'
          className='outline-none hover:bg-transparent'
          onClick={handleToggleLock}
        >
          {isLocked ? (
            <Lock className='h-4 w-4 text-primary' />
          ) : (
            <LockOpenIcon className='h-4 w-4 text-muted-foreground' />
          )}
        </Button>
      </div>
      <Separator />
    </div>
  );
}

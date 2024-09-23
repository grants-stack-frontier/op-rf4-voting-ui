import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Category } from "@/data/categories";
import {
  RiAddLine,
  RiArrowRightSLine,
  RiLockFill,
  RiLockUnlockFill,
  RiSubtractLine,
} from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useBudgetContext } from "./provider";
import { categoryMap } from "@/hooks/useProjects";

interface CategoryItemProps {
  category: Category;
}

export function CategoryItem({ category }: CategoryItemProps) {
  const {
    allocations,
    handleValueChange,
    toggleLock,
    lockedFields,
    allProjectsByCategory,
    isLoading,
    totalBudget,
  } = useBudgetContext();

  const [inputValue, setInputValue] = useState("");

  const allocation = allocations[category.id] || 0;
  const isLocked = lockedFields[category.id] || false;
  const projectCount =
    (allProjectsByCategory &&
      allProjectsByCategory[categoryMap[category.id]].length) ||
    0;

  const formatAllocation = (value: number) =>
    value.toFixed(2).replace(/\.?0+$/, "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.replace("%", ""));
  };

  const handleInputBlur = () => {
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue)) {
      handleValueChange(category.id, Math.max(0, parsedValue), isLocked);
    }
    setInputValue("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInputBlur();
    }
  };

  const handleIncrement = () =>
    handleValueChange(category.id, allocation + 1, isLocked);

  const handleDecrement = () => {
    if (allocation > 0) {
      handleValueChange(category.id, allocation - 1, isLocked);
    }
  };
  const handleToggleLock = () => toggleLock(category.id);

  return (
    <div key={category.id}>
      <div className='flex items-start gap-3 py-6'>
        <Image
          src={category.image}
          alt={category.name}
          width={64}
          height={64}
          style={{ height: "64px" }}
        />
        <div className='flex-1'>
          <Button variant='link' asChild>
            <Link
              href={`/category/${category.id}`}
              className='flex items-center gap-2'
            >
              <span className='font-medium'>{category.name}</span>
              <RiArrowRightSLine className='h-4 w-4' />
            </Link>
          </Button>
          <p className='text-[14px] font-small mb-2'>{category.description}</p>
          <Badge variant='secondary' className='cursor-pointer font-medium'>
            {projectCount} project{projectCount !== 1 ? "s" : ""}
          </Badge>
        </div>
        <div className='grid grid-cols-[auto_1fr] gap-2 items-center'>
          <Button
            type='button'
            size='icon'
            variant='ghost'
            className={`outline-none ${
              isLocked
                ? "bg-secondary hover:bg-secondary"
                : "hover:bg-transparent"
            }`}
            onClick={handleToggleLock}
            disabled={isLoading}
          >
            {isLocked ? (
              <RiLockFill className='h-4 w-4' />
            ) : (
              <RiLockUnlockFill className='h-4 w-4' />
            )}
          </Button>
          <div className='flex rounded-lg bg-transparent border'>
            <Button
              size='icon'
              type='button'
              variant='ghost'
              className='w-12 outline-none hover:bg-transparent'
              onClick={handleDecrement}
              disabled={allocation === 0 || isLoading}
            >
              <RiSubtractLine className='h-4 w-4' />
            </Button>
            <Input
              type='text'
              value={inputValue || `${formatAllocation(allocation)}%`}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className='w-16 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center p-0'
              disabled={isLoading}
            />
            <Button
              size='icon'
              type='button'
              variant='ghost'
              className='w-12 outline-none hover:bg-transparent'
              onClick={handleIncrement}
              disabled={allocation === 100 || isLoading}
            >
              <RiAddLine className='h-4 w-4' />
            </Button>
          </div>
          <div className='col-start-2 text-sm text-muted-foreground text-center'>
            {Math.round((allocation / 100) * totalBudget).toLocaleString()} OP
          </div>
        </div>
      </div>
      <Separator />
    </div>
  );
}

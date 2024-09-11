"use client";
import { BallotTabs } from "@/components/ballot/ballot-tabs";
import { PageView } from "@/components/common/page-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, LockKeyholeOpen, Minus, Plus, RotateCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Controller, useForm } from 'react-hook-form';
import { z } from "zod";

const BudgetSchema = z.object({
    categories: z.record(
        z.number().min(0, "Budget must be at least 0").max(100, "Budget cannot exceed 100%")
    )
}).refine((data) => {
    const total = Object.values(data.categories).reduce((sum, val) => sum + val, 0);
    return total === 100;
}, {
    message: "The total budget allocation must add up to 100%",
    path: ["budget"]
});

interface FormData {
    categories: Record<string, number>;
    budget?: undefined// Categories with percentage values as numbers
}

export default function BudgetBallotPage() {

    const categories = useCategories();
    const projects = useProjects();
    // Initialize the form with Zod validation using the resolver
    const {register, handleSubmit, control, formState: {errors}, setValue, getValues, reset} = useForm<FormData>({
        resolver: zodResolver(BudgetSchema),
        defaultValues: {
            categories: {} // Initially empty, we'll populate this once categories data is loaded
        }
    });

    useEffect(() => {
        if (categories.data) {
            const totalInitialBudget = 100;
            let totalAssigned = 0;

            // Calculate the initial values, except for the last category
            const initialCategoryValues = categories.data.reduce((acc, category, index) => {
                if (index === categories.data.length - 1) return acc; // Skip the last one for now
                const value = Math.floor(totalInitialBudget / categories.data.length);
                totalAssigned += value;
                acc[category.id] = value;
                return acc;
            }, {} as Record<string, number>);

            // Assign the remaining budget to the last category to ensure the sum is exactly 100
            const lastCategory = categories.data[categories.data.length - 1];
            initialCategoryValues[lastCategory.id] = totalInitialBudget - totalAssigned;

            // Reset form with calculated default values
            reset({
                categories: initialCategoryValues
            });
        }
    }, [categories.data, reset]);

    // TODO: fix iffy typings
    // @ts-ignore
    const countPerCategory = projects.data?.data?.data?.reduce((acc, project) => {
        const category = categories.data?.find(cat => cat.id === project.category);
        if (!category) return acc;
        return {...acc, [category.id]: (acc[category.id] ?? 0) + 1};
    }, {} as Record<string, number>);

    const onSubmit = (data: FormData) => {

        const totalPercentage = Object.values(data.categories).reduce((acc, percentage) => acc + percentage, 0);

        if (totalPercentage !== 100) {
            alert('The total allocation must equal 100%');
        } else {
            // Process the submitted budget allocations
            console.log('Valid Budget:', data);
        }
    };

    // Utility function to format input value as a percentage
    const formatPercentage = (value: number) => `${value}%`;

    // Utility function to parse percentage input back to a number
    const parsePercentage = (value: string) => {
        const parsed = parseFloat(value.replace('%', '').trim());
        return isNaN(parsed) ? 0 : parsed;
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <section className="flex-1 space-y-6">
                <BallotTabs/>
                <p>Decide how much of the overall budget (10M OP) should go to each category. </p>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between pb-6">
                            Your budget
                            <Button className="outline-none hover:bg-transparent" variant="ghost" size="icon">
                                <RotateCw className="h-4 w-4"/>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categories.data?.map((category, index) => (
                            <div key={category.id}>
                                {index === 0 && (<Separator/>)}
                                <div className="flex items-center gap-4 py-4">
                                    <Image src={category.image} alt={category.name} width={80} height={80}/>
                                    <div className="flex-1">
                                        <Button variant="link" asChild>
                                            <Link href={`/category/${category.id}`}
                                                  className="flex items-center gap-2">
                                                <span className="font-medium">{category.name}</span>
                                                <ChevronRight className="h-4 w-4"/>
                                            </Link>
                                        </Button>
                                        <p>{category.description}</p>
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer font-medium"
                                        >
                                            {countPerCategory ? countPerCategory[category.id] : 0} project(s) in this
                                            category
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex rounded-lg bg-transparent border w-1/2">
                                            <Button size="icon" type="button" variant="ghost"
                                                    className="w-20 outline-none hover:bg-transparent"
                                                    onClick={() => setValue(`categories.${category.id}`, Math.max(0, getValues(`categories.${category.id}`) - 1))}>
                                                <Minus className="h-4 w-4"/>
                                            </Button>
                                            {/* Use Controller from react-hook-form for controlled input */}
                                            <Controller
                                                name={`categories.${category.id}`}
                                                control={control}
                                                render={({field}) => (
                                                    <Input
                                                        type="text"
                                                        value={formatPercentage(field.value)} // Display as percentage
                                                        onChange={(e) => field.onChange(parsePercentage(e.target.value))} // Parse percentage on change
                                                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center"
                                                    />
                                                )}
                                            />
                                            <Button size="icon" type="button" variant="ghost"
                                                    className="w-20 outline-none hover:bg-transparent"
                                                    onClick={() => setValue(`categories.${category.id}`, getValues(`categories.${category.id}`) + 1)}>
                                                <Plus className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                        <div className="text-sm text-muted-foreground text-center">
                                            {/* Example budget value display */}
                                            {Math.round((getValues(`categories.${category.id}`) / 100) * 10000000)} OP
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="outline-none hover:bg-transparent">
                                        <LockKeyholeOpen className="h-4 w-4"/>
                                    </Button>
                                </div>
                                {errors.categories?.[category.id] && (
                                    <p className="text-red-500">
                                        {errors.categories[category.id]?.message}
                                    </p>
                                )}
                                <Separator/>
                            </div>
                        ))}
                        {errors.budget && (
                            <p className="text-red-500">{errors.budget.message}</p>
                        )}
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button className="bg-red-500" variant="default" type="submit">Save</Button>
                        <Button variant="secondary">Continue</Button>
                    </CardFooter>
                </Card>
                <PageView title={'budget-ballot'}/>
            </section>
        </form>
    );
}

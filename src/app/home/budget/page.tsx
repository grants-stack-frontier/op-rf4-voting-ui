"use client";
import {BudgetTabs} from "@/components/budget/budget-tabs";
import {PageView} from "@/components/common/page-view";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {useCategories} from "@/hooks/useCategories";
import {ChevronRight, LockKeyholeOpen, Minus, Plus, RotateCw} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BudgetBallotPage() {
    const categories = useCategories();

    console.log(categories);
    return (
        <>
            <section className="flex-1 space-y-6">
                <BudgetTabs/>
                <p>Decide how much of the overall budget (10M OP) should go to each category. </p>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between pb-6">
                            Your Budget
                            <Button className="outline-none hover:bg-transparent" variant="ghost" size="icon">
                                <RotateCw className="h-4 w-4"/>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categories.data?.map((category) => (
                            <>
                                <Separator/>
                                <div className="flex items-center gap-4 py-4" key={category.id}>
                                    <Image src={category.image} alt={category.name} width={80} height={80}/>
                                    <div className="flex-1">
                                        <Button variant="link" asChild>
                                            <Link href={`/home/category/${category.id}`}
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
                                            {category.projects?.length} project(s)
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex rounded-lg bg-transparent border w-1/2">
                                            <Button size="icon" type="button" variant="ghost"
                                                    className="w-20 outline-none hover:bg-transparent">
                                                <Minus className="h-4 w-4"/>
                                            </Button>
                                            <Input type="text"
                                                   className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center"
                                                   value="33%"/>
                                            <Button size="icon" type="button" variant="ghost"
                                                    className="w-20 outline-none hover:bg-transparent">
                                                <Plus className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                        <div className="text-sm text-muted-foreground text-center">3,300,000 OP</div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="outline-none hover:bg-transparent">
                                        <LockKeyholeOpen className="h-4 w-4"/>
                                    </Button>
                                </div>
                                <Separator/>
                            </>
                        ))}
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button className="bg-red-500" variant="default">Save</Button>
                        <Button variant="secondary">Continue</Button>
                    </CardFooter>
                </Card>
                <PageView title={'budget-ballot'}/>
            </section>
        </>
    );
}

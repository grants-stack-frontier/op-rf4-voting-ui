"use client";
import { MetricStat, MetricStatProps } from "@/components/metrics/metric-stat";
import { Heading } from "@/components/ui/headings";
import { Text } from "@/components/ui/text";
import { Category } from "@/data/categories";
import { cn } from "@/lib/utils";
import { CheckCircle, MessageCircle, User } from "lucide-react";
import { Markdown } from "../markdown";
import { Skeleton } from "../ui/skeleton";

export function CategoryDetails({
	data,
	isPending,
}: {
	data?: Category[];
	isPending: boolean;
}) {
	const { name, description } = data?.[0] ?? {};

	const badgeholderCount = 132;

	const badgeholderStats = [
		{
			label: "Viewed",
			hint: "The number of badgeholders who have viewed this category",
			value: `${0} of ${badgeholderCount}`,
			icon: User,
		},
		{
			label: "Added to ballots",
			hint: "This is the percent of badgeholders who have viewed this category and also added it to their ballot",
			value: `0%`,
			icon: ({ className = "" }) => (
				<CheckCircle className={cn("text-green-500", className)} />
			),
		},
		{
			label: "Comments",
			value: `0`,
			icon: MessageCircle,
		},
	];
	return (
		<section className="space-y-16">
			<div className="space-y-6">
				{isPending ? (
					<>
						<Skeleton className="w-96 h-8" />
						<div className="space-y-2">
							<Skeleton className="w-full h-4" />
							<Skeleton className="w-full h-4" />
							<Skeleton className="w-4/5 h-4" />
						</div>
					</>
				) : (
					<>
						<Heading variant="h2">{name}</Heading>
						<Markdown>{description}</Markdown>
					</>
				)}
			</div>

			<StatsSection label="Badgeholder activity" stats={badgeholderStats} />
		</section>
	);
}

function StatsSection({
	label = "",
	description = "",
	stats = [],
}: {
	label: string;
	description?: string;
	stats: MetricStatProps[];
}) {
	return (
		<div className="">
			<Heading variant="h3" className="mb-1">
				{label}
			</Heading>
			<Text>{description}</Text>
			<div className="mt-6 flex gap-2">
				{stats.map((stat, i) => (
					<MetricStat className="w-1/3" key={i} {...stat} />
				))}
			</div>
		</div>
	);
}

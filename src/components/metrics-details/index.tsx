'use client';
import { ArrowUpRight, CheckCircle, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/headings';
import { MetricStat, MetricStatProps } from '@/components/metrics/metric-stat';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { AddToBallotButton } from '../metrics/add-to-ballot-button';
import { Skeleton } from '../ui/skeleton';
import { Markdown } from '../markdown';
import Link from 'next/link';
import { RetroFundingImpactMetric } from '@/__generated__/api/agora.schemas';

export function MetricDetails({
  data,
  isPending,
}: {
  data?: RetroFundingImpactMetric;
  isPending: boolean;
}) {
  const { metric_id: id, name, description, url = '#' } = data ?? {};

  const badgeholderCount = 132;

  const badgeholderStats = [
    {
      label: 'Viewed',
      hint: 'The number of badgeholders who have viewed this metric',
      value: `${isPending ? '--' : data?.views || 0} of ${badgeholderCount}`,
      icon: User,
    },
    {
      label: 'Added to ballots',
      hint: 'This is the percent of badgeholders who have viewed this metric and also added it to their ballot',
      value: isPending ? '--' : (data?.added_to_ballot || 0) + '%',
      icon: ({ className = '' }) => (
        <CheckCircle className={cn('text-green-500', className)} />
      ),
    },
    {
      label: 'Comments',
      value: isPending ? '--' : String(data?.comments?.length || 0),
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

        <div className="gap-2 items-center flex">
          <AddToBallotButton variant="destructive" id={id} />
          <Link href={url} target="_blank">
            <Button variant="link">
              View calculation <ArrowUpRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>

      <StatsSection label="Badgeholder activity" stats={badgeholderStats} />
    </section>
  );
}

function StatsSection({
  label = '',
  description = '',
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

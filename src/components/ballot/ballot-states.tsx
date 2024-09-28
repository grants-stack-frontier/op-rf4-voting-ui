'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/headings';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  ComponentProps,
  ComponentType,
  PropsWithChildren,
  useMemo,
  useState,
} from 'react';
import { Progress } from '../ui/progress';
import { useBallotRound5Context } from './provider5';
import { useDisconnect } from '@/hooks/useAuth';
import { useVotingCategory } from '@/hooks/useVotingCategory';
import { categoryNames } from '@/data/categories';
import { CategoryId } from '@/types/shared';
import PairwiseLogo from '../../../public/pairwise.svg';
import Image from 'next/image';
import { Separator } from '../ui/separator';

export function EmptyBallot() {
  const { ballot } = useBallotRound5Context();
  const votingCategory = useVotingCategory();

  const quantities = useMemo(() => {
    if (ballot) {
      return {
        total: ballot.total_projects,
        toBeEvaluated: ballot.projects_to_be_evaluated.length,
      };
    }
    return {
      total: 0,
      toBeEvaluated: 0,
    };
  }, [ballot]);
  return (
    <>
      <p>
        Your voting category is{' '}
        <a href={`/category/${votingCategory}`} className="underline">
          {votingCategory
            ? categoryNames[votingCategory as CategoryId]
            : 'Unknown'}
        </a>{' '}
        ({ballot?.total_projects} projects)
      </p>
      <EmptyCard
        icon={LockedSvg}
        title="Score projects to unlock your ballot"
        description=""
      >
        <Progress
          value={
            ((quantities.total - quantities.toBeEvaluated) / quantities.total) *
            100
          }
          className="w-60"
        />
        <Text className="text-center max-w-lg mx-auto">
          You&apos;ve scored {quantities.total - quantities.toBeEvaluated} of{' '}
          {quantities.total} projects
        </Text>
        <div className="flex gap-2">
          <Link href={`/project/${ballot?.projects_to_be_evaluated[0]}`}>
            <Button variant="destructive">Score projects</Button>
          </Link>
          {/* <Button variant="outline" onClick={() => setOpen(true)}>
          Import ballot
        </Button> */}
          {/* <ImportBallotDialog isOpen={isOpen} onOpenChange={setOpen} /> */}
        </div>
      </EmptyCard>
      <PairwiseCard />
    </>
  );
}

export function NonBadgeholder() {
  const { disconnect } = useDisconnect();
  return (
    <div>
      <EmptyCard
        icon={UserSvg}
        title="You’re not a badgeholder"
        description="Feel free to play around, but you won’t be able to comment on metrics or
            submit a ballot."
      >
        <Button variant="destructive" onClick={() => disconnect()}>
          Disconnect wallet
        </Button>
        <Button variant="link">Learn more</Button>
      </EmptyCard>
    </div>
  );
}

function DashedCard({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn('border-none', className)}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23bcbfcd' stroke-width='2' stroke-dasharray='10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
      }}
      {...props}
    />
  );
}

function EmptyCard({
  icon: Icon,
  title,
  description,
  children,
}: PropsWithChildren<{
  icon: ComponentType;
  title: string;
  description: string;
}>) {
  return (
    <Card className="px-6 py-16 flex items-center justify-center flex-col gap-2">
      <Icon />
      <Heading variant="h3" className="mt-4">
        {title}
      </Heading>
      <Text className="text-center max-w-lg mx-auto">{description}</Text>

      {children}
    </Card>
  );
}

function PairwiseCard() {
  return (
    <Card className="px-6 py-4 bg-[#F2F3F8]">
      <Link
        href="https://www.pairwise.vote/retrofunding5"
        target="_blank"
        className="w-full"
        passHref
      >
        <div className="w-full flex items-center justify-between gap-4">
          <Image
            src={PairwiseLogo}
            alt="Pairwise Logo"
            width={112}
            height={28}
          />
          <Separator orientation="vertical" className="h-10" />
          <p className="text-sm text-left dark:text-black">
            Alternatively, you can compare projects with{' '}
            <a
              href="https://www.pairwise.vote/retrofunding5"
              target="_blank"
              className="underline"
            >
              Pairwise
            </a>
            . Return here to complete and submit your ballot.
          </p>
          <Link href="https://www.pairwise.vote/retrofunding5" target="_blank">
            <svg
              className="cursor-pointer"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.3364 7.84518L6.16426 15.0173L4.98575 13.8388L12.1579 6.66667H5.83643V5H15.0031V14.1667H13.3364V7.84518Z"
                fill="#0F111A"
              />
            </svg>
          </Link>
        </div>
      </Link>
    </Card>
  );
}

function UserSvg() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z"
        fill="#F2F3F8"
      />
      <path
        d="M40 42H24V40C24 37.2386 26.2386 35 29 35H35C37.7614 35 40 37.2386 40 40V42ZM32 33C28.6863 33 26 30.3137 26 27C26 23.6863 28.6863 21 32 21C35.3137 21 38 23.6863 38 27C38 30.3137 35.3137 33 32 33Z"
        fill="#636779"
      />
    </svg>
  );
}

function BallotSvg() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z"
        fill="#F2F3F8"
      />
      <path
        d="M40 42H24C23.4477 42 23 41.5523 23 41V23C23 22.4477 23.4477 22 24 22H40C40.5523 22 41 22.4477 41 23V41C41 41.5523 40.5523 42 40 42ZM28 27V29H36V27H28ZM28 31V33H36V31H28ZM28 35V37H33V35H28Z"
        fill="#636779"
      />
    </svg>
  );
}

function LockedSvg() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z"
        fill="#F2F3F8"
      />
      <path
        d="M39 30H40C40.5523 30 41 30.4477 41 31V41C41 41.5523 40.5523 42 40 42H24C23.4477 42 23 41.5523 23 41V31C23 30.4477 23.4477 30 24 30H25V29C25 25.134 28.134 22 32 22C35.866 22 39 25.134 39 29V30ZM37 30V29C37 26.2386 34.7614 24 32 24C29.2386 24 27 26.2386 27 29V30H37ZM31 34V38H33V34H31Z"
        fill="#636779"
      />
    </svg>
  );
}

'use client';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { BallotFilter } from '../ballot/ballot-filter';
import { Card } from '../ui/card';
import {
  DistributionMethod,
  saveDistributionMethodToLocalStorage,
  useDistributionMethod,
  useDistributionMethodFromLocalStorage,
} from '@/hooks/useBallotRound5';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useVotingCategory } from '@/hooks/useVotingCategory';
import { useBallotRound5Context } from '../ballot/provider5';
import { useBudgetContext } from '../budget/provider';
import { ResetButton } from './reset-button';
import Impact from '../../../public/chart-impact.svg';
import TopBottom from '../../../public/chart-top-bottom.svg';
import TopWeighted from '../../../public/chart-top-weighted.svg';
import Custom from '../../../public/chart-custom.svg';
import Image from 'next/image';

export function BlueCircleCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.99992 13.6673C3.31802 13.6673 0.333252 10.6825 0.333252 7.00065C0.333252 3.31875 3.31802 0.333984 6.99992 0.333984C10.6818 0.333984 13.6666 3.31875 13.6666 7.00065C13.6666 10.6825 10.6818 13.6673 6.99992 13.6673ZM6.33499 9.66732L11.0491 4.95327L10.1063 4.01046L6.33499 7.78172L4.44939 5.89605L3.50658 6.83892L6.33499 9.66732Z"
        fill="#3374DB"
      />
    </svg>
  );
}

export function MetricsEditor() {
  const { ballot } = useBallotRound5Context();
  const { mutate: saveDistributionMethod } = useDistributionMethod();
  const { data: distributionMethod, refetch } =
    useDistributionMethodFromLocalStorage();
  const votingCategory = useVotingCategory();
  const { totalBudget } = useBudgetContext();

  const budget = useMemo(() => {
    if (ballot && votingCategory) {
      const portion = ballot.category_allocations?.find(
        (c) => c.category_slug === votingCategory
      )?.allocation;
      return Math.round((totalBudget * (portion || 0)) / 100);
      // return formatNumberWithCommas(totalBudget);
    }
    return totalBudget / 3;
  }, [ballot, votingCategory, totalBudget]);

  const allocationMethods = [
    {
      name: 'Impact groups',
      description:
        'Reward allocation is proportionate and even among projects with the same impact score.',
      method: DistributionMethod.IMPACT_GROUPS,
      image: Impact,
    },
    {
      name: 'Top to bottom',
      description:
        'Reward allocation is directly proportionate to stack rankings.',
      method: DistributionMethod.TOP_TO_BOTTOM,
      image: TopBottom,
    },
    {
      name: 'Top weighted',
      description:
        'Reward allocation is weighted toward projects at the top of your ballot.',
      method: DistributionMethod.TOP_WEIGHTED,
      image: TopWeighted,
    },
    {
      name: 'Custom',
      description: 'Reward allocation is customized by you.',
      method: 'CUSTOM',
      image: Custom,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[20px] text-[#0F111A] font-semibold line-height-[28px] dark:text-white">
          Your ballot
        </h4>
        <BallotFilter />
      </div>

      <div className="flex flex-col gap-4 text-[16px] line-height-[24px] mb-10 text-[#404454] dark:text-[#B0B3B8]">
        <p>First, review your project rankings in the list below.</p>
        <p>
          Then, choose a method to easily allocate rewards across projects. You
          can also customize percentages at any time.
        </p>
        <p>
          OP calculations in this ballot are based on{' '}
          <a href="/budget" className="underline">
            your category budget of {Math.ceil(Number(budget)).toLocaleString()}{' '}
            OP
          </a>
          .
        </p>
      </div>

      <div className="flex flex-row justify-between items-end mb-2">
        <p className="font-semibold">Allocation method</p>
        {!distributionMethod && (
          <div className="flex flex-row items-center gap-1">
            <BlueCircleCheckIcon />
            <p className="font-semibold text-sm">None selected</p>
          </div>
        )}
        {distributionMethod && <ResetButton />}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
        {allocationMethods.map((method, index) => (
          <Card
            key={index}
            className={cn('cursor-pointer p-3', {
              'border-2 border-[#BCBFCD]': distributionMethod === method.method,
            })}
            onClick={() => {
              // setSelectedMethod(method.method);
              saveDistributionMethodToLocalStorage(method.method);
              if (
                method.method === DistributionMethod.IMPACT_GROUPS ||
                method.method === DistributionMethod.TOP_TO_BOTTOM ||
                method.method === DistributionMethod.TOP_WEIGHTED
              ) {
                saveDistributionMethod(method.method);
              }
              refetch();
            }}
          >
            <div
              className="mb-4 w-[220px] h-[130px]"
              style={{
                backgroundImage: `url(${method.image.src})`,
                backgroundSize: '100% 100%', // Stretch horizontally and vertically to fill the container
                backgroundPosition: 'center', // Keep the image centered
              }}
            />

            {/* <Image src={method.image} alt="Impact" width={220} height={130} />
            </div> */}

            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row items-center gap-1">
                {method.method === distributionMethod && (
                  <BlueCircleCheckIcon />
                )}
                <p className="font-bold text-sm">{method.name}</p>
              </div>
              <HoverCard openDelay={0}>
                <HoverCardTrigger>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.00016 13.6673C3.31826 13.6673 0.333496 10.6825 0.333496 7.00065C0.333496 3.31875 3.31826 0.333984 7.00016 0.333984C10.682 0.333984 13.6668 3.31875 13.6668 7.00065C13.6668 10.6825 10.682 13.6673 7.00016 13.6673ZM6.3335 9.00065V10.334H7.66683V9.00065H6.3335ZM7.66683 7.90405C8.63063 7.61718 9.3335 6.72432 9.3335 5.66732C9.3335 4.37865 8.28883 3.33398 7.00016 3.33398C5.86816 3.33398 4.92441 4.14011 4.7117 5.20962L6.01936 5.47116C6.11056 5.0128 6.51503 4.66732 7.00016 4.66732C7.55243 4.66732 8.00016 5.11503 8.00016 5.66732C8.00016 6.21958 7.55243 6.66732 7.00016 6.66732C6.63196 6.66732 6.3335 6.96578 6.3335 7.33398V8.33398H7.66683V7.90405Z"
                      fill="#BCBFCD"
                    />
                  </svg>
                </HoverCardTrigger>
                <HoverCardContent className="border-rounded-md text-xs text-center py-1 px-2 drop-shadow-md">
                  {method.description}
                </HoverCardContent>
              </HoverCard>
            </div>
          </Card>
        ))}
      </div>
      {/* ^^This sections is a work in progress^^ */}
    </div>
  );
}

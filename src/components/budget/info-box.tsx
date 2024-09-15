import React, { useRef } from "react";
import { Info, ChevronDown } from "lucide-react";

interface FoundationGrant {
  title: string;
  description: string;
  bounty: number;
  durationMonths: number;
}

interface InfoBoxProps {
  totalBudget: number;
  roundNumber: number;
  previousRoundProjects: number;
  previousRoundBudget: number;
  currentProjects: number;
  foundationGrants: FoundationGrant[];
  totalFoundationProjects: number;
  totalFoundationBudget: number;
  groupCallDate: string;
}

export function InfoBox({
  totalBudget,
  roundNumber,
  previousRoundProjects,
  previousRoundBudget,
  currentProjects,
  foundationGrants,
  totalFoundationProjects,
  totalFoundationBudget,
  groupCallDate,
}: InfoBoxProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className='relative p-6 bg-white rounded-lg border border-gray-200 h-full flex flex-col'>
      <div className='bg-black rounded-full p-0 inline-flex items-center justify-center mb-4 w-fit'>
        <Info className='w-5 h-5 text-white' />
      </div>
      <div className='flex items-center mb-6'>
        <h2 className='text-lg font-semibold text-gray-900'>
          Helpful information for Round {roundNumber} budgeting
        </h2>
      </div>
      <div
        ref={contentRef}
        className='overflow-y-auto flex-grow text-gray-600 text-sm'
      >
        <div className='space-y-6 pr-1'>
          <p>
            Optimism Foundation initially set the Round {roundNumber} budget to{" "}
            {totalBudget.toLocaleString()} OP. They decided on this budget after
            reviewing the results from Round {roundNumber - 2}—where{" "}
            {previousRoundProjects} OP Stack projects were allocated{" "}
            {previousRoundBudget.toLocaleString()} OP by voters.
          </p>
          <p>
            Estimating that more OP Stack projects would apply in Round{" "}
            {roundNumber}, the Foundation set a higher budget of{" "}
            {totalBudget.toLocaleString()} OP.
          </p>
          <p>
            However, fewer projects have applied than expected. There are{" "}
            {currentProjects} eligible projects, compared to{" "}
            {previousRoundProjects} rewarded projects in Round {roundNumber - 2}
            .
          </p>
          <p className='font-bold text-gray-900'>Additional context</p>
          <p>
            To help you determine a Round {roundNumber} budget, it’s useful to
            understand how other OP Stack projects are valued. We can look at
            two existing Optimism Foundation Grants for example.
          </p>
          {foundationGrants.map((grant, index) => (
            <p key={index}>
              {grant.title} is {grant.description}. The bounty on this work is
              set to {grant.bounty.toLocaleString()} OP and expected to take
              approximately {grant.durationMonths} months.
            </p>
          ))}
          <p>
            In total, over the last year, the Foundation has requested{" "}
            {totalFoundationProjects} projects for a total of{" "}
            {totalFoundationBudget.toLocaleString()} OP.
          </p>
          <p>
            Responsible allocation of OP enables the Collective to fund more
            builders, and to sustainably pursue Retro Funding into the future.
            Any unallocated OP will be used to reward impact in future rounds.
          </p>
          <p>
            The Foundation will hold a group call on {groupCallDate} to discuss
            the round budgeting step.
          </p>
        </div>
      </div>
      <button
        onClick={handleScrollToBottom}
        className='flex items-center mt-4 text-blue-600 hover:underline focus:outline-none'
      >
        More <ChevronDown className='w-4 h-4 ml-1' />
      </button>
    </div>
  );
}

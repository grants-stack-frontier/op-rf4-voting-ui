import { useProjects } from '@/hooks/useProjects';
import { RiArrowDownLine, RiErrorWarningFill } from '@remixicon/react';
import { useRef } from 'react';

export function InfoBox() {
  const contentRef = useRef<HTMLDivElement>(null);
  const projects = useProjects();

  const handleScroll = () => {
    if (contentRef.current) {
      const currentScroll = contentRef.current.scrollTop;
      const maxScroll =
        contentRef.current.scrollHeight - contentRef.current.clientHeight;
      const newScrollPosition = Math.min(
        currentScroll + contentRef.current.clientHeight,
        maxScroll
      );

      contentRef.current.scrollTo({
        top: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative p-6 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="p-0 inline-flex items-center justify-center mb-4 w-fit">
        <RiErrorWarningFill className="w-6 h-6" />
      </div>
      <div className="flex items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Helpful information for Round 5 budgeting
        </h2>
      </div>

      <div
        ref={contentRef}
        className="overflow-y-auto flex-grow text-gray-600 dark:text-white text-[12px]"
      >
        <div className="space-y-6 pr-1 pb-12">
          <p>
            The Optimism Foundation initially set the Round 5 budget to 8M OP.
            They decided on this budget after reviewing the results from Round
            3—where 40+ OP Stack projects were allocated 6.5M+ OP by voters.
          </p>
          <p>
            Estimating that the impact within the OP Stack category has
            increased since round 3, the Foundation set a higher budget of 8M
            OP.
          </p>
          <p>
            However, less projects have qualified for the round than expected.
            In total, there are {projects.data?.length} eligible projects across
            all categories.
          </p>
          <p className="font-bold text-gray-900 dark:text-white">
            Additional context
          </p>
          <p>
            To help you determine a Round 5 budget, it&apos;s useful to
            reference existing data on Optimism grant allocations:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Retro Funding 4 allocated 10M OP among 207 Onchain builders for
              driving the adoption of Optimism
            </li>
            <li>
              The Token House has allocated 1M+ OP since Jan 2023 to 20+
              proactive grants for OP Stack contributions
            </li>
            <li>
              The Foundation has made a 250k OP grant to build Zero Knowledge
              proofs for the OP Stack
            </li>
          </ol>
          <p>
            Responsible allocation of OP enables the Collective to support more
            builders, and to sustainably pursue Retro Funding into the future.
            Any unallocated OP will be used to reward impact in future rounds.
          </p>
        </div>
      </div>
      <button
        onClick={handleScroll}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-[2px] rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 focus:outline-none transition-colors duration-200"
        aria-label="Scroll down for more information"
      >
        <span className="text-[12px] leading-[16px] font-medium text-gray-600">
          More
        </span>
        <RiArrowDownLine className="w-3 h-3 text-gray-600" />
      </button>
    </div>
  );
}

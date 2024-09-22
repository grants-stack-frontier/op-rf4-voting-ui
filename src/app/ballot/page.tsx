"use client";
import { EmptyBallot, NonBadgeholder } from "@/components/ballot/ballot-states";
import { Card } from "@/components/ui/card";
import { useAccount } from "wagmi";

import { useBallotRound5Context } from "@/components/ballot/provider5";
import { downloadImage } from "@/components/ballot/submit-dialog";
import { SubmitRound5Dialog } from "@/components/ballot/submit-dialog5";
import { PageView } from "@/components/common/page-view";
import { SearchInput } from "@/components/common/search-input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useVotingTimeLeft } from "@/components/voting-ends-in";
import { votingEndDate } from "@/config";
import { categoryNames } from "@/data/categories";
// import {
//   MAX_MULTIPLIER_VALUE,
//   useOsMultiplier,
// } from "@/hooks/useBallot";
import {
  Round5ProjectAllocation,
  useRound5Ballot,
  useIsSavingRound5Ballot,
  useRound5BallotWeightSum,
  useSaveRound5Allocation,
  useSaveRound5Position,
  useDistributionMethodFromLocalStorage,
  DistributionMethod,
} from "@/hooks/useBallotRound5";
import { useIsBadgeholder } from "@/hooks/useIsBadgeholder";
import { formatDate } from "@/lib/utils";
import { ArrowDownToLineIcon, LoaderIcon, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import VotingSuccess from "../../../public/RetroFunding_Round4_IVoted@2x.png";
import { MetricsEditor } from "../../components/metrics-editor";
import { CategoryId } from "@/types/shared";
import { useProjects, useProjectsByCategory } from "@/hooks/useProjects";
import { useVotingCategory } from "@/hooks/useVotingCategory";
import { NumberInput } from "@/components/ui/number-input";

function formatAllocationOPAmount(amount?: number) {
  if (amount === undefined) return 0;

  const value = amount.toString();
  const pointIndex = value.indexOf(".");
  const exists = pointIndex !== -1;
  const numWithCommas = value
    .slice(0, exists ? pointIndex : value.length)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (exists) {
    const cutoffPoint = 3;
    const decimals = value.slice(pointIndex);
    if (decimals.length <= cutoffPoint) {
      return numWithCommas + decimals;
    }
    const float = parseFloat(decimals).toFixed(cutoffPoint);
    return numWithCommas + float.slice(1);
  }
  return numWithCommas;
}

const impactScores: { [key: number]: string } = {
  0: "Conflict of interest",
  1: "Very low impact",
  2: "Low impact",
  3: "Medium impact",
  4: "High impact",
  5: "Very high impact",
};

const totalAllocationAmount = 3_333_333;

export default function BallotPage() {
  return (
    <>
      <PageView title='Ballot' />
      <CheckBallotState />
    </>
  );
}

function CheckBallotState() {
  const { address, isConnecting } = useAccount();
  const { isPending } = useRound5Ballot(address);
  const { state, ballot } = useBallotRound5Context();
  // Comment out for local dev if needed
  if (isPending) {
    return <Skeleton className='p-6 h-96' />;
  }
  if (!address && !isConnecting) {
    return <NonBadgeholder />;
  }
  const isEmptyBallot = !Object.keys(state).length;
  const needImpactScoring =
    ballot && ballot.projects_to_be_evaluated.length > 0;
  if (isEmptyBallot || needImpactScoring) {
    return <EmptyBallot />;
  }
  return <YourBallot />;
}

type Filter = "conflict" | "no-conflict";

function sortAndPrepProjects(
  newProjects: Round5ProjectAllocation[],
  filter?: Filter
): ProjectAllocationState[] {
  const projects = newProjects
    .sort((a, b) => a.position - b.position)
    .map((p) => ({
      ...p,
      allocationInput: p.allocation?.toString() || "",
    }));
  if (filter === "conflict") {
    return projects.filter((p) => p.impact === 0);
  }
  if (filter === "no-conflict") {
    return projects.filter((p) => p.impact !== 0);
  }
  return projects;
}

const categoryIds: CategoryId[] = [
  "ETHEREUM_CORE_CONTRIBUTIONS",
  "OP_STACK_RESEARCH_AND_DEVELOPMENT",
  "OP_STACK_TOOLING",
];

interface ProjectAllocationState extends Round5ProjectAllocation {
  allocationInput: string;
}

function YourBallot() {
  const [isSubmitting, setSubmitting] = useState(false);

  const { ballot } = useBallotRound5Context();
  const { mutate: saveAllocation } = useSaveRound5Allocation();
  const { mutate: savePosition } = useSaveRound5Position();
  // const { data: projects } = useProjects();
  const votingCategory = useVotingCategory();
  const { data: projects } = useProjectsByCategory(
    votingCategory as CategoryId
  );
  const { data: distributionMethod, update: saveDistributionMethod } =
    useDistributionMethodFromLocalStorage();

  console.log({ ballot });
  console.log({ projects });
  console.log(
    "Diff:",
    projects?.filter(
      (p) =>
        !ballot?.project_allocations.find(
          (p2) =>
            p2.project_id?.toLowerCase() === p.applicationId?.toLowerCase()
        )
    )
  );

  const [projectList, setProjectList] = useState<ProjectAllocationState[]>(
    sortAndPrepProjects(ballot?.project_allocations || [], "no-conflict")
  );
  const [conflicts, setConflicts] = useState<ProjectAllocationState[]>(
    sortAndPrepProjects(ballot?.project_allocations || [], "conflict")
  );

  useEffect(() => {
    console.log("Ballot updated:", ballot?.project_allocations);
    setProjectList(
      sortAndPrepProjects(ballot?.project_allocations || [], "no-conflict")
    );
    setConflicts(
      sortAndPrepProjects(ballot?.project_allocations || [], "conflict")
    );
  }, [ballot]);

  type Filter = "conflict" | "no-conflict";
  function sortAndPrepProjects(
    newProjects: Round5ProjectAllocation[],
    filter?: Filter
  ): ProjectAllocationState[] {
    const projects = newProjects
      .sort((a, b) => a.position - b.position)
      .map((p) => ({
        ...p,
        allocation: p.allocation ?? 0,
        allocationInput: p.allocation?.toString() ?? '',
      })
    )
    if (filter === 'conflict') {
      return projects.filter(p => p.impact === 0);
    }
    if (filter === "no-conflict") {
      return projects.filter((p) => p.impact !== 0);
    }
    return projects;
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<
    ProjectAllocationState[]
  >([]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = projectList.filter((project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [searchTerm, projectList]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const displayProjects = searchTerm ? filteredProjects : projectList;

  return (
    <div className='space-y-4'>
      {ballot?.status === "SUBMITTED" && (
        <Alert variant={"accent"}>
          <div className='flex gap-2 text-sm items-center'>
            <p>
              Your ballot was submitted on {formatDate(ballot?.published_at)}.
              You can make changes and resubmit until{" "}
              {formatDate(votingEndDate)}. To do so, simply edit the ballot
              below and submit again.
            </p>
            <div
              className='flex gap-4 items-center cursor-pointer hover:opacity-80 transition-opacity'
              onClick={() => downloadImage(document.querySelector("#download"))}
            >
              <Image
                id='download'
                {...VotingSuccess}
                alt='Success!'
                className='rounded-xl max-w-[142px]'
              />
              <Button
                icon={ArrowDownToLineIcon}
                size='icon'
                variant={"ghost"}
              />
            </div>
          </div>
        </Alert>
      )}
      {/* TO DO: Change to category based on badgeholder */}
      <p>
        Your voting category is{" "}
        <a href={`/category/${votingCategory}`} className='underline'>
          {votingCategory
            ? categoryNames[votingCategory as CategoryId]
            : "Unknown"}
        </a>{" "}
        ({ballot?.total_projects} projects)
      </p>
      <Card className='p-6 space-y-8'>
        <MetricsEditor />
        <SearchInput
          className='my-2'
          placeholder='Search projects...'
          onChange={handleSearch}
        />

        <div>
          {displayProjects.map((proj, i) => {
            return (
              <div
                key={proj.project_id}
                className={`flex justify-between flex-1 border-b gap-1 py-6 ${
                  i === 0 ? "pt-0" : ""
                }`}
                draggable='true'
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "text/plain",
                    JSON.stringify({ index: i, id: proj.project_id })
                  );
                }}
              >
                <div className='flex items-start justify-between flex-grow'>
                  <div className='flex items-start gap-1'>
                    <div
                      className='size-12 rounded-lg bg-gray-100 bg-cover bg-center flex-shrink-0'
                      style={{
                        backgroundImage: `url(${proj.image})`,
                      }}
                    />
                    <div className='flex flex-col gap-1 ml-4'>
                      <div>
                        <Link href={`/project/${proj.project_id}`}>
                          <p className='font-semibold truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[550px] xl:max-w-[625px]'>
                            {proj.name}
                          </p>
                        </Link>
                        <p className='text-sm text-gray-600 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[550px] xl:max-w-[625px]'>
                          {projects?.find(
                            (p) =>
                              p.applicationId?.toLowerCase() ===
                              proj.project_id?.toLowerCase()
                          )?.description ?? "No description"}
                        </p>
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        You scored: {impactScores[proj.impact]}
                      </div>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <div className='flex justify-center items-center rounded-md w-[42px] h-[40px] bg-[#F2F3F8] text-[#636779]'>
                      {i + 1}
                    </div>
                    <div
                      className='flex justify-center items-center rounded-md w-[42px] h-[40px] cursor-move bg-[#F2F3F8] text-[#636779]'
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const data = e.dataTransfer.getData("text/plain");
                        if (data) {
                          const { index: draggedIndex, id: draggedId } =
                            JSON.parse(data);
                          const newIndex = i;
                          if (draggedIndex !== newIndex) {
                            const newProjects = [...projectList];
                            const [removed] = newProjects.splice(
                              draggedIndex,
                              1
                            );
                            newProjects.splice(newIndex, 0, removed);
                            setProjectList(newProjects);
                            savePosition({
                              id: draggedId,
                              position: newIndex,
                            });
                          }
                        }
                      }}
                    >
                      <Menu />
                    </div>
                  </div>
                </div>
                <div className='px-1'>
                  <Separator orientation='vertical' className='h-10' />
                </div>
                <div className='flex flex-col justify-start items-center gap-1'>
                  <div className='relative'>
                    <NumberInput
                      placeholder='--'
                      className='text-center w-[112px]'
                      value={proj.allocation}
                      onChange={(newValue) => {
                        const newProjectList = [...projectList];
                        newProjectList[i].allocation = newValue;
                        setProjectList(newProjectList);
                        saveDistributionMethod(DistributionMethod.CUSTOM);
                      }}
                      onBlur={() => {
                        saveAllocation({
                          project_id: proj.project_id,
                          allocation: proj.allocation,
                        });
                      }}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <span className='absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                      %
                    </span>
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    {formatAllocationOPAmount(
                      (totalAllocationAmount * proj.allocation) / 100
                    )}{" "}
                    OP
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* <OpenSourceMultiplier initialValue={ballot?.os_multiplier} /> */}
        {/* <Button onClick={() => handleImpactChange(ballot?.projects_to_be_evaluated[0] ?? "", 5)}>Score Impact</Button> */}

        <div className='flex flex-col gap-6 mt-6'>
          <WeightsError />
          <div className='flex items-center gap-4'>
            <BallotSubmitButton onClick={() => setSubmitting(true)} />
            <IsSavingBallot />
          </div>
        </div>

        {ballot?.address && (
          // <SubmitDialog
          //   ballot={ballot!}
          //   open={isSubmitting}
          //   onOpenChange={() => setSubmitting(false)}
          // />
          <SubmitRound5Dialog
            ballot={ballot!}
            open={isSubmitting}
            onOpenChange={() => setSubmitting(false)}
          />
        )}
      </Card>
      {conflicts.length > 0 && (
        <>
          <h1 className='text-lg font-bold pt-6'>Conflicts of interest</h1>
          {conflicts.map((proj, i) => {
            return (
              <div
                key={proj.project_id}
                className={`flex justify-between flex-1 border-b gap-1 py-6`}
                draggable='true'
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "text/plain",
                    JSON.stringify({ index: i, id: proj.project_id })
                  );
                }}
              >
                <div className='flex items-start justify-between flex-grow'>
                  <div className='flex items-start gap-1'>
                    <div
                      className='size-12 rounded-lg bg-gray-100 bg-cover bg-center flex-shrink-0'
                      style={{
                        backgroundImage: `url(${proj.image})`,
                      }}
                    />
                    <div className='flex flex-col gap-1 ml-4'>
                      <div>
                        <Link href={`/project/${proj.project_id}`}>
                          <p className='font-semibold truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[550px] xl:max-w-[625px]'>
                            {proj.name}
                          </p>
                        </Link>
                        <p className='text-sm text-gray-600 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[550px] xl:max-w-[625px]'>
                          {projects?.find(
                            (p) =>
                              p.applicationId?.toLowerCase() ===
                              proj.project_id?.toLowerCase()
                          )?.description ?? "No description"}
                        </p>
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        You marked: {impactScores[proj.impact]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function BallotSubmitButton({ onClick }: ComponentProps<typeof Button>) {
  const allocationSum = useRound5BallotWeightSum();
  const isBadgeholder = useIsBadgeholder();
  const [days, hours, minutes, seconds] = useVotingTimeLeft(votingEndDate);

  if (Number(seconds) < 0) {
    return null;
  }
  return (
    <Button
      disabled={allocationSum !== 100}
      variant={"destructive"}
      type='submit'
      onClick={onClick}
    >
      Submit budget and ballot
    </Button>
  );
}

function WeightsError() {
  const allocationSum = useRound5BallotWeightSum();
  const remainingAllocation = useMemo(() => {
    return 100 - allocationSum;
  }, [allocationSum]);

  const { data: distributionMethod } = useDistributionMethodFromLocalStorage();

  if (!distributionMethod)
    return (
      <span className='text-sm text-destructive'>
        Choose an allocation method at the top of this ballot.
      </span>
    );

  if (allocationSum === 100) return null;

  return (
    <span className='text-sm text-destructive'>
      Percentages must equal 100% (
      {remainingAllocation > 0
        ? `add ${remainingAllocation}% to your ballot`
        : `remove ${Math.abs(remainingAllocation)}% from your ballot`}
      )
    </span>
  );
}

function IsSavingBallot() {
  const isSavingBallot = useIsSavingRound5Ballot();

  return isSavingBallot ? (
    <span className='flex gap-2'>
      <LoaderIcon className={"animate-spin size-4"} />
      <span className='text-xs'>Saving ballot...</span>
    </span>
  ) : null;
}

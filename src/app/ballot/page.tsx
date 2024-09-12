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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useVotingTimeLeft } from "@/components/voting-ends-in";
import { votingEndDate } from "@/config";
import { categoryNames } from "@/data/categories";
import {
  MAX_MULTIPLIER_VALUE,
  Round5ProjectAllocation,
  useBallotWeightSum,
  useOsMultiplier,
  useRound5Ballot,
} from "@/hooks/useBallot";
import {
  useIsSavingRound5Ballot,
  useRound5BallotWeightSum,
  useSaveRound5Allocation,
  useSaveRound5Position,
} from "@/hooks/useBallotRound5";
import { useIsBadgeholder } from "@/hooks/useIsBadgeholder";
import { formatDate } from "@/lib/utils";
import { ArrowDownToLineIcon, LoaderIcon, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ComponentProps, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import VotingSuccess from "../../../public/RetroFunding_Round4_IVoted@2x.png";
import { ManualDialog } from "../../components/common/manual-dialog";
import { MetricsEditor } from "../../components/metrics-editor";
import { CategoryId } from "@/types/shared";

function formatAllocationOPAmount(amount: number) {
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
  1: "Very low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very high",
};

const totalAllocationAmount = 3_333_333;

const projects: Round5ProjectAllocation[] = [
  {
    position: 0,
    allocation: 0,
    impact: 0,
    image: "https://via.placeholder.com/150",
    name: "Project name 1",
    project_id: "1",
  },
  {
    position: 0,
    allocation: 0,
    impact: 0,
    image: "https://via.placeholder.com/150",
    name: "Project name 2",
    project_id: "1",
  },
  {
    position: 0,
    allocation: 0,
    impact: 0,
    image: "https://via.placeholder.com/150",
    name: "Project name 3",
    project_id: "1",
  },
  {
    position: 0,
    allocation: 0,
    impact: 0,
    image: "https://via.placeholder.com/150",
    name: "Project name 4",
    project_id: "1",
  },
  {
    position: 0,
    allocation: 0,
    impact: 0,
    image: "https://via.placeholder.com/150",
    name: "Project name 5",
    project_id: "1",
  },
];

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
  const { isPending, data: ballot } = useRound5Ballot(address);
  console.log("Ballot Data from new API:", { ballot });
  const { state } = useBallotRound5Context();
  // Comment out for local dev if needed
  if (isPending) {
    return <Skeleton className='p-6 h-96' />;
  }
  if (!address && !isConnecting) {
    return <NonBadgeholder />;
  }
  const isEmptyBallot = !Object.keys(state).length;
  if (isEmptyBallot) {
    return <EmptyBallot />;
  }
  return <YourBallot />;
}

const categoryIds: CategoryId[] = [
  "ETHEREUM_CORE_CONTRIBUTIONS",
  "OP_STACK_RESEARCH_AND_DEVELOPMENT",
  "OP_STACK_TOOLING",
];

function YourBallot() {
  const [isSubmitting, setSubmitting] = useState(false);

  const { ballot } = useBallotRound5Context();
  const { mutate: saveAllocation } = useSaveRound5Allocation();
  const { mutate: savePosition } = useSaveRound5Position();

  console.log({ ballot });

  const [projectList, setProjectList] = useState(
    ballot?.project_allocations || []
  );

  useEffect(() => {
    setProjectList(ballot?.project_allocations || []);
  }, [ballot]);

  const updateProjects = (newProjects: Round5ProjectAllocation[]) => {
    setProjectList(newProjects);
  };

  const handleAllocationMethodSelect = (data: { x: number; y: number }[]) => {
    const totalAllocation = data.reduce((sum, point) => sum + point.y, 0);
    const newProjectList = projectList.map((project, index) => ({
      ...project,
      allocation:
        index < data.length ? (data[index].y / totalAllocation) * 100 : 0,
    }));
    setProjectList(newProjectList);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<
    Round5ProjectAllocation[]
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

  // For dev purposes only
  // const { mutate: saveImpact } = useSaveProjectImpact();

  // const handleImpactChange = (projectId: string, impact: ImpactScore) => {
  //   saveImpact({projectId, impact});
  // };

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
        <a href={`/category/${categoryIds[0]}`} className='underline'>
          {categoryNames[categoryIds[0]]}
        </a>{" "}
        ({projects.length} projects)
      </p>
      <Card className='p-6 space-y-8'>
        <MetricsEditor
          onAllocationMethodSelect={handleAllocationMethodSelect}
        />
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
                className='flex justify-between flex-1 border-b gap-1 py-2'
                draggable='true'
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
                          <p className='font-semibold'>{proj.name}</p>
                        </Link>
                        <p className='text-sm text-gray-400'>
                          Some one-line description of project
                        </p>
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        You scored: Very high impact
                      </div>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <div className='flex justify-center items-center rounded-md border-2 w-10 h-10'>
                      {i + 1}
                    </div>
                    <div
                      className='flex justify-center items-center rounded-md border-2 w-10 h-10 cursor-move'
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", i.toString());
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedIndex = parseInt(
                          e.dataTransfer.getData("text/plain")
                        );
                        console.log(draggedIndex, i);
                        const newIndex = i;
                        if (draggedIndex !== newIndex) {
                          const newProjects = [...projectList];
                          const [removed] = newProjects.splice(draggedIndex, 1);
                          newProjects.splice(newIndex, 0, removed);
                          updateProjects(newProjects);
                          savePosition({
                            id: proj.project_id,
                            position: newIndex,
                          });
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
                    <Input
                      type='number'
                      placeholder='--'
                      className='text-center'
                      value={proj.allocation}
                      onChange={(e) => {
                        const newAllocation = parseFloat(e.target.value);
                        const newProjectList = [...projectList];
                        newProjectList[i].allocation = isNaN(newAllocation)
                          ? 0
                          : newAllocation;
                        setProjectList(newProjectList);
                        saveAllocation({
                          project_id: proj.project_id,
                          allocation: newAllocation,
                        });
                      }}
                    />
                    <span className='absolute right-10 top-1/2 transform -translate-y-1/2 pointer-events-none'>
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

        <div className='flex items-center gap-4'>
          <BallotSubmitButton onClick={() => setSubmitting(true)} />

          <WeightsError />
          <IsSavingBallot />
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
    </div>
  );
}

function BallotSubmitButton({ onClick }: ComponentProps<typeof Button>) {
  const allocationSum = useBallotWeightSum();
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
      Submit ballot
    </Button>
  );
}

function OpenSourceMultiplier({ initialValue = 0 }) {
  const { mutate, variables } = useOsMultiplier();

  const multiplier = variables ?? initialValue;
  return (
    <Card className='p-4'>
      <div className='space-y-4 mb-4'>
        <div className='text-muted-foreground text-xs'>Optional</div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='font-medium text-sm'>
              Add an open source reward multiplier
            </div>
            <Badge
              variant={multiplier > 1 ? "destructive" : "secondary"}
              className='cursor-pointer'
            >
              {multiplier > 1 ? "On" : "Off"}
            </Badge>
          </div>

          <div className='flex gap-2 flex-1'>
            <Slider
              value={[multiplier]}
              onValueChange={([v]) => mutate(v)}
              min={1.0}
              step={0.1}
              max={MAX_MULTIPLIER_VALUE}
            />
            <NumericFormat
              customInput={OpenSourceInput}
              className='w-16'
              suffix='x'
              allowNegative={false}
              decimalScale={2}
              allowLeadingZeros={false}
              isAllowed={(values) =>
                (values?.floatValue ?? 0) <= MAX_MULTIPLIER_VALUE
              }
              onValueChange={({ floatValue }) => mutate(floatValue ?? 0)}
              value={multiplier ?? 0}
              defaultValue={0}
            />
          </div>
        </div>
        <div className='text-xs text-muted-foreground'>
          The reward multiplier takes your allocation and multiplies its effects
          across open source projects. Projects must have open source licenses
          in all of the Github repos, which contain their contract code, to
          qualify. We adhered to the Open Source Initiative&apos;s definition of
          open source software.{" "}
          <ManualDialog>
            <div
              // onClick={() => setOpen(true)}
              className='font-semibold'
            >
              Learn more
            </div>
          </ManualDialog>
        </div>
        <Separator />
      </div>
    </Card>
  );
}

function OpenSourceInput(props: ComponentProps<typeof Input>) {
  return <Input {...props} />;
}

function WeightsError() {
  const allocationSum = useRound5BallotWeightSum();

  if (allocationSum === 100) return null;

  return (
    <span className='text-sm text-destructive'>
      Weights must add up to 100%
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

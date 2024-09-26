'use client'

import Image from "next/image";
import { Card } from "../ui/card";
import R5VotedImage from '../../../public/RetroFunding_R5_IVoted_16x9.png'
import { useBallotSubmission } from "@/hooks/useBallotRound5";
import { Button } from "../ui/button";
import { ArrowDownToLineIcon } from "lucide-react";
import { votingEndDate } from "@/config";
import { downloadImage } from "./submit-dialog5";

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const getMonthName = (monthNumber: number) => {
  return monthNames[monthNumber - 1] || '';
};

export function PostSubmissionBanner() {
  const {data} = useBallotSubmission()
  if (!data) return null
  
  const dueDate = `${getMonthName(votingEndDate.getMonth() + 1)} ${votingEndDate.getDate()}`
  const submittedDate = new Date(data.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const submittedTime = new Date(data.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return (
    <Card className="p-4 bg-[#D6E4FF] rounded-[12px]">
      <div className="w-full flex items-center justify-between gap-3 text-[#3374DB]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.99992 13.6673C3.31802 13.6673 0.333252 10.6825 0.333252 7.00065C0.333252 3.31875 3.31802 0.333984 6.99992 0.333984C10.6818 0.333984 13.6666 3.31875 13.6666 7.00065C13.6666 10.6825 10.6818 13.6673 6.99992 13.6673ZM6.33499 9.66732L11.0491 4.95327L10.1063 4.01046L6.33499 7.78172L4.44939 5.89605L3.50658 6.83892L6.33499 9.66732Z"
            fill="#3374DB"
          />
        </svg>
        <p className="text-sm text-left dark:text-black">
          Your budget and ballot were submitted on {submittedDate} at {submittedTime}. You can make changes and resubmit until {dueDate} at 12:00 AM UTC. To do so, simply edit and submit again.
        </p>
        <Image id="download" src={R5VotedImage} alt="Success!" width={142} height={80} className="rounded-[6px]" />
        <Button variant="ghost" size="icon" onClick={() => downloadImage(document.querySelector('#download'))}>
          <ArrowDownToLineIcon className="size-[14px] ml-2" />
        </Button>
      </div>
    </Card>
  );
}
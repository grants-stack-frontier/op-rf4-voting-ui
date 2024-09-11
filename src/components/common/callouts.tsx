"use client";
import { useIsBadgeholder } from "@/hooks/useIsBadgeholder";
import { useAccount } from "wagmi";
import { votingEndDate } from "@/config";
// import { useVotingTimeLeft } from "../voting-ends-in";

export function Callouts() {
  const { address, status } = useAccount();
  const isBadgeholder = useIsBadgeholder();

  // const [days, hours, minutes, seconds] = useVotingTimeLeft(votingEndDate);

  // if (Number(seconds) < 0) {
  //   return (
  //     <div className="bg-accent-foreground dark:text-black text-center p-3 text-white">
  //       Voting in Retro Funding Round 4 has closed
  //     </div>
  //   );
  // }

  if (!address) return null;
  if (["connecting", "reconnecting"].includes(status)) return null;
  if (isBadgeholder) return null;

  return (
    <div className="bg-accent-foreground text-center p-3 text-white">
      Demo mode: You&apos;re not a badgeholder
    </div>
  );
}

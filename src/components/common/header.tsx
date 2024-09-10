"use client";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { badgeholderManualUrl, votingEndDate } from "@/config";
import mixpanel from "mixpanel-browser";
import { ConnectButton } from "../auth/connect-button";
import { SignMessage } from "../auth/sign-message";
import { VoterConfirmationDialog } from "../auth/voter-confirmation";
import { ModeToggle } from "../dark-mode-toggle";
import { Separator } from "../ui/separator";
import { VotingEndsIn } from "../voting-ends-in";

export function Header() {
  return (
    <header className="h-20 px-4 flex justify-between items-center">
      <Link href={"/"}>
        <Logo />
      </Link>
      <div className="hidden sm:flex items-center gap-2 divide-x space-x-2 text-sm">
        <div className="flex flex-col lg:flex-row items-center">
          Time left to vote{" "}
          <VotingEndsIn className="pl-2" date={votingEndDate} />
        </div>
        <Link href={badgeholderManualUrl} target="_blank">
          <Button
            iconRight={ArrowUpRight}
            variant="link"
            className="pl-4"
            onClick={() => mixpanel.track("Open Manual", { external: true })}
          >
            View badgeholder manual
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Separator orientation="vertical" />
        <div className="hidden sm:block">
          <ConnectButton />
        </div>
      </div>

      <SignMessage />
      <VoterConfirmationDialog />
    </header>
  );
}

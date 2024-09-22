"use client";

import { ArrowUpRight } from "lucide-react";
import mixpanel from "mixpanel-browser";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { badgeholderManualUrl, votingEndDate } from "@/config";
import { hasSeenIntro } from "@/utils/localStorage";

import logo from "../../../public/logo.svg";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "../auth/connect-button";
import { SignMessage } from "../auth/sign-message";
import { VoterConfirmationDialog } from "../auth/voter-confirmation";
import { ModeToggle } from "../dark-mode-toggle";
import { Separator } from "../ui/separator";
import { VotingEndsIn } from "../voting-ends-in";

export function Header() {
  const { address } = useAccount();
  const [homeHref, setHomeHref] = useState("/");

  useEffect(() => {
    if (address && hasSeenIntro(address)) {
      setHomeHref("/budget");
    } else {
      setHomeHref("/");
    }
  }, [address]);

  return (
    <header className='h-20 px-4 flex justify-between items-center'>
      <Link href={homeHref}>
        <Image src={logo} alt='Logo' />
      </Link>
      <div className='hidden sm:flex items-center gap-2 divide-x space-x-2 text-sm'>
        <div className='flex flex-col lg:flex-row items-center h-8'>
          <p>Round 5: OP Stack</p>
        </div>
        <div className='flex flex-col lg:flex-row items-center h-8'>
          <VotingEndsIn className='pl-4' date={votingEndDate} />
        </div>
        <Link href={badgeholderManualUrl} target='_blank'>
          <Button
            iconRight={ArrowUpRight}
            variant='link'
            className='pl-4 h-8'
            onClick={() => mixpanel.track("Open Manual", { external: true })}
          >
            View badgeholder manual
          </Button>
        </Link>
      </div>
      <div className='flex items-center gap-2'>
        <ModeToggle />
        <Separator orientation='vertical' />
        <div className='hidden sm:block'>
          <ConnectButton />
        </div>
      </div>

      <SignMessage />
      <VoterConfirmationDialog />
    </header>
  );
}

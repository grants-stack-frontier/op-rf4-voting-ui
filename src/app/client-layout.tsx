"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";
import { DisconnectedState } from "@/components/common/disconnected-state";
import { Header } from "@/components/common/header";
import { Callouts } from "@/components/common/callouts";
import SunnySVG from "../../public/sunny.svg";
import Image from "next/image";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  const { isConnecting, isConnected } = useAccount();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <main className=''>
      <Header />
      <div className='sm:hidden h-screen -mt-16 px-4 flex flex-col gap-4 justify-center items-center'>
        <Image src={SunnySVG} alt='Sunny' />
        <div className='text-center'>
          The mobile version of this website isn&apos;t ready yet. Please use
          your desktop computer.
        </div>
      </div>
      <div className='hidden sm:block'>
        <Callouts />
      </div>
      <div className='hidden sm:flex gap-8 max-w-[1072px] mx-auto py-16 justify-center'>
        {isConnecting ? (
          <div className='flex justify-center items-center h-screen'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        ) : isConnected ? (
          children
        ) : (
          <DisconnectedState />
        )}
      </div>
    </main>
  );
}

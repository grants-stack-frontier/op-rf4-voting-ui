"use client";
import { useAccount } from "wagmi";
import { redirect } from "next/navigation";
import { DisconnectedState } from "@/components/common/disconnected-state";

export default function Home() {
  const { address } = useAccount();

  if (address) {
    return redirect("/welcome");
  }

  return <DisconnectedState />;
}

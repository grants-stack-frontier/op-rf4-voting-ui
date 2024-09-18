"use client"
import {Heading} from "@/components/ui/headings";
import {Text} from "@/components/ui/text";
import {ConnectButton} from "@/components/auth/connect-button";
import {useAccount} from "wagmi";
import {redirect} from "next/navigation";
import { DisconnectedState } from "@/components/common/disconnected-state";

export default function Home() {
    const {address} = useAccount();

    if (address) {
        return redirect("/welcome");
    }
    return (
        <DisconnectedState />
    );
}

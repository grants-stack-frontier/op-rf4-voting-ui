"use client";

import { SiweMessage } from "siwe";
import ky from "ky";
import { decodeJwt } from "jose";
import {
  useAccount,
  useChainId,
  useDisconnect as useWagmiDisconnect,
  useSignMessage,
} from "wagmi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { getToken, setToken } from "@/lib/token";
import { useRouter } from "next/navigation";
import mixpanel from "@/lib/mixpanel";
import { Address } from "viem";
import { useEffect, useState } from "react";
import Image from "next/image";

import ApprovedEmoji from "../../../public/approved.png";
import DeniedEmoji from "../../../public/denied.png";
import { getVoterConfirmationView, removeVoterConfirmationView } from "./sign-message";

export function VoterConfirmationDialog() {
  const { data: session } = useSession();
  const { address } = useAccount();
  const [viewable, setViewable] = useState<boolean>(false);

  function closeViewable() {
    removeVoterConfirmationView();
    setViewable(getVoterConfirmationView());
  }

  useEffect(() => {
    setViewable(getVoterConfirmationView())
  }, [address, session])

  return (
    <Dialog open={address && !!session && viewable}>
      {!session?.isBadgeholder && <VoterIsNotBadgeholder onClose={closeViewable} />}
      {(session?.isBadgeholder && !session?.category) && <VoterIsNotSelected onClose={closeViewable} />}
      {(session?.isBadgeholder && session?.category) && <VoterIsSelected onClose={closeViewable} />}
    </Dialog>
  );
}

function VoterIsSelected(props: any) {
  return (
    <DialogContent>
      <DialogHeader>
        <div className="flex justify-center items-center mb-4">
          <Image src={ApprovedEmoji} alt="badge" width={50} height={50}/>
        </div>
        <DialogTitle>You&apos;ve been selected to vote in this round of Retro Funding</DialogTitle>
        <DialogDescription>You&apos;re in a special group of badgeholders and guest voters participating in this round. Thanks in advance for your efforts.</DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Button
          type="button"
          className="w-full"
          variant={"destructive"}
          onClick={() => {
            props.onClose();
          }}
        >
          Continue
        </Button>
      </div>
    </DialogContent>
  )
}

function VoterIsNotSelected(props: any) {
  const { disconnect } = useDisconnect();
  return (
    <DialogContent>
      <DialogHeader>
        <div className="flex justify-center items-center mb-4">
          <Image src={DeniedEmoji} alt="badge" width={50} height={50}/>
        </div>
        <DialogTitle>You weren&apos;t selected to vote in this round of Retro Funding</DialogTitle>
        <DialogDescription>Thanks for being a badgeholder, and we&apos;ll see you in the next round of Retro Funding.</DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Button
          type="button"
          className="w-full"
          variant={"destructive"}
          onClick={() => {
            disconnect?.();
          }}
        >
          Disconnect wallet
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => {
            props.onClose();
          }}
        >
          Explore the app
        </Button>
      </div>
    </DialogContent>
  )
}

function VoterIsNotBadgeholder(props: any) {
  const { disconnect } = useDisconnect();
  return (
    <DialogContent>
      <DialogHeader>
        <div className="flex justify-center items-center mb-4">
          <Image src={DeniedEmoji} alt="badge" width={50} height={50}/>
        </div>
        <DialogTitle>You&apos;re not a badgeholder</DialogTitle>
        <DialogDescription>Feel free to explore the app, but you won&apos;t be able to use all features or submit a ballot.</DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Button
          type="button"
          className="w-full"
          variant={"destructive"}
          onClick={() => {
            disconnect?.();
          }}
        >
          Disconnect wallet
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => {
            props.onClose();
          }}
        >
          Explore the app
        </Button>
      </div>
    </DialogContent>
  )
}

function useNonce() {
  return useQuery({
    queryKey: ["nonce"],
    queryFn: async () => ky.get("/api/agora/auth/nonce").text(),
  });
}
function useVerify() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (json: {
      message: string;
      signature: string;
      nonce: string;
    }) => {
      const { access_token, ...rest } = await ky
        .post("/api/agora/auth/verify", { json })
        .json<{ access_token: string }>();
      console.log(rest);
      mixpanel.track("Sign In", { status: "success" });
      setToken(access_token);
      // Trigger a refetch of the session
      await client.invalidateQueries({ queryKey: ["session"] });

      return { access_token };
    },
  });
}
export function useDisconnect() {
  const client = useQueryClient();
  const router = useRouter();
  const wagmiDisconnect = useWagmiDisconnect();

  async function disconnect() {
    wagmiDisconnect.disconnect();
    global?.localStorage.removeItem("token");
    mixpanel.reset();
    await client.invalidateQueries({ queryKey: ["session"] });
    router.push("/");
  }

  return { disconnect };
}
export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const accessToken = getToken();
      const user = accessToken
        ? decodeJwt<{ siwe: { address: Address }; isBadgeholder?: boolean, category?: string }>(
            accessToken
          )
        : null;

      if (user) {
        mixpanel.identify(user.siwe.address);
        mixpanel.people.set({
          $name: user.siwe.address,
          badgeholder: user.isBadgeholder,
        });
      }
      console.log(user);

      return user;
    },
  });
}

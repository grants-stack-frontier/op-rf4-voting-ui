"use client";

import ky from "ky";
import { decodeJwt } from "jose";
import { useAccount, useDisconnect as useWagmiDisconnect } from "wagmi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";

import { getToken, setToken } from "@/lib/token";
import { useRouter } from "next/navigation";
import mixpanel from "@/lib/mixpanel";
import { Address } from "viem";
import { useEffect, useState } from "react";

import {
  getVoterConfirmationView,
  removeVoterConfirmationView,
} from "./sign-message";
import { UnifiedDialog } from "./unified-dialog";

import React from "react";

export function VoterConfirmationDialog() {
  const { data: session } = useSession();
  const { address } = useAccount();
  const [viewable, setViewable] = useState<boolean>(false);

  function closeViewable() {
    removeVoterConfirmationView();
    setViewable(getVoterConfirmationView());
  }

  useEffect(() => {
    setViewable(getVoterConfirmationView());
  }, [address, session]);

  if (!viewable || !address || !session) return null;

  if (!session.isBadgeholder) {
    return <VoterIsNotBadgeholder onClose={closeViewable} />;
  }

  if (!session.category) {
    return <VoterIsNotSelected onClose={closeViewable} />;
  }

  return <VoterIsSelected onClose={closeViewable} />;
}

function VoterIsSelected({ onClose }: { onClose: () => void }) {
  return (
    <UnifiedDialog
      open={true}
      onClose={onClose}
      title="You've been selected to vote in this round of Retro Funding"
      description="You're in a special group of badgeholders and guest voters participating in this round. Thanks in advance for your efforts."
      emoji='✅'
    >
      <Button
        type='button'
        className='w-full'
        variant='destructive'
        onClick={onClose}
      >
        Continue
      </Button>
    </UnifiedDialog>
  );
}

function VoterIsNotSelected({ onClose }: { onClose: () => void }) {
  const { disconnect } = useDisconnect();
  return (
    <UnifiedDialog
      open={true}
      onClose={onClose}
      title="You weren't selected to vote in this round of Retro Funding"
      description="Thanks for being a badgeholder, and we'll see you in the next round of Retro Funding."
      emoji='🛑'
    >
      <div className='space-y-2'>
        <Button
          type='button'
          className='w-full'
          variant='destructive'
          onClick={() => disconnect?.()}
        >
          Disconnect wallet
        </Button>
        <Button className='w-full' variant='outline' onClick={onClose}>
          Explore the app
        </Button>
      </div>
    </UnifiedDialog>
  );
}

function VoterIsNotBadgeholder({ onClose }: { onClose: () => void }) {
  const { disconnect } = useDisconnect();
  return (
    <UnifiedDialog
      open={true}
      onClose={onClose}
      title="You're not a badgeholder"
      description="Feel free to explore the app, but you won't be able to use all features or submit a ballot."
      emoji='🛑'
    >
      <div className='space-y-2'>
        <Button
          type='button'
          className='w-full'
          variant='destructive'
          onClick={() => disconnect?.()}
        >
          Disconnect wallet
        </Button>
        <Button className='w-full' variant='outline' onClick={onClose}>
          Explore the app
        </Button>
      </div>
    </UnifiedDialog>
  );
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
        ? decodeJwt<{
            siwe: { address: Address };
            isBadgeholder?: boolean;
            category?: string;
          }>(accessToken)
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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDisconnect as useWagmiDisconnect } from "wagmi";
import ky from "ky";
import { decodeJwt } from "jose";
import { Address } from "viem";
import mixpanel from "@/lib/mixpanel";
import { getToken, setToken } from "@/lib/token";

export function useNonce() {
  return useQuery({
    queryKey: ["nonce"],
    queryFn: async () => ky.get("/api/agora/auth/nonce").text(),
  });
}

export function useVerify() {
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

      setVoterConfirmationView();

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
    global?.localStorage?.removeItem("token");
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
        ? decodeJwt<{ siwe: { address: Address }; isBadgeholder?: boolean }>(
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

      return user;
    },
  });
}

// Helper functions
function setVoterConfirmationView() {
  localStorage.setItem("voter-confirmation-view", "true");
}

export function getVoterConfirmationView() {
  const view = localStorage.getItem("voter-confirmation-view");
  return !!view;
}

export function removeVoterConfirmationView() {
  const view = localStorage.getItem("voter-confirmation-view");
  if (view) localStorage.removeItem("voter-confirmation-view");
}

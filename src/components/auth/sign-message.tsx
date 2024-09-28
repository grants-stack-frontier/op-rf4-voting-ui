'use client';

import { useState, useEffect } from 'react';
import { SiweMessage } from 'siwe';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import mixpanel from '@/lib/mixpanel';
import {
  useDisconnect,
  useNonce,
  useSession,
  useVerify,
} from '@/hooks/useAuth';

export function SignMessage() {
  const [isLoading, setIsLoading] = useState(true);
  const { data: nonce } = useNonce();
  const { data: session, isLoading: isSessionLoading } = useSession();
  const { address } = useAccount();
  const verify = useVerify();
  const chainId = useChainId();
  const sign = useSignMessage();

  useEffect(() => {
    if (!isSessionLoading) {
      setIsLoading(false);
    }
  }, [isSessionLoading]);

  useEffect(() => {
    if (address) mixpanel.track('Connect Wallet', { status: 'success' });
  }, [address]);

  async function handleSign() {
    if (nonce) {
      mixpanel.track('Sign In', { status: 'init' });
      const message = new SiweMessage({
        version: '1',
        domain: window.location.host,
        uri: window.location.origin,
        address,
        chainId,
        nonce,
        statement: 'Sign in to Agora with Ethereum',
      }).prepareMessage();
      const signature = await sign.signMessageAsync({ message });
      verify.mutate({ signature, message, nonce });
    }
  }

  const { disconnect } = useDisconnect();

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={address && !session}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Authenticate</DialogTitle>
          <DialogDescription>Sign message to authenticate.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            variant={'destructive'}
            isLoading={sign.isPending}
            onClick={handleSign}
          >
            Sign message
          </Button>
          <Button
            className="w-full"
            variant="ghost"
            onClick={() => {
              disconnect?.();
            }}
          >
            Disconnect wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

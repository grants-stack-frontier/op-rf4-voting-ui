'use client';

import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { ConnectButton as RConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { forwardRef } from 'react';
import mixpanel from '@/lib/mixpanel';
import { useDisconnect } from '@/hooks/useAuth';

export function ConnectButton() {
  const { disconnect } = useDisconnect();

  return (
    <RConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      openConnectModal();
                      mixpanel.track('Connect Wallet', { status: 'init' });
                    }}
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button variant="outline" onClick={openChainModal}>
                    Wrong network
                  </Button>
                );
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <UserButton {...account} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => disconnect()}>
                      Disconnect wallet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
          </div>
        );
      }}
    </RConnectButton.Custom>
  );
}

const UserButton = forwardRef<
  HTMLDivElement,
  { displayName: string; ensAvatar?: string }
>(function UserButton({ displayName, ensAvatar }, ref) {
  return (
    <div
      ref={ref}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
    >
      {ensAvatar ? (
        <Image
          alt={displayName}
          width={24}
          height={24}
          className="size-6 rounded-full mr-2"
          src={ensAvatar}
        />
      ) : (
        <div className="bg-gray-200 size-6 mr-2 rounded-full" />
      )}
      {displayName}
      <ChevronDown className="size-4 ml-2" />
    </div>
  );
});

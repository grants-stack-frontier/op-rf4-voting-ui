import React, { useRef, useEffect } from 'react';
import { Heading } from '@/components/ui/headings';
import { Text } from '@/components/ui/text';
import { ConnectButton } from '@/components/auth/connect-button';

export const DisconnectedState = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (supportsHEVCAlpha()) {
        video.src = '/SunnyVote_playOnce_700px_HEVC.mov';
      } else {
        video.src = '/SunnyVote_playOnce_700px.webm';
      }
    }
  }, []);

  function supportsHEVCAlpha() {
    const navigator = window.navigator;
    const ua = navigator.userAgent.toLowerCase();
    const hasMediaCapabilities = !!(
      navigator.mediaCapabilities && navigator.mediaCapabilities.decodingInfo
    );
    const isSafari =
      ua.indexOf('safari') !== -1 &&
      ua.indexOf('chrome') === -1 &&
      ua.indexOf('version/') !== -1;
    return isSafari && hasMediaCapabilities;
  }

  return (
    <div className="max-w-screen-md mx-auto">
      <section className="flex flex-col items-center gap-4">
        <video
          ref={videoRef}
          className="max-w-lg w-full"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="flex flex-col items-center gap-4">
          <div className="uppercase tracking-widest">Vote</div>
          <Heading variant={'h2'}>Retro Funding Round 5: OP Stack</Heading>
          <Text className="text-center">
            Retroactive Public Goods Funding (Retro Funding) 5 will reward
            contributors to the OP Stack, including core Ethereum infrastructure
            that supports or underpins the OP Stack, advancements in OP Stack
            research and development, and tooling which supports its
            accessibility and usability.
          </Text>
          <ConnectButton />
        </div>
      </section>
    </div>
  );
};

'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { markIntroAsSeen } from '@/utils/localStorage';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '../ui/button';
import { Heading } from '../ui/headings';

export function WelcomeCarousel({
  slides,
}: {
  slides: { title: string; description: string; image: { src: string } }[];
}) {
  const { address } = useAccount();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const handleComplete = useCallback(() => {
    if (address) {
      markIntroAsSeen(address);
    }
  }, [address]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const { title, description } = slides[current - 1] ?? {};

  return (
    <div className="flex flex-col items-center">
      <Carousel setApi={setApi} className="w-full max-w-[550px] h-[280px]">
        <CarouselContent>
          {slides.map(({ image }, index) => (
            <CarouselItem key={index} className="flex flex-col items-center">
              <div className="w-[300px] mb-6">
                <div className="flex h-36 items-center justify-center">
                  <Image alt="" {...image} />
                </div>
              </div>
              <div className="mx-auto">
                <Heading variant="h3" className="text-center mb-4">
                  {title}
                </Heading>
                <p className="text-center leading-relaxed">{description}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Dots
        current={current - 1}
        total={slides.length}
        onChange={(index) => api?.scrollTo(index)}
      />

      {current === count ? (
        <Link href={'/budget'}>
          <Button variant={'destructive'} onClick={handleComplete}>
            Let&apos;s go!
          </Button>
        </Link>
      ) : (
        <Button variant={'secondary'} onClick={() => api?.scrollNext()}>
          Next
        </Button>
      )}
    </div>
  );
}

function Dots({
  total,
  current,
  onChange,
}: {
  total: number;
  current: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="flex py-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          onClick={() => onChange(i)}
          key={i}
          className={`cursor-pointer p-1`}
        >
          <div
            className={cn(
              `w-2.5 h-2.5 rounded-full cursor-pointer ${
                current === i ? 'bg-gray-600' : 'bg-gray-300'
              }`
            )}
          />
        </div>
      ))}
    </div>
  );
}

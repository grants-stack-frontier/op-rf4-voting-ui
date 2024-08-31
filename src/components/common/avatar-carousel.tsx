import { Carousel, CarouselContent, CarouselItem, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";
import React from "react";

export function AvatarCarousel({ images }: { images: { url: string; name: string }[] }) {
	const [api, setApi] = React.useState<CarouselApi>()
	const [current, setCurrent] = React.useState(0)
	const [count, setCount] = React.useState(0)

	React.useEffect(() => {
		if (!api) {
			return
		}

		setCount(api.scrollSnapList().length)
		setCurrent(api.selectedScrollSnap() + 1)

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap() + 1)
		})
	}, [api])

	return (
		<Carousel setApi={setApi}>
			<CarouselContent>
				<CarouselItem className="flex -space-x-2 rtl:space-x-reverse">
					{images.map(({ url, name }, index) => (
						<TooltipProvider key={index}>
							<Tooltip delayDuration={url ? 0 : 1000000}>
								<TooltipTrigger asChild>
									<Image className="rounded-full" src={url ?? ''} alt={name ?? ''} width={28} height={28} />
								</TooltipTrigger>
								<TooltipContent
									className="max-w-[300px] text-center text-xs"
									sideOffset={-60}
								>
									<p>{name}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					))}
				</CarouselItem>
			</CarouselContent>
			<CarouselNext className="mr-6" />
		</Carousel>
	)
}

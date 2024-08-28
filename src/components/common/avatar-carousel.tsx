import { Carousel, CarouselContent, CarouselItem, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import Image from "next/image";
import React from "react";

export function AvatarCarousel({ images, name }: { images: string[]; name: string }) {
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
					{images.map((imageUrl, index) => (
						<Image key={index} className="rounded-full" src={imageUrl} alt={`${name || ''} - Image ${index + 1}`} width={28} height={28} />
					))}
				</CarouselItem>
			</CarouselContent>
			<CarouselNext className="mr-6" />
		</Carousel>
	)
}

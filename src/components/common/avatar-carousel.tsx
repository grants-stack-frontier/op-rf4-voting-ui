import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";
import { useState } from "react";
import { CarouselNext, CarouselPrevious } from "../ui/carousel";

export function AvatarCarousel({ images }: { images: { url: string; name: string }[] }) {
	const [currentGroup, setCurrentGroup] = useState(0);
	const groupSize = 4;
	const groupCount = Math.ceil(images.length / groupSize);

	const handleNext = () => {
		setCurrentGroup((prev) => (prev + 1) % groupCount);
	};

	const handlePrevious = () => {
		setCurrentGroup((prev) => (prev - 1 + groupCount) % groupCount);
	};

	const currentImages = images.slice(currentGroup * groupSize, (currentGroup + 1) * groupSize);

	return (
		<div className="flex items-center">
			<div className="flex -space-x-2 rtl:space-x-reverse">
				{currentImages.map(({ url, name }, index) => (
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
			</div>
			{groupCount > 1 && (
				<CarouselNext onClick={handleNext} className="ml-2 text-sm text-gray-500 hover:text-gray-700" />
			)}
			{groupCount > 1 && (
				<CarouselPrevious onClick={handlePrevious} className="ml-2 text-sm text-gray-500 hover:text-gray-700" />
			)}
		</div>
	);
}

import { Heading } from "@/components/ui/headings";
import { CustomAccordion } from "../custom-accordion";

export function PricingModel({ pricingModel }: { pricingModel?: string }) {
	if (!pricingModel) return null;

	return (
		<div className="flex flex-col gap-2 mb-12">
			<Heading variant="h1">Pricing Model</Heading>
			<CustomAccordion
				value={pricingModel ?? ''}
				trigger={
					<div className="capitalize text-sm font-medium leading-5">
						{pricingModel?.replace(/_/g, ' ') ?? 'N/A'}
					</div>
				}
			/>
		</div>
	);
}
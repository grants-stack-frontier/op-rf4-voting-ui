import { Heading } from "@/components/ui/headings";
import { CustomAccordion } from "../custom-accordion";

export function PricingModel({ pricingModel }: { pricingModel?: string }) {
	if (!pricingModel) return null;

	return (
		<>
			<Heading variant="h1">Pricing Model</Heading>
			<CustomAccordion
				value={pricingModel ?? ''}
				trigger={
					<div className="capitalize text-sm">
						{pricingModel?.replace(/_/g, ' ') ?? 'N/A'}
					</div>
				}
			/>
		</>
	);
}
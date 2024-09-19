import { Heading } from "@/components/ui/headings";
import { CustomAccordion } from "../custom-accordion";
import { Card, CardContent } from "../ui/card";

export function PricingModel({ pricingModel }: { pricingModel?: string }) {
	if (!pricingModel) return null;

	return (
		<div className="flex flex-col gap-2 mb-12">
			<Heading variant="h1">Pricing Model</Heading>
			{pricingModel === 'free' ? (
				<Card className="mb-12">
					<CardContent className="px-2.5 py-3">
						<div className="capitalize text-sm font-medium leading-5">
							{pricingModel?.replace(/_/g, ' ') ?? 'N/A'}
						</div>
					</CardContent>
				</Card>
			) : (
				<CustomAccordion
					value={pricingModel ?? ''}
					trigger={
						<div className="capitalize text-sm font-medium leading-5">
							{pricingModel === 'pay_to_use' ? pricingModel.replace(/_/g, '-') : pricingModel?.replace(/_/g, ' ') ?? 'N/A'}
						</div>
					}
				/>
			)}
		</div>
	);
}
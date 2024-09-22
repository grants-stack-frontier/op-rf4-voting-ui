import { Heading } from "@/components/ui/headings";
import { CustomAccordion } from "../custom-accordion";
import { Card, CardContent } from "../ui/card";

export function PricingModel({ pricingModel }: {
	pricingModel?: {
		type: string;
		details: string;
	}
}) {
	if (!pricingModel) return null;

	return (
		<div className="flex flex-col gap-2 mb-12">
			<Heading className="text-sm font-medium leading-5" variant="h1">Pricing Model</Heading>
			{pricingModel.type === 'free' ? (
				<Card className="shadow-none">
					<CardContent className="px-2.5 py-3">
						<div className="capitalize text-sm font-medium leading-5">
							{pricingModel.type.replace(/_/g, ' ') ?? 'N/A'}
						</div>
					</CardContent>
				</Card>
			) : (
				<CustomAccordion
					value={pricingModel.type ?? ''}
					trigger={
						<div className="capitalize text-sm font-medium leading-5">
							{pricingModel.type === 'pay_to_use' ? pricingModel.type.replace(/_/g, '-') : pricingModel.type?.replace(/_/g, ' ') ?? 'N/A'}
						</div>
					}
				>
					<div className="p-2 text-sm">
						{pricingModel.details}
					</div>
				</CustomAccordion>
			)}
		</div>
	);
}
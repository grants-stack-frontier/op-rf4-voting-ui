import { ProjectImpactStatement } from "@/__generated__/api/agora.schemas";
import { Heading } from "@/components/ui/headings";
import { categoryNames } from "@/data/categories";
import { Markdown } from "../markdown";

export function ImpactStatement({ impactStatement }: { impactStatement?: ProjectImpactStatement }) {
	if (!impactStatement) return null;

	return (
		<>
			<div className="flex flex-col gap-6 mb-12">
				<Heading className="text-xl font-medium" variant="h3">Impact Statement</Heading>
				<div>
					<div className="flex items-start gap-2 text-gray-700">
						<Heading variant="h1">Category:</Heading>
						<p>{impactStatement?.category ? categoryNames[impactStatement.category] : 'N/A'}</p>
					</div>
					<div className="flex items-start gap-2 text-gray-700">
						<Heading variant="h1">Subcategory:</Heading>
						<p>{impactStatement?.subcategory?.join(', ') ?? 'N/A'}</p>
					</div>
				</div>
				<p className="text-red-600">
					Applicants were asked to report on impact made between Oct 1, 2023 - July 31, 2024. Promises of future deliverables or impact are not allowed.
				</p>
			</div>
			{impactStatement?.statement && Array.isArray(impactStatement.statement) && impactStatement.statement.length > 0 && (
				<>
					{impactStatement.statement.map((statement, index) => (
						<div key={index} className="flex flex-col gap-6 mb-12">
							<p className="border-l-4 pl-2 border-red-500 font-semibold">{statement.question}</p>
							<Markdown>{statement.answer}</Markdown>
						</div>
					))}
				</>
			)}
		</>
	);
}
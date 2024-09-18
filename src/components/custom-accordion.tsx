import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

export function CustomAccordion({ value, trigger, children, collapsible = true }: { value: string, icon?: React.ReactNode, trigger?: React.ReactNode, children?: React.ReactNode, collapsible?: boolean }) {
	return (
		<Accordion className="border border-gray-200 rounded-lg" type="single" collapsible={collapsible}>
			<AccordionItem className="border-b-0" value={value}>
				<AccordionTrigger className="hover:no-underline px-2.5 py-3">
					<div className="flex items-center gap-2">
						{trigger}
					</div>
				</AccordionTrigger>
				<AccordionContent>
					{children}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}
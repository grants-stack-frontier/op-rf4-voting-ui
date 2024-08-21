"use client";
import { Project } from "@/__generated__/api/agora.schemas";
import { Heading } from "@/components/ui/headings";
import mixpanel from "@/lib/mixpanel";
import { CircleDollarSign, Clock3, Link2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";
import { Mirror } from "../common/mirror";
import { Warpcast } from "../common/warpcast";
import { X } from "../common/x";
import { Markdown } from "../markdown";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export function ProjectDetails({ data, isPending }: { data?: Project; isPending: boolean }) {
	console.log({ data });
	const { id, profileAvatarUrl, name, projectCoverImageUrl, description, socialLinks, category, github, links, grantsAndFunding } = data ?? {};
	console.log({ github });
	const { twitter, farcaster, mirror, website } = socialLinks ?? {};
	return (
		<section className="space-y-16">
			<div className="space-y-6">
				{isPending ? (
					<>
						<Skeleton className="w-96 h-8" />
						<div className="space-y-2">
							<Skeleton className="w-full h-4" />
							<Skeleton className="w-full h-4" />
							<Skeleton className="w-4/5 h-4" />
						</div>
					</>
				) : (
					<>
						{projectCoverImageUrl && profileAvatarUrl && (
							<div className="w-full h-56">
								<Image className="rounded-md" src={projectCoverImageUrl} alt={name || ''} width={720} height={180} />
								<Image className="rounded-md -mt-10 ml-6" src={profileAvatarUrl} alt={name || ''} width={80} height={80} />
							</div>
						)}
						<Heading variant="h2">{name}</Heading>
						<div className="flex items-center gap-2">
							<p className="font-medium">By</p>
							{profileAvatarUrl && (
								<Image className="rounded-full" src={profileAvatarUrl} alt={name || ''} width={30} height={30} />
							)}
							<p className="font-medium">{name}</p>
						</div>
						<Markdown className="dark:text-white line-clamp-3">{description}</Markdown>
						<div className="flex flex-wrap items-center gap-2">
							{website && (
								<Link href={website} target="_blank">
									<Button
										variant="link"
										className="gap-1"
										onClick={() => mixpanel.track("Open Website", { external: true })}
									>
										<Link2 className="-rotate-45 h-4 w-4" />
										{website}
									</Button>
								</Link>
							)}
							{farcaster && (
								<Link href={farcaster} target="_blank">
									<Button
										variant="link"
										className="gap-1"
										onClick={() => mixpanel.track("Open Farcaster", { external: true })}
									>
										<Warpcast />
										{farcaster}
									</Button>
								</Link>
							)}
							{twitter && (
								<Link href={twitter} target="_blank">
									<Button
										variant="link"
										className="gap-1"
										onClick={() => mixpanel.track("Open Twitter", { external: true })}
									>
										<X />
										{twitter}
									</Button>
								</Link>
							)}
							{mirror && (
								<Link href={mirror} target="_blank">
									<Button
										variant="link"
										className="gap-1"
										onClick={() => mixpanel.track("Open Mirror", { external: true })}
									>
										<Mirror />
										{mirror}
									</Button>
								</Link>
							)}
						</div>
						<Badge
							variant={null}
							className="cursor-pointer border-0 bg-green-500/25 text-green-600 font-medium"
						>
							{category}
						</Badge>
						<p className="font-medium">Repos, links and contracts</p>
						{/* {github && (
							<>
								{
									github.map((repo, index) => (
										<Accordion type="single" collapsible key={index}>
											<AccordionItem value={repo}>
												<AccordionTrigger>
													<div className="flex items-center gap-2">
														<Github className="h-4 w-4" /> {repo}
													</div>
												</AccordionTrigger>
												<AccordionContent>
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									))
								}
							</>
						)} */}
						{links && (
							<>
								{
									links.map((link, index) => (
										<Accordion type="single" collapsible key={index}>
											<AccordionItem value={link}>
												<AccordionTrigger>
													<div className="flex items-center gap-2">
														<Link2 className="h-4 w-4 -rotate-45" /> {link}
													</div>
												</AccordionTrigger>
												<AccordionContent>
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									))
								}
							</>
						)}
						<p className="font-medium">Grants, funding and revenue (since Jan 2023)</p>
						{grantsAndFunding && (
							<>
								{
									grantsAndFunding.grants?.map(({ grant, amount, date, details, link }, index) => {
										const formattedAmount = amount && Number(amount) > 0 ? new Intl.NumberFormat('en-US').format(Number(amount)) : amount;
										return (
											<Accordion type="single" collapsible key={index}>
												<AccordionItem value={grant || ''}>
													<AccordionTrigger>
														<div className="flex items-center gap-2">
															<p className="font-medium">Grant: {grant}</p>
															<div className="flex items-center gap-2">
																<Link2 className="h-4 w-4 -rotate-45" />
																{link}
															</div>
															<div className="flex items-center gap-2">
																<Image src={Logo.src} alt="Logo" width={20} height={20} />
																{formattedAmount} OP
															</div>
														</div>
													</AccordionTrigger>
													<AccordionContent>
														<Markdown>{details}</Markdown>
													</AccordionContent>
												</AccordionItem>
											</Accordion>
										);
									})
								}
								{
									grantsAndFunding.ventureFunding?.map(({ amount, details, year }, index) => {
										const formattedAmount = amount && Number(amount) > 0 ? new Intl.NumberFormat('en-US').format(Number(amount)) : amount;
										return (
											<Accordion type="single" collapsible key={index}>
												<AccordionItem value={amount || ''}>
													<AccordionTrigger>
														<div className="flex items-center gap-2">
															<p className="font-medium">Funding</p>
															<div className="flex items-center gap-2">
																<CircleDollarSign className="h-4 w-4" />
																{formattedAmount}
															</div>
															<div className="flex items-center gap-2">
																<Clock3 className="h-4 w-4" />
																{year}
															</div>
														</div>
													</AccordionTrigger>
													<AccordionContent>
														<Markdown>{details}</Markdown>
													</AccordionContent>
												</AccordionItem>
											</Accordion>
										);
									})
								}
								{
									grantsAndFunding.revenue?.map(({ amount, details }, index) => {
										const formattedAmount = amount && Number(amount) > 0 ? new Intl.NumberFormat('en-US').format(Number(amount)) : amount;
										return (
											<Accordion type="single" collapsible key={index}>
												<AccordionItem value={amount || ''}>
													<AccordionTrigger>
														<div className="flex items-center gap-2">
															<p className="font-medium">Revenue</p>
															<div className="flex items-center gap-2">
																<CircleDollarSign className="h-4 w-4" />
																{formattedAmount}
															</div>
														</div>
													</AccordionTrigger>
													<AccordionContent>
														<Markdown>{details}</Markdown>
													</AccordionContent>
												</AccordionItem>
											</Accordion>
										);
									})
								}
							</>
						)}
					</>
				)}
			</div>
		</section>
	);
}
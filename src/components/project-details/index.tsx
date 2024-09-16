"use client";
import { Project } from "@/__generated__/api/agora.schemas";
import { CategoryType } from "@/data/categories";
import { Skeleton } from "../ui/skeleton";
import { CategoryAndTeam, TeamMember } from "./category-team";
import { GrantsFundingRevenue } from "./grants-funding-revenue";
import { ImpactStatement } from "./impact-statement";
import { PricingModel } from "./pricing-model";
import { ProjectDescription } from "./project-description";
import { ProjectHeader } from "./project-header";
import { ReposLinksContracts } from "./repos-links-contracts";
import { SocialLinksList } from "./social-links";

export function ProjectDetails({ data, isPending }: { data?: Project; isPending: boolean }) {
	const { profileAvatarUrl, name, projectCoverImageUrl, description, socialLinks, applicationCategory, github, links, grantsAndFunding, pricingModel, impactStatement, contracts, team } = data ?? {};
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
						<ProjectHeader profileAvatarUrl={profileAvatarUrl} name={name} projectCoverImageUrl={projectCoverImageUrl} />
						<ProjectDescription description={description} />
						<SocialLinksList socialLinks={socialLinks} />
						<CategoryAndTeam category={applicationCategory as CategoryType} team={team as TeamMember[] | undefined} />
						<ReposLinksContracts github={github} links={links} contracts={contracts} />
						<ImpactStatement impactStatement={impactStatement} />
						<PricingModel pricingModel={pricingModel} />
						<GrantsFundingRevenue grantsAndFunding={grantsAndFunding} />
					</>
				)}
			</div>
		</section>
	);
}
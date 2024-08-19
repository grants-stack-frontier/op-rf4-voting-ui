"use client";
import { Project } from "@/__generated__/api/agora.schemas";
import { PageView } from "@/components/common/page-view";
import { ProjectDetails } from "@/components/project-details";
import { ReviewSidebar } from "@/components/projects/review-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function ProjectDetailsPage({ params: { id = "" } }) {
	// const { data: project = {}, isPending } = useProjectById(id);
	// console.log({ project });
	const isPending = false;
	const project: Project = {
		id: "0x000c2ce4773defb3010a58d3800d0ec9d432189c574ba26d3103f1db44a5af6d",
		category: "DeFi",
		organization: undefined,
		name: "WOOFi",
		description: "WOOFi is a leading DEX with over $14B cumulative trading volume and 250k+ monthly active users. It supports 11 blockchains and boasts a diverse range of products that include earn vaults, simple swaps, cross-chain swaps, and perpetual futures. The native token of WOOFi is WOO and it can be staked to share 80% of all protocol fees.",
		profileAvatarUrl: "https://storage.googleapis.com/op-atlas/d28891f9-e71b-432a-bc79-d47cad2193e4.png",
		projectCoverImageUrl: "https://storage.googleapis.com/op-atlas/dc1f0082-50e6-4980-af09-c76b71f26316.png",
		socialLinks: {
			twitter: "https://x.com/_WOOFi",
			farcaster: "https://warpcast.com/~/channel/woofi",
			mirror: "https://mirror.xyz/woofi.eth",
			website: "https://fi.woo.org/"
		},
		team: [
			"265664"
		],
		github: [
			"https://github.com/woonetwork/WooPoolV2",
			"https://github.com/woonetwork/WooStakingV2"
		],
		packages: [],
		links: [],
		contracts: [
			{
				address: "0x4c4AF8DBc524681930a27b2F1Af5bcC8062E6fB7",
				deploymentTxHash: "0x636d4731aabb472b14fa200e2faaf5a3873dc6c730d148667e292aacc5da8862",
				deployerAddress: "0xe86e40cD910bd7B36EEe4eac5D8968ec23aAc427",
				chainId: "10"
			},
			{
				address: "0x4c4AF8DBc524681930a27b2F1Af5bcC8062E6fB7",
				deploymentTxHash: "0xf96ac0b235e2b667469781e75e5a9c728e283d21016035a424d72243e0a9258b",
				deployerAddress: "0xe86e40cD910bd7B36EEe4eac5D8968ec23aAc427",
				chainId: "8453"
			},
			{
				address: "0xEd9e3f98bBed560e66B89AaC922E29D4596A9642",
				deploymentTxHash: "0xcfe8650ac14d875f6cd0675e7c409e003cdfef0825bfc4a5b889c5cdab8244a4",
				deployerAddress: "0x21380F2D8CEF342F07b043327581815a0CF670c8",
				chainId: "10"
			},
			{
				address: "0xEd9e3f98bBed560e66B89AaC922E29D4596A9642",
				deploymentTxHash: "0xca2cf5b8c01397aed20356bacf837556154413f447362728ec4e5005bd610131",
				deployerAddress: "0x21380F2D8CEF342F07b043327581815a0CF670c8",
				chainId: "8453"
			},
			{
				address: "0xB54e1d90d845d888d39dcaCBd54a3EEc0d8853B2",
				deploymentTxHash: "0x3356600ec565812e6200261910ea49283186f931f925051fd111047df054fbe4",
				deployerAddress: "0x97471c0fDDdb5E5Cc34cb08CB17961Bd3a53F38f",
				chainId: "10"
			},
			{
				address: "0xcA7184eA1cb4cF04d49Bf219c49a39231299dA26",
				deploymentTxHash: "0x5dd43bf8f519270503415620b65c09199c79dd83fecfa58b493daa10f67be00b",
				deployerAddress: "0x97471c0fDDdb5E5Cc34cb08CB17961Bd3a53F38f",
				chainId: "10"
			},
			{
				address: "0x18aa88bb25b8f15FDbE329f789dD000bf679753E",
				deploymentTxHash: "0x77f2e31594124d25d28df88d556bf058a2ab46bad86bb207788a6c2e62aa6ba7",
				deployerAddress: "0x97471c0fDDdb5E5Cc34cb08CB17961Bd3a53F38f",
				chainId: "10"
			},
			{
				address: "0x4E21a65A9F4672EF2cdfb7FA6B0f1e39d6e4E50e",
				deploymentTxHash: "0xe12bc839ce76ce9e254b73ba0b86387fb8bbcefaa88792b5c619ece6ce557494",
				deployerAddress: "0x7296fd0d4ea0492429C8D63c8aC33E5c87BDe4A2",
				chainId: "10"
			},
			{
				address: "0x44dF096D2600C6a6db77899dB3DE3AeCff746cb8",
				deploymentTxHash: "0x0969f175a8995e1023627dd7c1004da00b271bb1b7b5f98e663a24478e8132d4",
				deployerAddress: "0x97471c0fDDdb5E5Cc34cb08CB17961Bd3a53F38f",
				chainId: "8453"
			},
			{
				address: "0xb772122C4a37fe1754B46AB1799b909351e8Cb43",
				deploymentTxHash: "0xd7aac5ebde543b59bf6a83da097af1f52b65b6964d2b333f61be0333243b7e2f",
				deployerAddress: "0x97471c0fDDdb5E5Cc34cb08CB17961Bd3a53F38f",
				chainId: "8453"
			},
			{
				address: "0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13",
				deploymentTxHash: "0x93816248a3d4a4dfafecf1e9ed4c708de7222fe27073d191fc5bc4ad4dd6185e",
				deployerAddress: "0xA113d3B08df49D442fA1c0b47A82Ad95aD19c0Fb",
				chainId: "10"
			},
			{
				address: "0xCa10E8825FA9F1dB0651Cd48A9097997DBf7615d",
				deploymentTxHash: "0x52da0f1463332e0b4d7a9a551e2f6461eb1705a09b93f0fa1a05493dac7b9eb1",
				deployerAddress: "0x044764C4e03bd080f7400E255654002e2D751d45",
				chainId: "8453"
			},
			{
				address: "0xCa10E8825FA9F1dB0651Cd48A9097997DBf7615d",
				deploymentTxHash: "0xc81ca03157a56c1e96b56ef15ae0f98a3b2f35d2203f53f6865efcaa8c7a79a1",
				deployerAddress: "0x044764C4e03bd080f7400E255654002e2D751d45",
				chainId: "10"
			}
		],
		grantsAndFunding: {
			ventureFunding: [],
			grants: [],
			revenue: [
				{
					amount: "under-250k",
					details: "20% of all swap fees on Optimism and Base"
				}
			]
		}
	}
	return (
		<>
			<section className="flex-1 space-y-6">
				<Breadcrumb className="mb-6">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/ballot">Ballot</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/ballot/project">Project</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<ProjectDetails data={project} isPending={isPending} />
				<PageView title={'project-details'} />
				{/* <CategoryPagination id={id} /> */}
			</section>
			<aside>
				<ReviewSidebar />
			</aside>
			{/* <aside>
				<ProjectsSidebar
					id={id}
					{...category}
				/>
			</aside> */}
		</>
	);
}

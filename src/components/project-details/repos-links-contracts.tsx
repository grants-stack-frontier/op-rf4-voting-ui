import { ProjectContractsItem, ProjectGithubItem } from "@/__generated__/api/agora.schemas";
import { RiGithubFill, RiLink } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";
import { CustomAccordion } from "../custom-accordion";
import { Card, CardContent } from "../ui/card";
import { Heading } from "../ui/headings";

interface ReposLinksContractsProps {
  github?: ProjectGithubItem[];
  links?: string[];
  contracts?: ProjectContractsItem[];
}

export function ReposLinksContracts({ github, links, contracts }: ReposLinksContractsProps) {
  if (
    (!github || github.length === 0 || (github.length === 1 && github[0] === '')) &&
    (!links || links.length === 0) &&
    (!contracts || contracts.length === 0)
  ) return null;

  return (
    <div className="flex flex-col gap-2">
      <Heading className="text-sm font-medium leading-5" variant="h1">Repos, links and contracts</Heading>
      {github?.map((repo, index) => {
        const typedRepo = repo as { name: string, url: string, description: string };
        if (!typedRepo.description) {
          return (
            <Card className="shadow-none" key={index}>
              <CardContent className="px-2.5 py-3">
                <div className="flex items-center gap-2">
                  <RiGithubFill className="h-5 w-5" />
                  <Link className="text-sm font-medium leading-5 hover:underline" href={typedRepo.url} target="_blank">
                    {typedRepo.name || typedRepo.url}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        };
        return (
          <CustomAccordion
            key={index}
            value={typedRepo.name ?? ''}
            trigger={
              <div className="flex items-center gap-2">
                <RiGithubFill className="h-5 w-5" />
                <Link className="text-sm font-medium leading-5 hover:underline" href={typedRepo.url} target="_blank">
                  {typedRepo.name || typedRepo.url}
                </Link>
              </div>
            }
          >
            <div className="p-2">
              {typedRepo.description ?? 'No description'}
            </div>
          </CustomAccordion>
        );
      })}
      {links?.map((link: any, index) => {
        const typedLink = link as { name: string, url: string, description: string };
        if (!typedLink.description) {
          return (
            <Card className="shadow-none" key={index}>
              <CardContent className="px-2.5 py-3">
                <div className="flex items-center gap-2">
                  <RiLink className="h-5 w-5" />
                  <Link className="text-sm font-medium leading-5 hover:underline" href={typedLink.url} target="_blank">
                    {typedLink.name || typedLink.url}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        };
        return (
          <CustomAccordion
            key={index}
            value={typedLink.url ?? ''}
            trigger={
              <div className="flex items-center gap-2">
                <RiLink className="h-5 w-5" />
                <Link className="text-sm font-medium leading-5 hover:underline" href={typedLink.url} target="_blank">
                  {typedLink.name || typedLink.url}
                </Link>
              </div>
            }
          >
            <div className="p-2">
              {typedLink.description ?? 'No description'}
            </div>
          </CustomAccordion>
        );
      })}
      {contracts?.map((contract, index) => {
        return (
          <Card className="shadow-none" key={index}>
            <CardContent className="px-2.5 py-3">
              <div className="flex items-center gap-2">
                <Image src={Logo.src} alt="Logo" width={20} height={20} />
                <Link className="text-sm font-medium leading-5 hover:underline" href={`https://optimistic.etherscan.io/address/${contract.address}`} target="_blank">
                  {contract.address ?? 'No address'}
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
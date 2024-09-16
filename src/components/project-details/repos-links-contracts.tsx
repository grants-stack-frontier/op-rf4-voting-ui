import { ProjectContractsItem, ProjectGithubItem } from "@/__generated__/api/agora.schemas";
import { Github, Link2 } from "lucide-react";
import Image from "next/image";
import Logo from "../../../public/logo.png";
import { CustomAccordion } from "../custom-accordion";

interface ReposLinksContractsProps {
  github?: ProjectGithubItem[];
  links?: string[];
  contracts?: ProjectContractsItem[];
}

export function ReposLinksContracts({ github, links, contracts }: ReposLinksContractsProps) {
  if ((!github || github.length === 0) && (!links || links.length === 0) && (!contracts || contracts.length === 0)) return null;

  return (
    <>
      <p className="font-medium">Repos, links and contracts</p>
      {github?.map((repo, index) => {
        const typedRepo = repo as { name: string, url: string, description: string };
        return (
          <CustomAccordion
            key={index}
            value={typedRepo.name ?? ''}
            trigger={
              <div className="flex items-center gap-2 text-sm">
                <Github className="h-4 w-4" />
                {typedRepo.name ?? 'Unnamed Repository'}
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
        return (
          <CustomAccordion
            key={index}
            value={typedLink.url ?? ''}
            trigger={
              <div className="flex items-center gap-2 text-sm">
                <Link2 className="h-4 w-4 -rotate-45" />
                {typedLink.name ?? typedLink.url}
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
          <CustomAccordion
            key={index}
            value={contract.address ?? ''}
            trigger={
              <div className="flex items-center gap-2 text-sm">
                <Image src={Logo.src} alt="Logo" width={20} height={20} />
                {contract.address ?? 'No address'}
              </div>
            }
          />
        );
      })}
    </>
  );
}
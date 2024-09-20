import { Organization } from "@/__generated__/api/agora.schemas";
import { Heading } from "@/components/ui/headings";
import Image from "next/image";

export function ProjectHeader({ profileAvatarUrl, name, projectCoverImageUrl, organization }: { profileAvatarUrl?: string; name?: string; projectCoverImageUrl?: string; organization?: Organization }) {
  const { organizationAvatarUrl, name: orgName } = organization ?? {};
  return (
    <div className="flex flex-col gap-6">
      {projectCoverImageUrl && profileAvatarUrl ? (
        <div className="w-full h-56">
          <Image
            priority
            className="rounded-md w-full h-[180px] object-cover border border-gray-200 bg-white"
            src={projectCoverImageUrl}
            alt={name || ''}
            width={720}
            height={180}
          />
          <Image priority className="rounded-md -mt-10 ml-6 object-cover" src={profileAvatarUrl} alt={name || ''} width={80} height={80} />
        </div>
      ) : profileAvatarUrl && (
        <div className="w-full">
          <Image priority className="rounded-md object-cover" src={profileAvatarUrl} alt={name || ''} width={80} height={80} />
        </div>
      )}
      {name && (
        <Heading variant="h2">{name}</Heading>
      )}
      {organization && (
        <div className="flex items-center gap-2">
          <p className="font-medium">By</p>
          {organizationAvatarUrl && (
            <Image priority className="rounded-full" src={organizationAvatarUrl} alt={orgName || ''} width={30} height={30} />
          )}
          {orgName && (
            <p className="font-medium">{orgName}</p>
          )}
        </div>
      )}
    </div>
  );
}
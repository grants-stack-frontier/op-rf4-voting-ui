import { Heading } from "@/components/ui/headings";
import Image from "next/image";

export function ProjectHeader({ profileAvatarUrl, name, projectCoverImageUrl }: { profileAvatarUrl?: string; name?: string; projectCoverImageUrl?: string }) {
  return (
    <>
      {projectCoverImageUrl && profileAvatarUrl ? (
        <div className="w-full h-56">
          <Image
            className="rounded-md w-full h-[180px] object-cover"
            src={projectCoverImageUrl}
            alt={name || ''}
            width={720}
            height={180}
          />
          <Image className="rounded-md -mt-10 ml-6" src={profileAvatarUrl} alt={name || ''} width={80} height={80} />
        </div>
      ) : profileAvatarUrl && (
        <div className="w-full">
          <Image className="rounded-md" src={profileAvatarUrl} alt={name || ''} width={80} height={80} />
        </div>
      )}
      {name && (
        <Heading variant="h2">{name}</Heading>
      )}
      <div className="flex items-center gap-2">
        <p className="font-medium">By</p>
        {profileAvatarUrl && (
          <Image className="rounded-full" src={profileAvatarUrl} alt={name || ''} width={30} height={30} />
        )}
        {name && (
          <p className="font-medium">{name}</p>
        )}
      </div>
    </>
  );
}
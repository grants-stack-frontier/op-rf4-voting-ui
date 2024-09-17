import { SocialLinks } from "@/__generated__/api/agora.schemas";
import mixpanel from "@/lib/mixpanel";
import { Link2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Mirror from "../../../public/mirror.svg";
import Warpcast from "../../../public/warpcast.svg";
import X from "../../../public/x.svg";
// Helper function to safely parse and validate URLs
const getSafeUrl = (url: string | string[] | undefined): string => {
  if (typeof url === 'string') {
    try {
      return new URL(url).toString();
    } catch {
      return '#';
    }
  }
  if (Array.isArray(url) && url.length > 0) {
    try {
      return new URL(url[0]).toString();
    } catch {
      return '#';
    }
  }
  return '#';
};

export function SocialLinksList({ socialLinks }: { socialLinks?: SocialLinks }) {
  const { website, farcaster, twitter, mirror } = socialLinks ?? {};

  if (!website && !farcaster && !twitter && !mirror) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-4 my-6">
      {(website && (Array.isArray(website) && website?.length > 0)) && (
        <Link className="flex items-center gap-1.5 truncate max-w-[200px] text-sm lowercase" href={getSafeUrl(website)} target="_blank" onClick={() => mixpanel.track("Open Website", { external: true })}>
          <Link2 className="-rotate-45 h-4 w-4" />
          <span className="truncate max-w-[200px] text-sm lowercase">
            {typeof website === 'string' ? website : Array.isArray(website) ? website[0] : 'Website'}
          </span>
        </Link>
      )}
      {(farcaster && (Array.isArray(farcaster) && farcaster?.length > 0)) && (
        <Link className="flex items-center gap-1.5" href={getSafeUrl(farcaster)} target="_blank" onClick={() => mixpanel.track("Open Farcaster", { external: true })}>
          <Image src={Warpcast} alt="Farcaster" width={16} height={16} />
          <span className="truncate max-w-[200px] text-sm lowercase">
            {typeof farcaster === 'string' ? farcaster : Array.isArray(farcaster) ? farcaster[0] : 'Farcaster'}
          </span>
        </Link>
      )}
      {twitter && (
        <Link className="flex items-center gap-1.5 max-w-[200px] truncate text-sm lowercase" href={getSafeUrl(twitter)} target="_blank" onClick={() => mixpanel.track("Open Twitter", { external: true })}>
          <Image src={X} alt="Twitter" width={16} height={16} />
          <span className="truncate max-w-[200px] text-sm lowercase">
            {twitter}
          </span>
        </Link>
      )}
      {mirror && (
        <Link className="flex items-center gap-1.5 truncate max-w-[200px] text-sm lowercase" href={getSafeUrl(mirror)} target="_blank" onClick={() => mixpanel.track("Open Mirror", { external: true })}>
          <Image src={Mirror} alt="Mirror" width={16} height={16} />
          <span className="truncate max-w-[200px] text-sm lowercase">
            {mirror}
          </span>
        </Link>

      )}
    </div>
  );
}
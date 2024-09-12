import { SocialLinks } from "@/__generated__/api/agora.schemas";
import mixpanel from "@/lib/mixpanel";
import { Link2 } from "lucide-react";
import Link from "next/link";
import { Mirror } from "../common/mirror";
import { Warpcast } from "../common/warpcast";
import { X } from "../common/x";
import { Button } from "../ui/button";

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
    <div className="flex flex-wrap items-center gap-2">
      {website && (
        <Button
          variant="link"
          className="gap-1"
          onClick={() => mixpanel.track("Open Website", { external: true })}
          asChild
        >
          <Link2 className="-rotate-45 h-4 w-4" />
          <Link className="truncate max-w-[200px] text-sm" href={getSafeUrl(website)} target="_blank">
            {typeof website === 'string' ? website : Array.isArray(website) ? website[0] : 'Website'}
          </Link>
        </Button>
      )}
      {farcaster && (
        <Button
          variant="link"
          className="gap-1"
          onClick={() => mixpanel.track("Open Farcaster", { external: true })}
          asChild
        >
          <Warpcast />
          <Link className="truncate max-w-[200px] text-sm" href={getSafeUrl(farcaster)} target="_blank">
            {typeof farcaster === 'string' ? farcaster : Array.isArray(farcaster) ? farcaster[0] : 'Farcaster'}
          </Link>
        </Button>
      )}
      {twitter && (
        <Button
          variant="link"
          className="gap-1"
          onClick={() => mixpanel.track("Open Twitter", { external: true })}
          asChild
        >
          <X />
          <Link className="truncate max-w-[200px] text-sm" href={getSafeUrl(twitter)} target="_blank">
            {twitter}
          </Link>
        </Button>
      )}
      {mirror && (
        <Button
          variant="link"
          className="gap-1"
          onClick={() => mixpanel.track("Open Mirror", { external: true })}
          asChild
        >
          <Mirror />
          <Link className="truncate max-w-[200px] text-sm" href={getSafeUrl(mirror)} target="_blank">
            {mirror}
          </Link>
        </Button>
      )}
    </div>
  );
}
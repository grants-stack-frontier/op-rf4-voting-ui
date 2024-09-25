import { CategoryType, categoryNames } from '@/data/categories';
import { getBadgeClassName } from '@/utils/projectUtils';
import { AvatarCarousel } from '../common/avatar-carousel';
import { Badge } from '../ui/badge';

// Define a type for team members
export type TeamMember = {
  fid: number;
  object: 'user';
  pfp_url: string | null;
  profile: {
    bio: {
      text: string;
    };
  };
  username: string;
  power_badge: boolean;
  display_name: string;
  active_status: 'inactive' | 'active';
  verifications: string[];
  follower_count: number;
  custody_address: string;
  following_count: number;
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
};

export function CategoryAndTeam({
  category,
  team,
}: {
  category?: CategoryType;
  team?: TeamMember[];
}) {
  // Safely map over the team array, with additional checks
  const teamImages =
    team
      ?.filter(
        (member) =>
          member &&
          typeof member === 'object' &&
          'pfp_url' in member &&
          'display_name' in member &&
          member.pfp_url &&
          member.display_name
      )
      .map((member) => ({
        url: member.pfp_url as string,
        name: member.display_name,
      })) ?? [];

  return (
    <div className="flex items-center gap-4 mb-12">
      <Badge
        variant={null}
        className={`h-7 cursor-pointer border-0 font-medium text-sm leading-5 ${getBadgeClassName(category)}`}
      >
        {category ? categoryNames[category] : 'N/A'}
      </Badge>
      {teamImages && teamImages.length > 0 ? (
        <AvatarCarousel images={teamImages} />
      ) : (
        <span className="text-sm text-gray-500">No team members</span>
      )}
    </div>
  );
}

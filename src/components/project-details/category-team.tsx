import { CategoryType, categoryNames } from "@/data/categories";
import { getBadgeClassName } from "@/utils/projectUtils";
import { AvatarCarousel } from "../common/avatar-carousel";
import { Badge } from "../ui/badge";

export function CategoryAndTeam({ category, team }: { category?: CategoryType, team?: any[] }) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={null}
        className={`cursor-pointer border-0 font-medium ${getBadgeClassName(category)}`}
      >
        {category ? categoryNames[category] : 'N/A'}
      </Badge>
      <AvatarCarousel
        images={team?.map((member: any) => ({
          url: member.pfp_url,
          name: member.display_name
        })) ?? []}
      />
    </div>
  );
}
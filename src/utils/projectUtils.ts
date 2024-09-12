import { CategoryType } from "@/data/categories";

export function getBadgeClassName(category: CategoryType | undefined): string {
  switch (category) {
    case CategoryType.ETHEREUM_CORE_CONTRIBUTIONS:
      return 'bg-blue-500/25 text-blue-600';
    case CategoryType.OP_STACK_RESEARCH_AND_DEVELOPMENT:
      return 'bg-purple-500/25 text-purple-600';
    case CategoryType.OP_STACK_TOOLING:
      return 'bg-orange-500/25 text-orange-600';
    default:
      return 'bg-blue-500/25 text-blue-600';
  }
}
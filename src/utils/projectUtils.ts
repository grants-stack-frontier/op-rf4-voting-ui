import { CategoryType } from '@/data/categories';

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

export function formatProjectAge(years: number): string {
  if (years < 1) {
    const months = Math.round(years * 12);
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    return `${years.toFixed(1)} year${years !== 1 ? 's' : ''}`;
  }
}

export const getSafeUrl = (url: string | string[] | undefined): string => {
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

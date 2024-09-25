import { useSession } from './useAuth';

export function useVotingCategory() {
  const { data: session } = useSession();
  return session?.category;
}

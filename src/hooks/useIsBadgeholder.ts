import { useSession } from "./useAuth";

export function useIsBadgeholder() {
  const { data: session } = useSession();
  return Boolean(session?.isBadgeholder);
}

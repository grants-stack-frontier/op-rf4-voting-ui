import { getCategories } from '@/data/categories';
import { useQuery } from '@tanstack/react-query';

export function useCategories() {
	const query = useQuery({
		queryKey: ['categories'],
		queryFn: async () => {
			return getCategories();
		},
	});

	return query;
}

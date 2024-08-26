import {getCategories} from '@/data/categories';
import {useQuery} from '@tanstack/react-query';

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => getCategories()
    });
}

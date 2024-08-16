'use client';

import {useQuery} from '@tanstack/react-query';
import {getProjects} from "@/__generated__/api/agora";
import {getGetProjectsResponseMock} from "@/__generated__/api/agora.msw";

export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: async () => getProjects()
    });
}

export function useProjectsByCategory(categoryId: string) {
    const projects = getGetProjectsResponseMock()

    // TODO replace with actual API call when 401 error is resolved
    return useQuery({
        queryKey: ['projects-by-category', categoryId],
        queryFn: async () =>  getGetProjectsResponseMock()
    });

    // return useQuery({
    //     queryKey: ['projects-by-category', categoryId],
    //     queryFn: async () => getProjects().then(results => {
    //             console.log(results);
    //             results.data.projects?.filter(p => p.category === categoryId)
    //         }
    //     )
    // });
}

export function useProjectById(projectId: string) {
    return useQuery({
        queryKey: ['projects-by-id', projectId],
        queryFn: async () => getProjects().then(results => results.data.projects?.filter(p => p.id === projectId))
    });
}

import { getProjects as getProjectsFromApi} from "@/__generated__/api/agora";

export const getProjects = async () => {
  const res = await getProjectsFromApi();

  const { data } = res;

  return data;
}

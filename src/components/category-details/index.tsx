'use client';
import { Heading } from '@/components/ui/headings';
import { categories } from '@/data/categories';
import { useSession } from '@/hooks/useAuth';
import { useProjectsByCategory } from '@/hooks/useProjects';
import { CategoryId } from '@/types/shared';
import Image from 'next/image';
import { Markdown } from '../markdown';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

export function CategoryDetails({ id }: { id: CategoryId }) {
  const category = categories?.find((cat) => cat.id === id);
  const { data: projects, isPending } = useProjectsByCategory(id);
  const { name, image, description, eligibility, examples } = category ?? {};
  const { eligible_projects, not_eligible_projects } = eligibility ?? {};
  const { data: session } = useSession();

  const userCategory = session?.category;
  const isUserCategory =
    !!userCategory && !!category && userCategory === category.id;

  return (
    <section className="space-y-16">
      <div className="space-y-6">
        {isPending ? (
          <>
            <Skeleton className="w-96 h-8" />
            <div className="space-y-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-4/5 h-4" />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-6 mb-12">
              <Image
                className="rounded-md"
                src={image}
                alt={name || id}
                width={100}
                height={100}
              />
              <Heading variant="h2" className="leading-8">
                {name}
              </Heading>
              <Markdown className="dark:text-white">{description}</Markdown>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="h-7 cursor-pointer border-0 font-medium text-sm leading-5"
                >
                  {projects?.length} projects
                </Badge>
                {isUserCategory && (
                  <Badge
                    variant={null}
                    className="h-7 cursor-pointer border-0 bg-green-500/25 text-green-600 font-medium text-sm leading-5"
                  >
                    This is your voting category
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2 text-gray-700 dark:text-white">
              <Heading variant="h1">Examples:</Heading>
              <p>{examples?.join(', ')}</p>
            </div>
            <div className="flex flex-col items-start gap-6 text-gray-700 dark:text-white">
              <div className="flex items-start gap-2">
                <Heading variant="h1">Eligibility: </Heading>
                <p>The following types of projects are eligible.</p>
              </div>
              <ul className="list-disc ml-6">
                {eligible_projects?.map((project, index) => (
                  <li key={index}>{project}</li>
                ))}
              </ul>
              <div className="flex items-start gap-2">
                <Heading variant="h1">Not Eligible: </Heading>
                <p>The following types of projects are not eligible.</p>
              </div>
              <ul className="list-disc ml-6">
                {not_eligible_projects?.map((project, index) => (
                  <li key={index}>{project}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

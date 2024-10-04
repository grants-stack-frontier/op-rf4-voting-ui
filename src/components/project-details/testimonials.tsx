import { Heading } from '@/components/ui/headings';
import mixpanel from '@/lib/mixpanel';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';

export function Testimonials({
  testimonials,
}: {
  testimonials?: string[] | string;
}) {
  if (!testimonials) return null;

  return (
    <div className="flex flex-col gap-2 mt-12">
      <Heading className="text-sm font-medium leading-5" variant="h1">
        Testimonials
      </Heading>
      {Array.isArray(testimonials) ? (
        testimonials.map((testimonial, index) => (
          <Card className="shadow-none" key={index}>
            <CardContent className="py-2.5 px-3">
              <Link
                className="text-sm lowercase hover:underline flex items-center"
                href={testimonial}
                target="_blank"
                onClick={() =>
                  mixpanel.track('Open Testimonial', { external: true })
                }
              >
                <ExternalLink size={14} className="mr-2 flex-shrink-0" />
                <span className="truncate overflow-hidden">{testimonial}</span>
              </Link>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="shadow-none">
          <CardContent className="py-2.5 px-3">
            <Link
              className="text-sm lowercase hover:underline flex items-center"
              href={testimonials}
              target="_blank"
              onClick={() =>
                mixpanel.track('Open Testimonial', { external: true })
              }
            >
              <ExternalLink size={14} className="mr-2 flex-shrink-0" />
              <span className="truncate overflow-hidden">{testimonials}</span>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Heading } from '@/components/ui/headings';
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
                className="text-sm leading-5 hover:underline"
                href={testimonial}
                target="_blank"
              >
                {testimonial.toLowerCase()}
              </Link>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="shadow-none">
          <CardContent className="py-2.5 px-3">
            <Link
              className="text-sm leading-5 hover:underline"
              href={testimonials}
              target="_blank"
            >
              {testimonials.toLowerCase()}
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

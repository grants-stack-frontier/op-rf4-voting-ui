import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';

const components = {
  a: (p: ComponentProps<'a'>) => <a target="_blank" {...p} />,
  h1: (p: ComponentProps<'h1'>) => (
    <h1 className="text-2xl font-bold dark:text-gray-300" {...p} />
  ),
  h2: (p: ComponentProps<'h2'>) => (
    <h2 className="text-xl font-bold dark:text-gray-300" {...p} />
  ),
  strong: (p: ComponentProps<'strong'>) => (
    <strong className="font-bold dark:text-gray-300" {...p} />
  ),
};

export function Markdown({
  className,
  ...props
}: ComponentProps<typeof ReactMarkdown>) {
  return (
    <ReactMarkdown
      components={components}
      className={cn('prose', className)}
      {...props}
    />
  );
}

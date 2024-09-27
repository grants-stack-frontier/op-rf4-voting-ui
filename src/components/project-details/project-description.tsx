import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Markdown } from '../markdown';

export function ProjectDescription({ description }: { description?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        const lineHeight = parseInt(
          getComputedStyle(contentRef.current).lineHeight
        );
        const maxHeight = lineHeight * 3;
        setShowViewMore(contentRef.current.scrollHeight > maxHeight);
      }
    };

    checkHeight();
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, [description]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="my-6">
      <div
        ref={contentRef}
        className={cn('prose dark:prose-invert', !isExpanded && 'line-clamp-3')}
      >
        <Markdown>{description}</Markdown>
      </div>
      {showViewMore && (
        <Button
          variant="ghost"
          className="mt-2 p-0 h-auto font-normal"
          onClick={toggleExpand}
        >
          {isExpanded ? (
            <>
              View less <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              View more <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Markdown } from "../markdown";
import { Button } from "../ui/button";

export function ProjectDescription({ description }: { description?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClampable, setIsClampable] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkClampable = () => {
      if (descriptionRef.current) {
        const { scrollHeight, clientHeight } = descriptionRef.current;
        setIsClampable(scrollHeight > clientHeight);
      }
    };

    checkClampable();
    window.addEventListener('resize', checkClampable);
    return () => window.removeEventListener('resize', checkClampable);
  }, [description]);

  return (
    <div className="flex flex-col items-start my-6">
      <div
        ref={descriptionRef}
        className={`dark:text-white ${isExpanded ? 'line-clamp-none' : 'line-clamp-3'}`}
      >
        <Markdown>{description}</Markdown>
      </div>
      {isClampable && (
        <Button variant="link" className="p-0" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'view less' : 'view more'}
        </Button>
      )}
    </div>
  );
}
import { useState } from "react";
import { Markdown } from "../markdown";
import { Button } from "../ui/button";

export function ProjectDescription({ description }: { description?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col items-start">
      <Markdown className={`dark:text-white ${isExpanded ? 'line-clamp-none' : 'line-clamp-3'}`}>
        {description}
      </Markdown>
      <Button variant="link" className="p-0" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'view less' : 'view more'}
      </Button>
    </div>

  );
}
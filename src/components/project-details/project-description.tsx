import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

export function ProjectDescription({ description }: { description?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [truncatedText, setTruncatedText] = useState("");
  const [isClampable, setIsClampable] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!description) return;

    const processText = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const tempElement = document.createElement("div");
      tempElement.style.width = `${container.clientWidth}px`;
      tempElement.style.position = "absolute";
      tempElement.style.visibility = "hidden";
      tempElement.style.whiteSpace = "normal";
      document.body.appendChild(tempElement);

      const lineHeight = parseInt(
        window.getComputedStyle(tempElement).lineHeight
      );
      const maxHeight = lineHeight * 3;

      tempElement.textContent = description;
      if (tempElement.offsetHeight <= maxHeight) {
        setIsClampable(false);
        setTruncatedText(description);
      } else {
        setIsClampable(true);
        let low = 0;
        let high = description.length;
        let mid;
        let result = "";

        while (low <= high) {
          mid = Math.floor((low + high) / 2);
          tempElement.textContent =
            description.slice(0, mid) + " ... view more";

          if (tempElement.offsetHeight <= maxHeight) {
            result = description.slice(0, mid);
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }

        setTruncatedText(result);
      }

      document.body.removeChild(tempElement);
    };

    processText();
    window.addEventListener("resize", processText);
    return () => window.removeEventListener("resize", processText);
  }, [description]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className='my-6' ref={containerRef}>
      <div className='dark:text-white'>
        {isExpanded ? description : truncatedText}
        {isClampable && (
          <Button
            variant='link'
            className='p-0 align-baseline ml-1 text-[16px] h-[24px]'
            onClick={toggleExpand}
          >
            {isExpanded ? "... view less" : "... view more"}
          </Button>
        )}
      </div>
    </div>
  );
}

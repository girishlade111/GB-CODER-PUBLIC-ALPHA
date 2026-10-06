import React, { useMemo } from 'react';
import { getHighlightSegments } from '../../utils/consoleFilter';

export interface HighlightTextProps {
  text: string;
  query?: string;
  isRegex?: boolean;
  isCaseSensitive?: boolean;
  className?: string;
  matchClassName?: string;
}

/**
 * Renders text with search query matches highlighted.
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  query,
  isRegex = false,
  isCaseSensitive = false,
  className = '',
  matchClassName = 'bg-amber-400/35 text-amber-100 border-b border-amber-400 font-semibold px-0.5 rounded-[2px]',
}) => {
  const segments = useMemo(() => {
    if (!query || !query.trim() || !text) {
      return [{ text, isMatch: false }];
    }
    return getHighlightSegments(text, query, { isRegex, isCaseSensitive });
  }, [text, query, isRegex, isCaseSensitive]);

  if (!query || !query.trim() || segments.length === 1 && !segments[0].isMatch) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.isMatch ? (
          <mark key={index} className={matchClassName}>
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
};

export default HighlightText;

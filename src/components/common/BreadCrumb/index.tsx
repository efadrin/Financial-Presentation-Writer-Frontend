import React, { useCallback, useEffect, useRef, useState } from "react";
import { Item } from "./types";
import { BreadcrumbItem } from "./BreadcrumbItem";
import { OverflowGroupDivider } from "./OverflowGroupDivider";
import { OverflowMenu } from "./OverflowMenu";
import { useBreadcrumbStyles } from "./styles";

interface BreadcrumbWithOverflowProps {
  items: Item[];
}

export const BreadcrumbWithOverflow: React.FC<BreadcrumbWithOverflowProps> = ({
  items,
}) => {
  const styles = useBreadcrumbStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  const calculateVisibleItems = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    // Simple heuristic: if container is narrow, collapse more items
    if (containerWidth < 200) {
      setVisibleCount(Math.min(2, items.length));
    } else if (containerWidth < 400) {
      setVisibleCount(Math.min(3, items.length));
    } else {
      setVisibleCount(items.length);
    }
  }, [items.length]);

  useEffect(() => {
    calculateVisibleItems();
    const observer = new ResizeObserver(calculateVisibleItems);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [calculateVisibleItems]);

  const overflowItems = items.slice(0, items.length - visibleCount);
  const visibleItems = items.slice(items.length - visibleCount);

  // Always show at least the first and last items
  const showOverflow = overflowItems.length > 0;

  return (
    <div ref={containerRef} className={styles.root}>
      {/* First item is always visible */}
      {showOverflow && items.length > 0 && (
        <>
          <BreadcrumbItem item={items[0]} isCurrent={false} />
          <OverflowGroupDivider />
          <OverflowMenu items={overflowItems.slice(1)} />
          <OverflowGroupDivider />
        </>
      )}

      {/* Visible items */}
      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1;
        return (
          <React.Fragment key={item.key}>
            {!showOverflow && index > 0 && <OverflowGroupDivider />}
            <BreadcrumbItem item={item} isCurrent={isLast} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BreadcrumbWithOverflow;
export type { Item } from "./types";

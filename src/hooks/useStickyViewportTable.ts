'use client';

import { RefObject, useLayoutEffect, useState } from 'react';

export interface StickyViewportTableOptions {
  enabled?: boolean;
  boundarySelector?: string;
  bottomGap?: number;
  minHeight?: number;
}

export interface StickyViewportTableLayout {
  stickyTop: number;
  height?: number;
  pinned: boolean;
}

const isVisible = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0
  );
};

export default function useStickyViewportTable<T extends HTMLElement>(
  tableRef: RefObject<T | null>,
  {
    enabled = true,
    boundarySelector = '[data-table-top-boundary]',
    bottomGap = 8,
    minHeight = 160,
  }: StickyViewportTableOptions = {},
): StickyViewportTableLayout {
  const [layout, setLayout] = useState<StickyViewportTableLayout>({
    stickyTop: 0,
    height: undefined,
    pinned: false,
  });

  useLayoutEffect(() => {
    if (!enabled) {
      setLayout({
        stickyTop: 0,
        height: undefined,
        pinned: false,
      });

      return;
    }

    let animationFrame = 0;

    const getBoundaryElements = (): HTMLElement[] =>
      Array.from(document.querySelectorAll<HTMLElement>(boundarySelector));

    const measure = () => {
      cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(() => {
        const tableElement = tableRef.current;

        if (!tableElement) {
          return;
        }

        const visualViewport = window.visualViewport;

        const viewportBottom = visualViewport
          ? visualViewport.offsetTop + visualViewport.height
          : window.innerHeight;

        const visibleBoundaries = getBoundaryElements().filter(isVisible);

        const stickyTop = visibleBoundaries.reduce((maximumBottom, element) => {
          const rect = element.getBoundingClientRect();

          return Math.max(maximumBottom, Math.ceil(rect.bottom));
        }, 0);

        const availableHeight = Math.max(
          minHeight,
          Math.floor(viewportBottom - stickyTop - bottomGap),
        );

        const tableRect = tableElement.getBoundingClientRect();
        const pinned = tableRect.top <= stickyTop + 1;

        setLayout((previous) => {
          if (
            previous.stickyTop === stickyTop &&
            previous.height === availableHeight &&
            previous.pinned === pinned
          ) {
            return previous;
          }

          return {
            stickyTop,
            height: availableHeight,
            pinned,
          };
        });
      });
    };

    const resizeObserver = new ResizeObserver(measure);

    const tableElement = tableRef.current;

    if (tableElement) {
      resizeObserver.observe(tableElement);

      if (tableElement.parentElement) {
        resizeObserver.observe(tableElement.parentElement);
      }
    }

    getBoundaryElements().forEach((element) => {
      resizeObserver.observe(element);
    });

    /*
     * Capture mode detects scroll events from window and from a nested
     * dashboard scroll container.
     */
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);

    window.visualViewport?.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('scroll', measure);

    measure();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();

      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);

      window.visualViewport?.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('scroll', measure);
    };
  }, [boundarySelector, bottomGap, enabled, minHeight, tableRef]);

  return layout;
}

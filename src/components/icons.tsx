import type { SVGProps } from "react";

export const Icon = {
  search: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  bag: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  user: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  arrowL: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  ),
  arrowR: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  ),
  upRight: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  ),
  heart: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...p}>
      <path d="M12 21s-7-4.6-9.3-9C1 8.6 2.6 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.4 0 5 3.6 3.3 7C19 16.4 12 21 12 21Z" />
    </svg>
  ),
  heartO: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M12 20s-6.5-4.2-8.6-8.2C1.7 8.4 3.2 5.5 6 5.5c1.9 0 3.1 1.2 4 2.3.9-1.1 2.1-2.3 4-2.3 2.8 0 4.3 2.9 2.6 6.3C18.5 15.8 12 20 12 20Z" />
    </svg>
  ),
  x: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  chevD: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
};

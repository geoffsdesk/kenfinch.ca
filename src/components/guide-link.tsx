"use client";

/**
 * A clickable link that triggers the lead-capture popup instead of
 * linking directly to the PDF. Used in the footer and anywhere else
 * we want to gate the Seller's Guide behind email capture.
 */
export function GuideLink({ children, className }: { children: React.ReactNode; className?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('openLeadPopup'));
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}

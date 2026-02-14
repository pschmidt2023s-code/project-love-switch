/* ═══════════════════════════════════════════════════════════════════════════
   SKIP NAVIGATION - WCAG 2.2 AA
   Provides keyboard users a way to skip repetitive navigation
   ═══════════════════════════════════════════════════════════════════════════ */

export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="skip-nav"
    >
      Zum Hauptinhalt springen
    </a>
  );
}

export function MainContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <main id="main-content" tabIndex={-1} className={className} role="main">
      {children}
    </main>
  );
}

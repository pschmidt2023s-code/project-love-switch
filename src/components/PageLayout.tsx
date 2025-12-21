import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export function PageLayout({
  children,
  mainClassName = "container mx-auto px-4 py-24",
}: {
  children: ReactNode;
  mainClassName?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className={mainClassName}>{children}</main>
      <Footer />
    </div>
  );
}

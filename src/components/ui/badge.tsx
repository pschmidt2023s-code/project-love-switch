import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ALDENAIR BADGE COMPONENT
   Premium Design System - Sharp, Minimal, Luxury
   ═══════════════════════════════════════════════════════════════════════════ */

const badgeVariants = cva(
  [
    "inline-flex items-center",
    "px-3 py-1",
    "text-xs font-medium uppercase tracking-widest",
    "transition-colors duration-200",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-foreground bg-transparent",
        accent: "bg-accent text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        success: "bg-success text-success-foreground",
        warning: "bg-warning text-warning-foreground",
        muted: "bg-muted text-muted-foreground",
        ghost: "text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

import * as React from "react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ALDENAIR INPUT COMPONENT
   Premium Design System - Sharp, Minimal, Luxury
   ═══════════════════════════════════════════════════════════════════════════ */

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-12 w-full",
          "bg-transparent text-foreground",
          "border border-border",
          "px-4 py-3",
          "text-base",
          // Placeholder
          "placeholder:text-muted-foreground",
          // Focus
          "focus:outline-none focus:border-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Transitions
          "transition-colors duration-200",
          // File input
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
          // Mobile
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

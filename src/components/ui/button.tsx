import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ALDENAIR BUTTON COMPONENT
   Premium Design System - Sharp, Minimal, Luxury
   ═══════════════════════════════════════════════════════════════════════════ */

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "text-sm font-medium uppercase tracking-widest",
    "transition-all duration-200 ease-out",
    "ring-offset-background",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "whitespace-nowrap select-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary - Solid Black
        default: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
          "active:scale-[0.98]",
        ].join(" "),
        
        // Secondary - Outline
        secondary: [
          "bg-transparent text-foreground",
          "border border-foreground",
          "hover:bg-foreground hover:text-background",
        ].join(" "),
        
        // Ghost - No background
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-muted",
        ].join(" "),
        
        // Link - Underline on hover
        link: [
          "bg-transparent text-foreground",
          "underline-offset-4 hover:underline",
          "h-auto px-0 py-0 tracking-normal normal-case font-normal",
        ].join(" "),
        
        // Outline - Subtle border
        outline: [
          "bg-transparent text-foreground",
          "border border-border",
          "hover:border-foreground hover:bg-muted",
        ].join(" "),
        
        // Accent - Gold
        accent: [
          "bg-accent text-accent-foreground",
          "hover:bg-accent/90",
          "active:scale-[0.98]",
        ].join(" "),
        
        // Destructive
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90",
        ].join(" "),
        
        // Muted
        muted: [
          "bg-muted text-muted-foreground",
          "hover:bg-muted/80 hover:text-foreground",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6",
        lg: "h-12 px-8 text-sm",
        xl: "h-14 px-10 text-sm",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

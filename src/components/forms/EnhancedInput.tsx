import * as React from "react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ENHANCED INPUT COMPONENT
   Optimized for Apple devices, ProMotion displays, and smooth typing
   ═══════════════════════════════════════════════════════════════════════════ */

interface EnhancedInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            // Base styles
            "flex h-12 w-full",
            "bg-background text-foreground",
            "border",
            error ? "border-destructive" : "border-border",
            "px-4 py-3",
            "text-sm",
            // Placeholder
            "placeholder:text-muted-foreground",
            // Focus - optimized for smooth visual feedback
            "focus:outline-none focus:border-accent",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            // Smooth transitions optimized for ProMotion (120Hz)
            "transition-all duration-200 ease-out",
            // Optimize text rendering for Apple devices
            "antialiased",
            // Prevent zoom on iOS when font-size is < 16px
            "text-base md:text-sm",
            // Disable iOS default styling
            "appearance-none",
            "-webkit-appearance: none",
            // Optimize for smooth typing
            "[&::-webkit-input-placeholder]:transition-opacity [&::-webkit-input-placeholder]:duration-200",
            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
            className
          )}
          ref={ref}
          // Disable auto-zoom on iOS
          style={{
            fontSize: '16px',
            WebkitTextSizeAdjust: '100%',
            touchAction: 'manipulation',
          }}
          // Optimize for mobile typing
          autoComplete={props.autoComplete || "off"}
          autoCorrect={type === 'email' ? 'off' : props.autoCorrect}
          autoCapitalize={type === 'email' ? 'none' : props.autoCapitalize}
          spellCheck={type === 'email' || type === 'password' ? false : props.spellCheck}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);
EnhancedInput.displayName = "EnhancedInput";

/* ═══════════════════════════════════════════════════════════════════════════
   ENHANCED TEXTAREA COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

interface EnhancedTextareaProps extends React.ComponentProps<"textarea"> {
  label?: string;
  error?: string;
}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-[10px] tracking-[0.15em] uppercase text-muted-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            // Base styles
            "flex min-h-[120px] w-full",
            "bg-background text-foreground",
            "border",
            error ? "border-destructive" : "border-border",
            "px-4 py-3",
            "text-sm",
            // Placeholder
            "placeholder:text-muted-foreground",
            // Focus
            "focus:outline-none focus:border-accent",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            // Smooth transitions for ProMotion
            "transition-all duration-200 ease-out",
            // Text rendering
            "antialiased",
            // Font size for mobile (prevent zoom)
            "text-base md:text-sm",
            // Resize control
            "resize-none",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
            className
          )}
          ref={ref}
          style={{
            fontSize: '16px',
            WebkitTextSizeAdjust: '100%',
            touchAction: 'manipulation',
          }}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);
EnhancedTextarea.displayName = "EnhancedTextarea";

export { EnhancedInput, EnhancedTextarea };

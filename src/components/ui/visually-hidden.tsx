import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * VisuallyHidden component
 *
 * Renders content that is accessible to screen readers but visually hidden.
 * Follows WCAG best practices for hiding content visually while keeping it
 * in the accessibility tree.
 */
const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
      className
    )}
    style={{
      clip: "rect(0, 0, 0, 0)",
      clipPath: "inset(50%)",
    }}
    {...props}
  />
))
VisuallyHidden.displayName = "VisuallyHidden"

export { VisuallyHidden }

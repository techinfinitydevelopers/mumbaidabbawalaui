import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The stacked tiffin (dabba) glyph used across the Mumbai Dabbawala pages:
 * carry handle, lid, and two tiers. Solid fill, inherits `currentColor`.
 */
function DabbaIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-4", className)}
      {...props}
    >
      <path d="M7.75 6.4A4.25 4.25 0 0 1 16.25 6.4A0.75 0.75 0 0 1 14.75 6.4A2.75 2.75 0 0 0 9.25 6.4A0.75 0.75 0 0 1 7.75 6.4ZM5.8 6.2H18.2A1.2 1.2 0 0 1 19.4 7.4V8.2A1.2 1.2 0 0 1 18.2 9.4H5.8A1.2 1.2 0 0 1 4.6 8.2V7.4A1.2 1.2 0 0 1 5.8 6.2ZM6.8 10.3H17.2A1.1 1.1 0 0 1 18.3 11.4V13.7A1.1 1.1 0 0 1 17.2 14.8H6.8A1.1 1.1 0 0 1 5.7 13.7V11.4A1.1 1.1 0 0 1 6.8 10.3ZM6.8 15.6H17.2A1.1 1.1 0 0 1 18.3 16.7V19.1A1.1 1.1 0 0 1 17.2 20.2H6.8A1.1 1.1 0 0 1 5.7 19.1V16.7A1.1 1.1 0 0 1 6.8 15.6Z" />
    </svg>
  )
}

export { DabbaIcon }

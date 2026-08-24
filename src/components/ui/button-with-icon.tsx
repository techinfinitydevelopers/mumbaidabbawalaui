import * as React from "react"

import { Button } from "@/components/ui/button"
import { DabbaIcon } from "@/components/ui/dabba-icon"
import { cn } from "@/lib/utils"

type ButtonWithIconProps = React.ComponentProps<typeof Button> & {
  /** Glyph inside the chip. Defaults to the dabba. */
  icon?: React.ReactNode
}

/**
 * Pill CTA whose chip travels the full width on hover while the label's inline
 * padding swaps to match. The two paddings trade values, so the box never
 * changes size and nothing around it reflows — that is the whole trick, and the
 * reason `transition-all` on padding is safe here.
 *
 * Colours come from the brand tokens (--accent / --on-accent / --surface), not
 * shadcn's --primary, so this matches every other CTA on the site.
 */
function ButtonWithIcon({
  className,
  children,
  icon,
  ...props
}: ButtonWithIconProps) {
  return (
    <Button
      className={cn(
        "group relative h-12 rounded-full p-1 ps-6 pe-14 text-base font-medium",
        "bg-accent text-on-accent hover:bg-[#d4272c]",
        "focus-visible:border-accent focus-visible:ring-accent/40",
        "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:ps-14 hover:pe-6",
        className
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          // -translate-y-1/2 rather than top-1: the base button carries a 1px
          // transparent border, so a fixed top inset lands 1px low.
          "absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-full",
          "bg-surface text-accent",
          // 2.75rem = the 40px chip plus its 4px inset, so the gap it leaves on
          // the left matches the one it left on the right.
          "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "group-hover:right-[calc(100%-2.75rem)]"
        )}
      >
        {icon ?? <DabbaIcon />}
      </span>
    </Button>
  )
}

/** Same button rendered as an anchor, for in-page links like `#waitlist`. */
function LinkWithIcon({
  href,
  ...props
}: ButtonWithIconProps & { href: string }) {
  return <ButtonWithIcon render={<a href={href} />} {...props} />
}

export { ButtonWithIcon, LinkWithIcon }
export type { ButtonWithIconProps }

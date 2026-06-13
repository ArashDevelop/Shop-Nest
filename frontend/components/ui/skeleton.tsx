import * as React from "react"

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "media" | "circle"
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        variant === "media" && "rounded-none",
        variant === "circle" && "rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

function Spinner({
  className,
  size = "default",
}: {
  className?: string
  size?: "sm" | "default" | "lg" | "xl"
}) {
  const sizeClasses = {
    sm: "size-4",
    default: "size-6",
    lg: "size-8",
    xl: "size-12",
  }

  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
    />
  )
}

function PageLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Spinner size="xl" className="text-primary" />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  )
}

export { Spinner, PageLoader }

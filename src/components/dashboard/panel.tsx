import { cn } from "@/lib/utils"

interface PanelProps {
  children: React.ReactNode
  className?: string
}

export function Panel({ children, className }: PanelProps) {
  return <section className={cn("panel", className)}>{children}</section>
}

export function PanelHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <header className={cn("panel-header", className)}>{children}</header>
}

export function PanelBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("panel-body", className)}>{children}</div>
}

export function PanelTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2 className={cn("label-caps", className)}>{children}</h2>
  )
}

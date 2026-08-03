import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
      <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-2 rounded-2xl">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

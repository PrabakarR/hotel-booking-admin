"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  accent?: "primary" | "success" | "warning" | "danger";
  className?: string;
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
  warning: "bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
  danger: "bg-destructive/10 text-destructive",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  accent = "primary",
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className={cn("rounded-2xl border-border/80 shadow-none", className)}>
        <CardContent className="flex items-start justify-between gap-4 p-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className={cn("rounded-2xl p-2.5", accentMap[accent])}>
            <Icon className="size-5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

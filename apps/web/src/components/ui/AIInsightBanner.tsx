"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, X, AlertTriangle, CheckCircle2 } from "lucide-react";

type BannerVariant = "suggestion" | "warning" | "success";

interface AIInsightBannerProps {
    message: string;
    variant?: BannerVariant;
    action?: { label: string; onClick: () => void };
    dismissible?: boolean;
    className?: string;
}

const variantConfig: Record<
    BannerVariant,
    { icon: typeof Sparkles; borderColor: string; bgClass: string }
> = {
    suggestion: {
        icon: Sparkles,
        borderColor: "border-ai-glow/20",
        bgClass: "ai-insight",
    },
    warning: {
        icon: AlertTriangle,
        borderColor: "border-warning/20",
        bgClass:
            "bg-gradient-to-r from-warning/[0.06] to-warning/[0.02] border border-warning/15 rounded-2xl relative overflow-hidden",
    },
    success: {
        icon: CheckCircle2,
        borderColor: "border-success/20",
        bgClass:
            "bg-gradient-to-r from-success/[0.06] to-success/[0.02] border border-success/15 rounded-2xl relative overflow-hidden",
    },
};

export default function AIInsightBanner({
    message,
    variant = "suggestion",
    action,
    dismissible = true,
    className,
}: AIInsightBannerProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const { icon: Icon, bgClass } = variantConfig[variant];

    return (
        <div
            className={cn(bgClass, "p-4 animate-fade-in", className)}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <Icon
                        className={cn(
                            "w-4 h-4",
                            variant === "suggestion" && "text-ai-accent",
                            variant === "warning" && "text-warning",
                            variant === "success" && "text-success"
                        )}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-2 leading-relaxed">{message}</p>

                    {action && (
                        <button
                            onClick={action.onClick}
                            className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            {action.label} →
                        </button>
                    )}
                </div>

                {dismissible && (
                    <button
                        onClick={() => setDismissed(true)}
                        className="flex-shrink-0 text-text-3 hover:text-text-2 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { cn } from "@/lib/utils";

type StatusType = "online" | "offline" | "warning" | "error" | "busy";

interface StatusIndicatorProps {
    status: StatusType;
    label?: string;
    pulse?: boolean;
    size?: "sm" | "md";
    className?: string;
}

const statusConfig: Record<StatusType, { color: string; glow: string }> = {
    online: {
        color: "bg-success",
        glow: "shadow-[0_0_8px_rgba(34,197,94,0.4)]",
    },
    offline: {
        color: "bg-text-3",
        glow: "",
    },
    warning: {
        color: "bg-warning",
        glow: "shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    },
    error: {
        color: "bg-critical",
        glow: "shadow-[0_0_8px_rgba(239,68,68,0.4)]",
    },
    busy: {
        color: "bg-ai-accent",
        glow: "shadow-[0_0_8px_rgba(129,140,248,0.4)]",
    },
};

const sizeMap = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
};

export default function StatusIndicator({
    status,
    label,
    pulse = status === "online",
    size = "sm",
    className,
}: StatusIndicatorProps) {
    const { color, glow } = statusConfig[status];

    return (
        <span className={cn("inline-flex items-center gap-1.5", className)}>
            <span className="relative flex">
                {pulse && (
                    <span
                        className={cn(
                            "absolute inset-0 rounded-full animate-ping opacity-40",
                            color
                        )}
                    />
                )}
                <span
                    className={cn("rounded-full", sizeMap[size], color, glow)}
                />
            </span>
            {label && (
                <span className="text-xs text-text-3 font-medium">{label}</span>
            )}
        </span>
    );
}

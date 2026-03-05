"use client";

import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
    | "success"
    | "warning"
    | "critical"
    | "info"
    | "primary"
    | "neutral";

type BadgeSize = "sm" | "md";

interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    children: React.ReactNode;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    critical: "bg-critical/10 text-critical border-critical/20",
    info: "bg-info/10 text-info border-info/20",
    primary: "bg-primary/10 text-primary border-primary/20",
    neutral: "bg-white/[0.06] text-text-3 border-white/[0.06]",
};

const dotColors: Record<BadgeVariant, string> = {
    success: "bg-success",
    warning: "bg-warning",
    critical: "bg-critical",
    info: "bg-info",
    primary: "bg-primary",
    neutral: "bg-text-3",
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-0.5 gap-1.5",
};

export default function Badge({
    variant = "neutral",
    size = "sm",
    dot = false,
    children,
    className,
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center font-medium rounded-full border",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            {dot && (
                <span
                    className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
                />
            )}
            {children}
        </span>
    );
}

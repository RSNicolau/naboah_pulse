"use client";

import React from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "premium" | "metric";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant;
    glow?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
    default: "card",
    premium: "card-premium",
    metric: "card-metric",
};

export default function Card({
    variant = "default",
    glow = false,
    className,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                variantClasses[variant],
                "p-6",
                glow && "animate-pulse-glow",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

interface MetricCardProps {
    label: string;
    value: string | number;
    trend?: number;
    trendLabel?: string;
    icon?: LucideIcon;
    iconColor?: string;
    loading?: boolean;
    className?: string;
}

export default function MetricCard({
    label,
    value,
    trend,
    trendLabel,
    icon: Icon,
    iconColor = "text-primary",
    loading = false,
    className,
}: MetricCardProps) {
    if (loading) {
        return (
            <div className={cn("card-metric p-5", className)}>
                <div className="skeleton h-4 w-24 mb-3" />
                <div className="skeleton h-8 w-32 mb-2" />
                <div className="skeleton h-3 w-20" />
            </div>
        );
    }

    const TrendIcon =
        trend === undefined || trend === 0
            ? Minus
            : trend > 0
              ? TrendingUp
              : TrendingDown;

    const trendColor =
        trend === undefined || trend === 0
            ? "text-text-3"
            : trend > 0
              ? "text-success"
              : "text-critical";

    return (
        <div className={cn("card-metric p-5 group", className)}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-3 uppercase tracking-wider">
                    {label}
                </span>
                {Icon && (
                    <div
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            "bg-white/[0.04]",
                            iconColor
                        )}
                    >
                        <Icon className="w-4 h-4" />
                    </div>
                )}
            </div>

            <div className="text-2xl font-bold text-text-1 tracking-tight mb-1">
                {value}
            </div>

            {trend !== undefined && (
                <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
                    <TrendIcon className="w-3 h-3" />
                    <span className="font-medium">
                        {trend > 0 ? "+" : ""}
                        {trend.toFixed(1)}%
                    </span>
                    {trendLabel && (
                        <span className="text-text-3 ml-1">{trendLabel}</span>
                    )}
                </div>
            )}
        </div>
    );
}

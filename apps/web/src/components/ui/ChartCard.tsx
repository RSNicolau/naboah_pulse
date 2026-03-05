"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    loading?: boolean;
    className?: string;
    children: React.ReactNode;
}

export default function ChartCard({
    title,
    subtitle,
    action,
    loading = false,
    className,
    children,
}: ChartCardProps) {
    return (
        <div className={cn("card p-6", className)}>
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-text-1">{title}</h3>
                    {subtitle && (
                        <p className="text-xs text-text-3 mt-0.5">{subtitle}</p>
                    )}
                </div>
                {action}
            </div>

            {loading ? (
                <div className="space-y-3">
                    <div className="skeleton h-48 w-full rounded-xl" />
                </div>
            ) : (
                children
            )}
        </div>
    );
}

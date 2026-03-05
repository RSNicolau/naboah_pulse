"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, type LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: LucideIcon;
    iconRight?: LucideIcon;
    loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger:
        "bg-critical/10 text-critical border border-critical/20 rounded-xl font-semibold text-[13px] hover:bg-critical/20 transition-all cursor-pointer",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-[13px] gap-2",
    lg: "px-6 py-2.5 text-sm gap-2",
};

export default function Button({
    variant = "primary",
    size = "md",
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled,
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center",
                variantClasses[variant],
                sizeClasses[size],
                (disabled || loading) && "opacity-50 pointer-events-none",
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                Icon && <Icon className="w-4 h-4" />
            )}
            {children}
            {IconRight && !loading && <IconRight className="w-4 h-4" />}
        </button>
    );
}

"use client";

import React from "react";

interface BrandLogoProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export default function BrandLogo({ className = "", size = "md" }: BrandLogoProps) {
    const [error, setError] = React.useState(false);

    const sizeClasses = {
        sm: "h-7 w-auto",
        md: "h-9 w-auto",
        lg: "h-12 w-auto",
    };

    const fallbackSizeClasses = {
        sm: "h-7 w-7 text-xs",
        md: "h-9 w-9 text-lg",
        lg: "h-12 w-12 text-2xl",
    };

    if (error) {
        return (
            <div
                className={`${fallbackSizeClasses[size]} bg-brand-emerald rounded-lg flex items-center justify-center relative shadow-[0_0_15px_rgba(16,185,129,0.2)]`}
                suppressHydrationWarning
            >
                <span className="text-slate-950 font-black">Q</span>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-brand-emerald/10 blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img
                src="/logo.png"
                alt="Q.Labs Logo"
                className={`${sizeClasses[size]} object-contain relative z-10 brightness-110 ${className}`}
                suppressHydrationWarning
                onError={() => setError(true)}
            />
        </div>
    );
}

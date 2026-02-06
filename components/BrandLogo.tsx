"use client";

import React from "react";

interface BrandLogoProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export default function BrandLogo({ className = "", size = "md" }: BrandLogoProps) {
    const sizeClasses = {
        sm: "h-7 w-auto",
        md: "h-9 w-auto",
        lg: "h-12 w-auto",
    };

    return (
        <div className="relative flex items-center">
            <img
                src="/logo.png"
                alt="Logo"
                className={`${sizeClasses[size]} object-contain relative z-10 ${className}`}
                suppressHydrationWarning
            />
        </div>
    );
}

import * as React from 'react'
import { motion } from 'framer-motion'

import { twMerge } from 'tailwind-merge'

interface CircularProgressProps {
    progress: number // 0 to 100
    size?: number
    strokeWidth?: number
    children?: React.ReactNode
    className?: string
}

export function CircularProgress({
    progress,
    size = 280,
    strokeWidth = 12,
    children,
    className
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (progress / 100) * circumference

    return (
        <div className={twMerge("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            {/* Glow Effect behind */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl scale-90 animate-pulse" />

            <svg width={size} height={size} className="transform -rotate-90 drop-shadow-2xl">
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Indicator */}
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "linear" }}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" /> {/* Violet */}
                        <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan */}
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    )
}

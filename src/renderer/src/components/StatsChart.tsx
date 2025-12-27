import * as React from 'react'

interface DailyStats {
    screenTime: number // seconds
    breaksTaken: number
}

interface StatsChartProps {
    data: Record<string, DailyStats>
}

export function StatsChart({ data }: StatsChartProps) {
    const chartData = React.useMemo(() => {
        const days: { name: string; hours: number; breaks: number; key: string }[] = []
        const today = new Date()
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today.getTime())
            d.setDate(d.getDate() - i)
            // Adjust for timezone offset if needed, but local simplified:
            const key = d.toISOString().split('T')[0]
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
            const val = data[key] || { screenTime: 0, breaksTaken: 0 }
            days.push({ name: dayName, hours: val.screenTime / 3600, breaks: val.breaksTaken, key })
        }
        return days
    }, [data])

    const maxVal = Math.max(...chartData.map(d => d.hours), 1)

    return (
        <div className="h-48 w-full mt-4 flex items-end justify-between gap-2">
            {chartData.map((d) => (
                <div key={d.key} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                    <div className="relative w-full rounded-t-md bg-white/5 overflow-hidden transition-all group-hover:bg-cyan-500/20"
                        style={{ height: `${(d.hours / maxVal) * 100}%`, minHeight: '4px' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500 to-purple-500 opacity-80" />

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black/90 text-white text-xs p-2 rounded whitespace-nowrap z-50 border border-white/10 shadow-xl">
                            <div className="font-semibold mb-1">{d.name}</div>
                            <div>Focus: {d.hours.toFixed(1)}h</div>
                            <div>Breaks: {d.breaks}</div>
                        </div>
                    </div>
                    <span className="text-xs text-white/40">{d.name}</span>
                </div>
            ))}
        </div>
    )
}

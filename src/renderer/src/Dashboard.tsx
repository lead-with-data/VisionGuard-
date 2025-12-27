import * as React from 'react'
import { useEffect, useState } from 'react'
import { Settings as SettingsIcon, BarChart2, Home, SkipForward, Save } from 'lucide-react'
import { CircularProgress } from './components/CircularProgress'
import { StatsChart } from './components/StatsChart'
import { twMerge } from 'tailwind-merge'

type Tab = 'home' | 'stats' | 'settings'

export default function Dashboard(): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<Tab>('home')
    const [status, setStatus] = useState({ timeLeft: 20 * 60, isBreakActive: false, totalDuration: 20 * 60 })
    const [stats, setStats] = useState<any>({})
    const [settings, setSettings] = useState({ workDuration: 20, breakDuration: 20, isStrict: false, enableStartupNotification: true, startupMode: 'disabled' })

    // Settings form state
    const [tempSettings, setTempSettings] = useState(settings)

    useEffect(() => {
        // Listen for timer updates
        window.api.onTimerUpdate((newStatus) => setStatus(newStatus))

        // Initial fetches
        window.api.getStatus().then(setStatus)
        window.api.getStats().then(setStats)
        window.api.getSettings().then((s) => {
            setSettings(s as any)
            setTempSettings(s as any)
        })
    }, [])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const handleSaveSettings = async () => {
        await window.api.setSettings(tempSettings as any)
        setSettings(tempSettings)
        // maybe show toast
    }

    const progress = ((status.totalDuration - status.timeLeft) / status.totalDuration) * 100

    return (
        <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden selection:bg-cyan-500/30">
            {/* Ambient Backlights */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Sidebar */}
            <nav className="w-20 glass-panel border-r border-white/5 flex flex-col items-center py-8 z-10 backdrop-blur-xl bg-black/20">
                <div className="mb-12">
                    <img src="./electron.svg" className="w-8 h-8 opacity-80" />
                </div>

                <div className="flex flex-col gap-6 w-full px-4">
                    <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home />} label="Home" />
                    <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart2 />} label="Stats" />
                    <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon />} label="Settings" />
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-8 z-10 overflow-auto">

                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-white/90">
                        {activeTab === 'home' && 'Dashboard'}
                        {activeTab === 'stats' && 'Insights'}
                        {activeTab === 'settings' && 'Preferences'}
                    </h1>
                    <div className="text-sm font-light text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        v1.0.0
                    </div>
                </header>

                {activeTab === 'home' && (
                    <div className="flex flex-col items-center justify-center h-[80%] fade-in">
                        <CircularProgress progress={progress} size={320} strokeWidth={16}>
                            <div className="text-center">
                                <div className="text-6xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70">
                                    {formatTime(status.timeLeft)}
                                </div>
                                <div className="text-sm text-cyan-400 font-medium tracking-wide uppercase mt-2">
                                    {status.isBreakActive ? 'Relax Eyes' : 'Focus Time'}
                                </div>
                            </div>
                        </CircularProgress>

                        <div className="mt-12 flex gap-4">
                            {status.isBreakActive ? (
                                <button onClick={() => window.api.skipBreak()} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">
                                    <SkipForward size={20} /> Skip Break
                                </button>
                            ) : (
                                <div className="text-white/40 text-sm flex flex-col items-center gap-2">
                                    <p>Timer running automatically</p>
                                    <span className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-12 w-full max-w-2xl">
                            <StatCard label="Today's Screen Time" value={`${(stats[new Date().toISOString().split('T')[0]]?.screenTime / 3600 || 0).toFixed(1)}h`} />
                            <StatCard label="Breaks Taken" value={stats[new Date().toISOString().split('T')[0]]?.breaksTaken || 0} />
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="max-w-4xl mx-auto fade-in space-y-6">
                        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-black/20">
                            <h3 className="text-lg font-medium mb-6 text-white/80">Last 7 Days Activity</h3>
                            <StatsChart data={stats} />
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-2xl border border-white/5 bg-black/20">
                                <div className="text-white/40 text-sm mb-2">Total Breaks</div>
                                <div className="text-3xl font-bold">
                                    {Object.values(stats as Record<string, { breaksTaken: number }>).reduce((acc, curr) => acc + curr.breaksTaken, 0)}
                                </div>
                            </div>
                            <div className="glass-card p-6 rounded-2xl border border-white/5 bg-black/20">
                                <div className="text-white/40 text-sm mb-2">Avg Daily Focus</div>
                                <div className="text-3xl font-bold">2.4h</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto fade-in">
                        <div className="glass-card p-8 rounded-2xl border border-white/5 bg-black/20 space-y-8">

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-lg font-medium">Work Duration</label>
                                    <span className="text-cyan-400 font-mono bg-cyan-950/30 px-3 py-1 rounded-lg border border-cyan-500/20">
                                        {tempSettings.workDuration} min
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1" max="60"
                                    value={tempSettings.workDuration}
                                    onChange={(e) => setTempSettings({ ...tempSettings, workDuration: Number(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                                <p className="text-sm text-white/40">Time intervals between eye breaks.</p>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-lg font-medium">Break Duration</label>
                                    <span className="text-purple-400 font-mono bg-purple-950/30 px-3 py-1 rounded-lg border border-purple-500/20">
                                        {tempSettings.breakDuration} sec
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="5" max="60"
                                    value={tempSettings.breakDuration}
                                    onChange={(e) => setTempSettings({ ...tempSettings, breakDuration: Number(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                                <p className="text-sm text-white/40">Duration of the full-screen overlay.</p>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="flex justify-between items-center group cursor-pointer" onClick={() => setTempSettings({ ...tempSettings, enableStartupNotification: !tempSettings.enableStartupNotification })}>
                                <div>
                                    <label className="text-lg font-medium cursor-pointer">Enable Notifications</label>
                                    <p className="text-sm text-white/40">Smart alerts for startup, pre-break warnings, and completion.</p>
                                </div>
                                <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${tempSettings.enableStartupNotification ? 'bg-green-500' : 'bg-slate-700'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${tempSettings.enableStartupNotification ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="space-y-4">
                                <label className="text-lg font-medium">Startup Behavior</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setTempSettings({ ...tempSettings, startupMode: 'disabled' })}
                                        className={`p-4 rounded-xl border transition-all text-left group ${tempSettings.startupMode === 'disabled'
                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="font-medium mb-1 group-hover:text-white transition-colors">Disabled</div>
                                        <div className="text-xs opacity-70">Don't start automatically</div>
                                    </button>

                                    <button
                                        onClick={() => setTempSettings({ ...tempSettings, startupMode: 'auto' })}
                                        className={`p-4 rounded-xl border transition-all text-left group ${tempSettings.startupMode === 'auto'
                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="font-medium mb-1 group-hover:text-white transition-colors">Always Run</div>
                                        <div className="text-xs opacity-70">Start silently in background</div>
                                    </button>

                                    <button
                                        onClick={() => setTempSettings({ ...tempSettings, startupMode: 'prompt' })}
                                        className={`p-4 rounded-xl border transition-all text-left group ${tempSettings.startupMode === 'prompt'
                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="font-medium mb-1 group-hover:text-white transition-colors">Notify Me</div>
                                        <div className="text-xs opacity-70">Ask me before starting</div>
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSaveSettings}
                                    className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-900/20 active:scale-95 transition-all"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}

function NavButton({ active, icon, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={twMerge(
                "p-3 rounded-xl transition-all duration-300 group relative",
                active ? "text-cyan-400 bg-cyan-500/10" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
        >
            {icon}
            <span className="absolute left-14 bg-black/80 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 backdrop-blur-md">
                {label}
            </span>
        </button>
    )
}

function StatCard({ label, value }: any) {
    return (
        <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-white/40 text-sm mb-1">{label}</span>
            <span className="text-2xl font-semibold tracking-tight">{value}</span>
        </div>
    )
}

import { ElectronAPI } from '@electron-toolkit/preload'

interface TimerStatus {
  timeLeft: number
  isBreakActive: boolean
  totalDuration: number
}

interface Settings {
  workDuration: number
  breakDuration: number
  isStrict: boolean
  enableStartupNotification: boolean
}

interface DailyStats {
  screenTime: number
  breaksTaken: number
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onTimerUpdate: (callback: (status: TimerStatus) => void) => void
      skipBreak: () => void
      getStatus: () => Promise<TimerStatus>
      getSettings: () => Promise<Settings>
      setSettings: (settings: Settings) => Promise<boolean>
      getStats: () => Promise<Record<string, DailyStats>>
    }
  }
}

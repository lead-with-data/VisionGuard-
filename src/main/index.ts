// @ts-nocheck
import { app, shell, BrowserWindow, ipcMain, powerMonitor, Tray, Menu, screen, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Store = require('electron-store')

interface Settings {
  workDuration: number // minutes
  breakDuration: number // seconds
  isStrict: boolean
  enableStartupNotification: boolean
  startupMode: 'auto' | 'prompt' | 'disabled'
}

interface DailyStats {
  screenTime: number // seconds
  breaksTaken: number
}

interface StoreSchema {
  settings: Settings
  stats: Record<string, DailyStats> // key is YYYY-MM-DD
}

const store = new Store({
  defaults: {
    settings: {
      workDuration: 20,
      breakDuration: 20,
      isStrict: false,
      enableStartupNotification: true,
      startupMode: 'disabled'
    },
    stats: {}
  }
})

let dashboardWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null
let tray: Tray | null = null

// Timer State
let workDurationSeconds = store.get('settings.workDuration') * 60
let breakDurationSeconds = store.get('settings.breakDuration')
let timeLeft = workDurationSeconds
let isBreakActive = false
let timerInterval: NodeJS.Timeout | null = null

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

function updateStats(secondsToAdd: number, breakTaken: boolean = false): void {
  const today = getTodayKey()
  const currentStats = store.get(`stats.${today}`) || { screenTime: 0, breaksTaken: 0 }
  
  store.set(`stats.${today}`, {
    screenTime: currentStats.screenTime + secondsToAdd,
    breaksTaken: breakTaken ? currentStats.breaksTaken + 1 : currentStats.breaksTaken
  })
}

function showWelcomeNotification() {
    if (store.get('settings.enableStartupNotification')) {
        const notification = new Notification({
            title: 'VisionGuard Active',
            body: 'Your eye health companion is running in the background.',
            icon: icon
        })
        notification.show()
    }
}

function createDashboardWindow(): void {
  if (dashboardWindow) {
    dashboardWindow.focus()
    return
  }

  dashboardWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  dashboardWindow.on('ready-to-show', () => {
    dashboardWindow?.show()
  })

  dashboardWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  dashboardWindow.on('closed', () => {
    dashboardWindow = null
  })

  const dashboardUrl = process.env['ELECTRON_RENDERER_URL']
  if (is.dev && dashboardUrl) {
    dashboardWindow.loadURL(`${dashboardUrl}/#/dashboard`)
  } else {
    dashboardWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'dashboard' })
  }
}

function createOverlayWindow(): void {
  if (overlayWindow) return

  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.bounds

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: primaryDisplay.bounds.x,
    y: primaryDisplay.bounds.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    fullscreen: true,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  overlayWindow.setAlwaysOnTop(true, 'screen-saver')
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (is.dev && devUrl) {
    overlayWindow.loadURL(`${devUrl}/#/overlay`)
  } else {
    overlayWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'overlay' })
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null
  })
}

function startTimer(): void {
  if (timerInterval) clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    // Check idle
    const idleTime = powerMonitor.getSystemIdleTime()
    
    // If user is idle for more than 30 seconds, don't count screen time
    if (idleTime > 30) {
      return
    }

    if (!isBreakActive) {
       // Only track screen time when working
       updateStats(1, false)

       // Smart Notification: Warn 10 seconds before break
       if (timeLeft === 10 && store.get('settings.enableStartupNotification')) {
         new Notification({
           title: 'Break Coming Up',
           body: 'Prepare to look away in 10 seconds...',
           silent: true, // Don't play sound, just visual
           icon
         }).show()
       }
    }

    if (isBreakActive) {
      timeLeft--
      if (timeLeft <= 0) {
        endBreak()
      }
    } else {
      timeLeft--
      if (timeLeft <= 0) {
        startBreak()
      }
    }

    // Broadcast status to windows
    broadcastStatus()
  }, 1000)
}

function startBreak(): void {
  isBreakActive = true
  // Refresh settings in case they changed
  breakDurationSeconds = store.get('settings.breakDuration')
  timeLeft = breakDurationSeconds
  
  createOverlayWindow()
  if (overlayWindow) {
    overlayWindow.show()
    overlayWindow.focus()
  }
}

function endBreak(): void {
  if (isBreakActive) {
      updateStats(0, true)
      
      // Smart Notification: Break Complete
      if (store.get('settings.enableStartupNotification')) {
         new Notification({
           title: 'Break Complete',
           body: 'Great job! You can focus again now.',
           silent: true,
           icon
         }).show()
      }
  }

  isBreakActive = false
  // Refresh settings
  workDurationSeconds = store.get('settings.workDuration') * 60
  timeLeft = workDurationSeconds
  
  if (overlayWindow) {
    overlayWindow.close()
    overlayWindow = null
  }
  broadcastStatus()
}

function broadcastStatus(): void {
  const currentTotal = isBreakActive ? breakDurationSeconds : workDurationSeconds
  const status = {
    timeLeft,
    isBreakActive,
    totalDuration: currentTotal
  }
  
  if (dashboardWindow && !dashboardWindow.isDestroyed()) {
    dashboardWindow.webContents.send('timer-update', status)
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('timer-update', status)
  }
}

function updateStartupSettings(mode: string) {
    const isEnabled = mode === 'auto' || mode === 'prompt'
    app.setLoginItemSettings({
        openAtLogin: isEnabled,
        path: app.getPath('exe'),
        args: ['--startup']
    })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.visionguard.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize values
  workDurationSeconds = store.get('settings.workDuration') * 60
  breakDurationSeconds = store.get('settings.breakDuration')
  timeLeft = workDurationSeconds

  // Check Startup Mode
  const isStartup = process.argv.includes('--startup')
  const startupMode = store.get('settings.startupMode')
  
  // Tray is always good to have
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Dashboard', click: createDashboardWindow },
    { type: 'separator' },
    { label: 'Skip Break', click: endBreak },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ])
  tray.setToolTip('VisionGuard')
  tray.setContextMenu(contextMenu)

  // Logic for Startup
  if (isStartup && startupMode === 'prompt') {
      // User wants a notification confirmation
      const notification = new Notification({
          title: 'VisionGuard Ready',
          body: 'Do you want to start your eye protection session?',
          actions: [{ type: 'button', text: 'Start Session' }],
          closeButtonText: 'Not Now',
          icon
      })

      notification.on('action', (_, __) => {
          createDashboardWindow()
          startTimer()
          showWelcomeNotification()
      })

      // If they click the body (not the button), also open? Usually yes.
      notification.on('click', () => {
          createDashboardWindow()
          startTimer()
      })

      notification.show()
  } else if (isStartup && startupMode === 'disabled') {
      // Should shouldn't happen if registry is clean, but safe exit
      app.quit()
      return
  } else {
      // 'auto' or manual launch
      createDashboardWindow()
      startTimer()
      if (isStartup) showWelcomeNotification()
  }

  // Track system resume
  powerMonitor.on('resume', () => {
    // When device opens / wakes up
    showWelcomeNotification()
  })

  // IPC Handlers
  ipcMain.handle('get-status', () => ({
    timeLeft,
    isBreakActive,
    totalDuration: isBreakActive ? breakDurationSeconds : workDurationSeconds
  }))

  ipcMain.on('skip-break', () => {
    endBreak()
  })

  // Settings & Stats Handlers
  ipcMain.handle('get-settings', () => store.get('settings'))
  ipcMain.handle('set-settings', (_, newSettings) => {
    const oldSettings = store.get('settings')
    store.set('settings', newSettings)
    
    // Check if startup mode changed
    if (newSettings.startupMode !== oldSettings.startupMode) {
        updateStartupSettings(newSettings.startupMode)
    }

    // Update local variables immediately
    workDurationSeconds = newSettings.workDuration * 60
    breakDurationSeconds = newSettings.breakDuration
    
    // Immediate application logic:
    if (!isBreakActive) {
        if (timeLeft > workDurationSeconds) {
            timeLeft = workDurationSeconds
        }
        broadcastStatus()
    }
    return true
  })

  ipcMain.handle('get-stats', () => store.get('stats'))

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createDashboardWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
     // app.quit() 
  }
})

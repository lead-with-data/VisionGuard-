import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  onTimerUpdate: (callback: (status: any) => void) => {
    ipcRenderer.on('timer-update', (_event, status) => callback(status))
  },
  skipBreak: () => ipcRenderer.send('skip-break'),
  getStatus: () => ipcRenderer.invoke('get-status'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: any) => ipcRenderer.invoke('set-settings', settings),
  getStats: () => ipcRenderer.invoke('get-stats')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

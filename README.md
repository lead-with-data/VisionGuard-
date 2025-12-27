# VisionGuard 👁️

**VisionGuard** is a premium, high-performance eye strain reduction tool designed for modern professionals. Built with Electron, React, and TypeScript, it enforces the **20-20-20 rule** (every 20 minutes, look at something 20 feet away for 20 seconds) with a stunning, non-intrusive "Inspirational" interface.

![VisionGuard Screenshot](https://via.placeholder.com/800x450.png?text=VisionGuard+Dashboard)

## ✨ Key Features

*   **Premium Aesthetics**:
    *   **Glassmorphic Design**: A sleek, translucent dashboard that feels native to modern OS environments.
    *   **Inspirational Overlay**: A full-screen, transparent overlay with "Siri-like" soft edge gradients (Cyan, Purple, Emerald, Blue) that gently reminds you to take a break without jarring you.
    *   **Smooth Animations**: Powered by Framer Motion for liquid-smooth transitions.

*   **Smart Protection**:
    *   **20-20-20 Rule Enforcement**: Automatically triggers breaks based on configurable schedules.
    *   **Smart Idle Detection**: Pauses the timer when you step away from your computer, ensuring you aren't interrupted unnecessarily.
    *   **Smart Notifications**: Get subtle "10-second warnings" before a break starts and "Break Complete" alerts when it's time to focus again.
    *   **System Awareness**: Welcomes you back with a notification when your device wakes from sleep.

*   **Insights & Analytics**:
    *   **Real-Time Tracking**: Visualize your focus sessions with a beautiful circular progress timer.
    *   **Historical Data**: Track your daily "Screen Time" and "Breaks Taken" with interactive charts.
    *   **Persistence**: Your stats and settings are saved locally and securely.

*   **Customization**:
    *   **Strict Mode**: (Coming Soon) Force breaks for maximum health enforcement.
    *   **Configurable Timers**: Adjust Work Duration and Break Duration instantly.
    *   **Startup Behavior**: Choose how the app starts—run silently in the background, ask for permission via notification, or disable auto-start entirely.
    *   **Instant Updates**: Settings apply immediately without restarting the app.

## 🚀 Installation & Usage

### Windows (Installer)
1.  Run the installer (e.g., `VisionGuard Setup 1.0.0.exe`) found in the `dist` folder.
2.  The app will install and open automatically.
3.  **Startup Configuration**: Go to **Settings** -> **Startup Behavior** to configure the app to run automatically on login (Silent or Notification mode).
4.  The app lives in your **System Tray**. Right-click the tray icon to access the Dashboard or Quit.

### Development Setup

Prerequisites:
*   Node.js (v18+)
*   npm or yarn

```bash
# Clone the repository
git clone https://github.com/yourusername/vision-guard.git

# Install dependencies
npm install

# Run in Development Mode
npm run dev
```

## 🛠️ Tech Stack

*   **Core**: [Electron](https://www.electronjs.org/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/) (High-performance tooling)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first styling)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **Persistence**: [electron-store](https://github.com/sindresorhus/electron-store)

## 🎨 Design Philosophy

VisionGuard refuses to be "just another utility." It is designed to be **seen**. The overlay uses a calculated blend of:
*   `radial-gradient` with low opacity to create a "dreamy" atmosphere.
*   `backdrop-filter: blur` to soften the digital noise of your work underneath.
*   Large, bold typography (8rem+) to make the break feel like a significant, intentional pause.

## 📄 License

MIT License. Copyright (c) 2025 VisionGuard Team.

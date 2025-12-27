import * as React from 'react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Overlay(): React.JSX.Element {
    const [timeLeft, setTimeLeft] = useState(20)

    useEffect(() => {
        // Listen for updates
        window.api.onTimerUpdate((status) => {
            setTimeLeft(status.timeLeft)
            // Check if break ended? Main process closes window, so maybe not needed.
        })

        // Initial fetch
        window.api.getStatus().then((status) => setTimeLeft(status.timeLeft))
    }, [])

    return (
        <div className="overlay-container">
            {/* Siri Glow Animation */}
            <motion.div
                className="siri-glow-bg"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <div style={{ zIndex: 30, textAlign: 'center', width: '100%' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1
                        className="font-bold tracking-tighter text-white"
                        style={{
                            fontSize: '8rem',
                            lineHeight: '1',
                            textShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            transform: 'rotate(-2deg)' /* Slight tilt for "design" feel */
                        }}
                    >
                        Look away
                    </h1>
                    <motion.div
                        className="text-white/80 font-mono"
                        style={{ fontSize: '4rem', marginTop: '-1rem', transform: 'rotate(-2deg)' }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        — {timeLeft}s
                    </motion.div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/60 mt-8 font-light tracking-wide uppercase"
                    style={{ letterSpacing: '0.2em' }}
                >
                    Focus on something 20 feet away
                </motion.p>
            </div>
        </div>
    )
}

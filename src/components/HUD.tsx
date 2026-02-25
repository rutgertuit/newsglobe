'use client';

import { useWarStore } from '@/store/useWarStore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Decrypting Text Hook
function useDecryptText(text: string, speed = 30) {
    const [displayText, setDisplayText] = useState(text);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';

    useEffect(() => {
        let iteration = 0;
        let interval: any;

        interval = setInterval(() => {
            setDisplayText(text.split('').map((letter, index) => {
                if (index < iteration) {
                    return text[index];
                }
                if (text[index] === ' ') return ' ';
                return chars[Math.floor(Math.random() * chars.length)];
            }).join(''));

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1;
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return displayText;
}

const DefIntelStream = () => {
    const threats = useWarStore((state) => state.threats);
    const activeTheme = useWarStore((state) => state.activeTheme);
    const filteredThreats = threats.filter(t => activeTheme === 'ALL' || t.theme === activeTheme);

    const streamStyle = {
        position: 'absolute' as const,
        top: '40px',
        right: '40px',
        width: '380px',
        padding: '16px',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(5, 5, 5, 0.8)',
        pointerEvents: 'auto' as const,
        fontFamily: "'Share Tech Mono', monospace",
        textTransform: 'uppercase' as const,
        fontSize: '13px',
        zIndex: 50,
    };

    const headerStyle = {
        color: 'var(--electric-cyan)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '8px',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    const dotStyle = {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'var(--alert-red)'
    };

    const listStyle = {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
        maxHeight: '60vh',
        overflowY: 'auto' as const,
    };

    return (
        <div style={streamStyle}>
            <div style={headerStyle}>
                <span>[ TOP SECRET // CODE: UMBRA ]</span>
                <span className="animate-pulse-ring" style={dotStyle}></span>
            </div>
            <div style={listStyle} className="no-scrollbar">
                {filteredThreats.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Monitoring global traffic...</p>}
                {filteredThreats.map((t, i) => (
                    <IntelItem key={t.id + i} text={t.headline} time={t.timestamp} alert={t.intensity > 5} url={t.url} />
                ))}
            </div>
        </div>
    );
};

const IntelItem = ({ text, time, alert, url }: { text: string; time: string; alert: boolean; url?: string }) => {
    const decrypted = useDecryptText(text, 30);
    const [isHovered, setIsHovered] = useState(false);

    const itemStyle = {
        borderLeft: `2px solid ${alert ? 'var(--alert-red)' : 'var(--terminal-green)'}`,
        padding: '10px 14px',
        color: alert ? 'var(--alert-red)' : 'var(--terminal-green)',
        cursor: url ? 'pointer' : 'default',
        backgroundColor: isHovered && url ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        transition: 'background-color 0.2s ease',
        lineHeight: 1.4,
    };

    const timeStyle = {
        fontSize: '11px',
        color: 'var(--text-muted)',
        marginBottom: '6px',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={itemStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => url && window.open(url, '_blank')}
            className={alert ? 'text-glitch' : ''}
            title={url ? "Click to view source" : ""}
        >
            <div style={timeStyle}>
                {new Date(time).toISOString().split('T')[1].substring(0, 8)}Z
                {url && <span style={{ marginLeft: '8px', color: 'var(--electric-cyan)', fontWeight: 'bold' }}>[ VIEW LINK ]</span>}
            </div>
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{decrypted}</div>
        </motion.div>
    );
};

const BloodMoneyTicker = () => {
    const marketData = useWarStore((state) => state.marketData);

    const containerStyle = {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        width: '100%',
        height: '48px',
        backgroundColor: '#111111',
        borderTop: '1px solid var(--alert-red)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'auto' as const,
        fontFamily: "'Share Tech Mono', monospace",
        zIndex: 50,
    };

    const itemStyle = {
        margin: '0 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
    };

    return (
        <div style={containerStyle}>
            <div className="animate-marquee" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                {[...marketData, ...marketData, ...marketData].map((data, i) => (
                    <div key={i} style={itemStyle}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{data.symbol}</span>
                        <span style={{ color: 'var(--text-muted)' }}>${Number(data.price).toFixed(2)}</span>
                        <span style={{ color: data.trend === 'up' ? 'var(--terminal-green)' : 'var(--alert-red)' }}>
                            {data.trend === 'up' ? '▲' : '▼'} {Number(data.change).toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Header = () => (
    <div style={{ position: 'absolute', top: '40px', left: '40px', pointerEvents: 'none', color: 'var(--text-primary)', fontFamily: "'Share Tech Mono', monospace", zIndex: 50 }}>
        <h1 style={{ letterSpacing: '0.2em', fontSize: '32px', fontWeight: 'bold' }}>DIGITAL <span style={{ color: 'var(--alert-red)' }}>WAR</span> ROOM</h1>
        <h2 style={{ fontSize: '14px', color: 'var(--electric-cyan)', marginTop: '4px', opacity: 0.8, textTransform: 'uppercase' }}>The Eye of Providence // Global Subnet Monitor</h2>
    </div>
);

const FilterBar = () => {
    const activeTheme = useWarStore((state) => state.activeTheme);
    const setActiveTheme = useWarStore((state) => state.setActiveTheme);

    const themes = ['ALL', 'KINETIC', 'CYBER', 'POLITICS', 'OTHER'];

    const barStyle = {
        position: 'absolute' as const,
        top: '120px',
        left: '40px',
        display: 'flex',
        gap: '4px',
        pointerEvents: 'auto' as const,
        zIndex: 50,
        fontFamily: "'Share Tech Mono', monospace",
    };

    const getBtnStyle = (theme: string) => ({
        padding: '6px 12px',
        backgroundColor: activeTheme === theme ? 'var(--electric-cyan)' : 'transparent',
        color: activeTheme === theme ? 'var(--bg-void)' : 'var(--text-muted)',
        border: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
        transition: 'all 0.2s',
        textTransform: 'uppercase' as const,
    });

    return (
        <div style={barStyle}>
            {themes.map(theme => (
                <button
                    key={theme}
                    style={getBtnStyle(theme)}
                    onClick={() => setActiveTheme(theme)}
                >
                    [{theme}]
                </button>
            ))}
        </div>
    );
};

export default function HUD() {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 20, pointerEvents: 'none', overflow: 'hidden' }}>
            <div className="scanlines"></div>
            <div className="vignette"></div>
            <Header />
            <FilterBar />
            <DefIntelStream />
            <BloodMoneyTicker />
        </div>
    );
}

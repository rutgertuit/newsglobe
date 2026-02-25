'use client';

import { useWarStore } from '@/store/useWarStore';
import { useEffect, useRef } from 'react';

// Handles fetching data periodically and parsing critical audio
export default function CommandCenter() {
    const setThreats = useWarStore((state) => state.setThreats);
    const setMarketData = useWarStore((state) => state.setMarketData);
    const threats = useWarStore((state) => state.threats);

    const audioContext = useRef<AudioContext | null>(null);
    const isPlayingTTS = useRef<boolean>(false);
    const previouslyAnnounced = useRef<Set<string>>(new Set());

    useEffect(() => {
        let threatInterval: NodeJS.Timeout;
        let marketInterval: NodeJS.Timeout;

        // A low drone hum background audio
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioContext.current.createOscillator();
            const gain = audioContext.current.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(45, audioContext.current.currentTime);
            gain.gain.setValueAtTime(0.05, audioContext.current.currentTime);

            osc.connect(gain);
            gain.connect(audioContext.current.destination);
            osc.start();
        }

        const fetchThreatsData = async () => {
            try {
                const res = await fetch('/api/threats');
                const data = await res.json();

                if (Array.isArray(data)) {
                    // Populate the entire 30-day batch at once for the heatmap and feed
                    setThreats(data);
                }
            } catch (err) {
                console.error('Failed to parse incoming intel:', err);
            }
        };

        const playVoiceAlert = async (text: string) => {
            if (isPlayingTTS.current) return; // Prevent overlapping spam

            isPlayingTTS.current = true;
            try {
                const res = await fetch('/api/synth', {
                    method: 'POST',
                    body: JSON.stringify({ text: `Waarschuwing: ${text}` })
                });

                if (res.ok) {
                    const arrayBuffer = await res.arrayBuffer();
                    if (audioContext.current) {
                        const buffer = await audioContext.current.decodeAudioData(arrayBuffer);
                        const source = audioContext.current.createBufferSource();
                        source.buffer = buffer;
                        source.connect(audioContext.current.destination);

                        source.onended = () => {
                            // Enforce a minimum 10-second silence gap after a voice finishes
                            setTimeout(() => {
                                isPlayingTTS.current = false;
                            }, 10000);
                        };

                        source.start(0);
                    } else {
                        isPlayingTTS.current = false;
                    }
                } else {
                    isPlayingTTS.current = false;
                }
            } catch (err) {
                console.error('TTS failed:', err);
                isPlayingTTS.current = false;
            }
        };

        const fetchMarketData = async () => {
            try {
                const res = await fetch('/api/market');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMarketData(data);
                }
            } catch (err) {
                console.error('Failed to parse incoming market data:', err);
            }
        };

        // Fetch once on mount
        fetchThreatsData();
        fetchMarketData();

        // Refresh data every 5 minutes
        threatInterval = setInterval(fetchThreatsData, 300000);
        marketInterval = setInterval(fetchMarketData, 60000);

        return () => {
            clearInterval(threatInterval);
            clearInterval(marketInterval);
        };
    }, [setThreats, setMarketData]);

    // Separate effect to handle staggered text-to-speech
    useEffect(() => {
        if (!threats || threats.length === 0) return;

        // Pick high intensity threats to announce
        const highIntensity = threats.filter(t => t.intensity > 4 && !previouslyAnnounced.current.has(t.id));

        if (highIntensity.length > 0 && !isPlayingTTS.current) {
            const nextAnnounce = highIntensity[Math.floor(Math.random() * highIntensity.length)];
            previouslyAnnounced.current.add(nextAnnounce.id);

            const doAnnounce = async () => {
                if (isPlayingTTS.current) return;
                isPlayingTTS.current = true;

                try {
                    const res = await fetch('/api/synth', {
                        method: 'POST',
                        body: JSON.stringify({ text: `Waarschuwing: ${nextAnnounce.headline}` })
                    });
                    if (res.ok) {
                        const arrayBuffer = await res.arrayBuffer();
                        if (audioContext.current) {
                            const buffer = await audioContext.current.decodeAudioData(arrayBuffer);
                            const source = audioContext.current.createBufferSource();
                            source.buffer = buffer;
                            source.connect(audioContext.current.destination);

                            source.onended = () => {
                                setTimeout(() => { isPlayingTTS.current = false; }, 15000); // 15 sec cooldown
                            };
                            source.start(0);
                        } else { isPlayingTTS.current = false; }
                    } else { isPlayingTTS.current = false; }
                } catch (e) {
                    isPlayingTTS.current = false;
                }
            };

            doAnnounce();
        }

    }, [threats]);

    return null;
}

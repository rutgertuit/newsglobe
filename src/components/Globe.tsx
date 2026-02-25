'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';
import { useWarStore } from '@/store/useWarStore';

export default function Globe() {
    const [countries, setCountries] = useState<any>(null);
    const threats = useWarStore((state) => state.threats);
    const activeTheme = useWarStore((state) => state.activeTheme);
    const globeInstance = useRef<any>(null);

    // Initialize the ThreeGlobe instance once
    if (!globeInstance.current) {
        globeInstance.current = new ThreeGlobe();
    }

    useEffect(() => {
        // Load GeoJSON data
        fetch('/datasets/countries.geojson')
            .then((res) => res.json())
            .then((data) => {
                setCountries(data);
            });
    }, []);

    useEffect(() => {
        if (countries && globeInstance.current) {
            globeInstance.current
                .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
                .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
                .polygonsData(countries.features)
                .polygonAltitude(0.01)
                .polygonCapColor(() => 'rgba(0, 0, 0, 0.4)')
                .polygonSideColor(() => 'rgba(0, 229, 255, 0.05)')
                .polygonStrokeColor(() => 'rgba(0, 229, 255, 0.4)')
                .showAtmosphere(true)
                .atmosphereColor('#00e5ff')
                .atmosphereAltitude(0.15);
        }
    }, [countries]);

    useEffect(() => {
        if (!globeInstance.current) return;

        const filteredThreats = threats.filter(t => activeTheme === 'ALL' || t.theme === activeTheme);

        // Heatmap Hexagons
        const hexBinData = filteredThreats.map(t => ({
            lat: t.lat,
            lng: t.lng,
            weight: t.intensity
        }));

        globeInstance.current
            .hexBinPointsData(hexBinData)
            .hexBinPointWeight('weight')
            .hexBinResolution(4)
            .hexMargin(0.2)
            .hexTopColor(() => '#ff2a2a')
            .hexSideColor(() => 'rgba(255, 42, 42, 0.1)')
            .hexTransitionDuration(1000);

        // Attack Arcs
        const arcsData = filteredThreats.map((t) => ({
            startLat: t.lat + (Math.random() * 40 - 20),
            startLng: t.lng - (Math.random() * 40 - 20),
            endLat: t.lat,
            endLng: t.lng,
            color: 'rgba(0, 229, 255, 1)',
        }));

        globeInstance.current
            .arcsData(arcsData)
            .arcColor('color')
            .arcDashLength(0.4)
            .arcDashGap(0.2)
            .arcDashInitialGap(() => Math.random() * 5)
            .arcDashAnimateTime(2000);

        // Sonar Rings
        const ringsData = filteredThreats.map((t) => ({
            lat: t.lat,
            lng: t.lng,
            maxR: t.intensity * 3,
            propagationSpeed: 1,
            repeatPeriod: 1000,
        }));

        globeInstance.current
            .ringsData(ringsData)
            .ringColor(() => '#ff2a2a')
            .ringMaxRadius('maxR')
            .ringPropagationSpeed('propagationSpeed')
            .ringRepeatPeriod('repeatPeriod');

    }, [threats, activeTheme]);

    if (!countries) return null;

    return (
        <group scale={[0.8, 0.8, 0.8]}>
            {globeInstance.current && <primitive object={globeInstance.current} />}
        </group>
    );
}

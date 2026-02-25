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
                .polygonAltitude(0.015)
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

        const filteredThreats = threats.filter(t => activeTheme === 'ALLES' || t.theme === activeTheme);

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

        // Attack Arcs / Connections from hubs (e.g. Washington DC and Geneva)
        const hubs = [{ lat: 38.8951, lng: -77.0364 }, { lat: 46.2044, lng: 6.1432 }];
        const arcsData = filteredThreats.map((t, i) => {
            const hub = hubs[i % hubs.length];
            return {
                startLat: hub.lat,
                startLng: hub.lng,
                endLat: t.lat,
                endLng: t.lng,
                color: t.theme === 'KINETISCH' ? 'rgba(255, 42, 42, 0.8)' : 'rgba(0, 229, 255, 0.8)',
            };
        });

        globeInstance.current
            .arcsData(arcsData)
            .arcColor('color')
            .arcDashLength(0.4)
            .arcDashGap(0.2)
            .arcDashInitialGap(() => Math.random() * 5)
            .arcDashAnimateTime(3000)
            .arcAltitudeAutoScale(0.3);

        // Labels mapping the threat location to text
        const labelsData = filteredThreats.filter(t => t.intensity > 4).map(t => ({
            lat: t.lat,
            lng: t.lng,
            text: t.headline.length > 25 ? t.headline.substring(0, 25) + '...' : t.headline,
            color: 'white',
            size: 0.8
        }));

        globeInstance.current
            .labelsData(labelsData)
            .labelLat('lat')
            .labelLng('lng')
            .labelText('text')
            .labelSize('size')
            .labelDotRadius(0.3)
            .labelColor('color')
            .labelResolution(2)
            .labelAltitude(0.05);

        // Sonar Rings
        const ringsData = filteredThreats.map((t) => ({
            lat: t.lat,
            lng: t.lng,
            maxR: t.intensity * 3,
            propagationSpeed: 1,
            repeatPeriod: 800 + Math.random() * 1500,
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

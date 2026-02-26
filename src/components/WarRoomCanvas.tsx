'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Stars } from '@react-three/drei';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('./Globe'), { ssr: false });

function Scene() {
    return (
        <>
            <ambientLight intensity={0.5} color="#00e5ff" />
            <directionalLight position={[10, 20, 10]} intensity={0.6} color="#ffffff" />

            <Globe />

            <Stars radius={100} depth={50} count={1500} factor={2} saturation={0} fade={false} speed={0} />

            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={100}
                maxDistance={500}
                autoRotate
                autoRotateSpeed={0.2}
                enableDamping={true}
                dampingFactor={0.05}
            />
        </>
    );
}

export default function WarRoomCanvas() {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
            {/* frameloop="always" needed because of OrbitControls autoRotate and Globe animations */}
            <Canvas camera={{ position: [0, 0, 250], fov: 45 }} dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    );
}

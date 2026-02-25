import WarRoomCanvas from '@/components/WarRoomCanvas';
import HUD from '@/components/HUD';
import CommandCenter from '@/components/CommandCenter';

export default function Home() {
  return (
    <main className="relative w-screen h-screen bg-[var(--bg-void)] crt-flicker">
      <CommandCenter />
      {/* 3D Global View */}
      <WarRoomCanvas />

      {/* Head-Up Display Overlay */}
      <HUD />
    </main>
  );
}

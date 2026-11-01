export default function ParticleBackground() {
  // Ghost Cyber-Industrial Physicality Matrix Grid (Viewport-proportional mathematics)
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 devices-matrix-grid opacity-80"
      aria-hidden="true"
    >
      {/* Top subtle vignette & cybernetic ambient illumination */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#00050a]/60 to-[#00050a] pointer-events-none" />
      
      {/* Precision corner fiducial marks */}
      <div className="absolute top-4 left-4 font-mono text-[9px] text-ghost-ice/20 tracking-widest select-none">
        [SYS.GRID.GRCh38 // 12.5vw // ARCHITECTURAL DRAFT]
      </div>
      <div className="absolute top-4 right-4 font-mono text-[9px] text-ghost-ice/20 tracking-widest select-none">
        LOC.40.7128°N 74.0060°W
      </div>
    </div>
  );
}

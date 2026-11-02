export default function ParticleBackground() {
  // Cyber-Industrial Precision Matrix Grid
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 devices-matrix-grid opacity-80"
      aria-hidden="true"
    >
      {/* Top subtle vignette & ambient illumination */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#00050a]/60 to-[#00050a] pointer-events-none" />
      
      {/* Precision corner fiducial marks */}
      <div className="absolute top-4 left-4 font-mono text-[9px] text-iq-ice/20 tracking-widest select-none">
        [SYS.GRID.INTERVIEW-IQ // TELEMETRY CANVAS]
      </div>
      <div className="absolute top-4 right-4 font-mono text-[9px] text-iq-ice/20 tracking-widest select-none">
        CORE.WASM.ACTIVE
      </div>
    </div>
  );
}

export default function ParticleBackground() {
  // Clean minimal micro-dot matrix pattern (Pure CSS, 0 CPU / 0 GPU overhead)
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 opacity-25"
      style={{
        backgroundImage: `radial-gradient(#94A3B8 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
      aria-hidden="true"
    />
  );
}

export default function ParticleBackground() {
  // Clean minimal micro-dot matrix pattern (Pure CSS, 0 CPU / 0 GPU overhead)
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{
        backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
      aria-hidden="true"
    />
  );
}

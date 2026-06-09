import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const maxParticles = 200; // Optimal count for smooth performance
    const maxDistance = 90; // Proximity threshold for drawing lines between particles
    const mouse = { x: null, y: null, active: false };

    let isBlasting = false;
    let blastFrames = 0;
    let groupCooldown = 0;


    // Helper to initialize or respawn a single particle
    const initParticle = (p, spawnAtMouse = false) => {
      const isLight = document.documentElement.classList.contains('light');
      
      if (spawnAtMouse && mouse.active && mouse.x !== null && mouse.y !== null) {
        // Spawn at cursor position with a slight offset
        p.x = mouse.x + (Math.random() - 0.5) * 15;
        p.y = mouse.y + (Math.random() - 0.5) * 15;
        // Float outwards from mouse
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 0.5;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      } else {
        // Spawn randomly across screen
        p.x = Math.random() * width;
        p.y = Math.random() * height;
        p.vx = (Math.random() - 0.5) * 1.5;
        p.vy = (Math.random() - 0.5) * 1.5;
      }

      p.radius = Math.random() * 2.0 + 1.0;
      p.life = Math.random() * 0.5 + 0.5; // Starts with random opacity/lifespan
      p.decay = Math.random() * 0.008 + 0.004; // Lifespan decay rate
      
      // Color choices
      const colors = isLight
        ? ['rgba(59, 130, 246, ', 'rgba(37, 99, 235, ', 'rgba(96, 165, 250, ']
        : ['rgba(96, 165, 250, ', 'rgba(56, 189, 248, ', 'rgba(255, 255, 255, '];
      p.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
    };

    // Pre-populate particles
    for (let i = 0; i < maxParticles; i++) {
      const p = {};
      initParticle(p, false);
      particles.push(p);
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = null;
      mouse.y = null;
    };

    const handleMouseDown = () => {
      if (!mouse.active || mouse.x === null || mouse.y === null || groupCooldown > 0) return;

      // Check if particles are gathered around mouse
      let nearbyCount = 0;
      particles.forEach((p) => {
        const dist = Math.hypot(mouse.x - p.x, mouse.y - p.y);
        if (dist < 180) nearbyCount++;
      });

      // Universe blast on click
      if (nearbyCount > 25) {
        isBlasting = true;
        blastFrames = 45;
        groupCooldown = 80; // Allow expansion without immediate regrouping

        particles.forEach((p) => {
          // Reset all particles to the click center
          p.x = mouse.x + (Math.random() - 0.5) * 10;
          p.y = mouse.y + (Math.random() - 0.5) * 10;
          
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 12 + 6; // High speed blast

          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          
          p.life = 1.0; // Reset life to maximum
          p.decay = Math.random() * 0.015 + 0.01; // Faster decay during blast
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (groupCooldown > 0) groupCooldown--;
      if (blastFrames > 0) blastFrames--;
      if (blastFrames === 0) isBlasting = false;

      // Grouping logic
      let shouldGroup = false;
      if (mouse.active && mouse.x !== null && mouse.y !== null && groupCooldown === 0) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (Math.hypot(mouse.x - p.x, mouse.y - p.y) < 45) {
            shouldGroup = true;
            break;
          }
        }
      }

      particles.forEach((p) => {
        // Update life
        p.life -= p.decay;

        // Respawn particle if it dies
        if (p.life <= 0) {
          initParticle(p, mouse.active); // Spawns infinitely at mouse or randomly
          return;
        }

        // Apply physics
        if (isBlasting) {
          p.vx *= 0.94; // Decelerate blast outward
          p.vy *= 0.94;
        } else if (mouse.active && mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (shouldGroup) {
            // Strong attraction to form cluster
            const force = 0.12;
            p.vx += (dx / dist) * force - p.vx * 0.08;
            p.vy += (dy / dist) * force - p.vy * 0.08;
          } else if (dist < 200 && groupCooldown === 0) {
            // Light gravitational pull
            const force = (200 - dist) / 1800;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Speed limit / drag
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Screen boundary wraps
        if (p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
          initParticle(p, mouse.active);
        }

        // Draw particle
        ctx.beginPath();
        
        if (isBlasting) {
          // Exploding particles
          let blastColor = 'rgba(255, 255, 255, ';
          let glowColor = 'rgba(56, 189, 248, ';
          if (blastFrames > 30) {
            blastColor = 'rgba(255, 255, 255, ';
            glowColor = 'rgba(255, 255, 255, ';
          } else if (blastFrames > 15) {
            blastColor = 'rgba(255, 183, 3, ';
            glowColor = 'rgba(255, 183, 3, ';
          }

          // Glow outline (highly optimized)
          ctx.arc(p.x, p.y, p.radius * (2.0 + blastFrames / 10), 0, Math.PI * 2);
          ctx.fillStyle = glowColor + (p.life * 0.15) + ')';
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (1.0 + blastFrames / 20), 0, Math.PI * 2);
          ctx.fillStyle = blastColor + p.life + ')';
          ctx.fill();
        } else {
          // Normal floating particle
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.colorPrefix + p.life + ')';
          ctx.fill();
        }
      });

      // Connections (drawn only when NOT blasting for crisp visual style)
      if (!isBlasting) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

            if (dist < maxDistance) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              // Fade connection line opacity based on particle lifecycle
              ctx.strokeStyle = `rgba(96, 165, 250, ${Math.min(p1.life, p2.life) * (1 - dist / maxDistance) * 0.08})`;
              ctx.lineWidth = (1 - dist / maxDistance) * 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

import React, { useEffect, useRef } from 'react';

interface QuantumLogoProps {
  size?: number;
  className?: string;
}

export const QuantumLogo: React.FC<QuantumLogoProps> = ({ 
  size = 120, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Quantum particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }> = [];

    const colors = ['#00ffff', '#ff00ff', '#00ff00']; // Cyan, Magenta, Green
    const centerX = size / 2;
    const centerY = size / 2;

    // Create initial particles
    const createParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 40 + 20;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 0,
        maxLife: Math.random() * 200 + 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2 + 1,
      };
    };

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;
        
        // Add quantum fluctuation
        particle.vx += (Math.random() - 0.5) * 0.02;
        particle.vy += (Math.random() - 0.5) * 0.02;
        
        // Constrain to center area
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 50) {
          particle.vx = -dx / distance * 0.1;
          particle.vy = -dy / distance * 0.1;
        }
        
        // Draw particle with glow effect
        const alpha = Math.sin((particle.life / particle.maxLife) * Math.PI);
        const glowSize = particle.size * (1 + alpha * 2);
        
        // Outer glow
        ctx.save();
        ctx.globalAlpha = alpha * 0.3;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = glowSize * 3;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Inner particle
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Remove dead particles
        if (particle.life >= particle.maxLife) {
          particles.splice(i, 1);
          particles.push(createParticle());
        }
      }
      
      // Draw quantum field lines
      ctx.save();
      ctx.strokeStyle = '#00ffff';
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.001;
        const startRadius = 30;
        const endRadius = 45;
        
        const x1 = centerX + Math.cos(angle) * startRadius;
        const y1 = centerY + Math.sin(angle) * startRadius;
        const x2 = centerX + Math.cos(angle) * endRadius;
        const y2 = centerY + Math.sin(angle) * endRadius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
      
      // Draw central quantum core
      ctx.save();
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 20;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size]);

  return (
    <div className={`quantum-logo-container ${className}`}>
      <canvas
        ref={canvasRef}
        className="quantum-logo-canvas"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
          border: '2px solid rgba(0, 255, 255, 0.3)',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.1)',
        }}
      />
      <style jsx>{`
        .quantum-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .quantum-logo-canvas {
          animation: quantum-pulse 3s ease-in-out infinite;
        }
        
        @keyframes quantum-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.1);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(0, 255, 255, 0.8), inset 0 0 40px rgba(0, 255, 255, 0.2);
          }
        }
      `}</style>
    </div>
  );
};
import React, { useEffect, useRef } from 'react';

interface AbstractAtmosphereCanvasProps {
  scrollProgress?: number; // 0 to 1
  mouseX?: number; // -1 to 1
  mouseY?: number; // -1 to 1
  theme?: 'dark' | 'warm';
}

export function AbstractAtmosphereCanvas({
  scrollProgress = 0,
  mouseX = 0,
  mouseY = 0,
  theme = 'warm',
}: AbstractAtmosphereCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let time = 0;

    // Silk wave parameters
    const waves = [
      {
        baseY: 0.52,
        amplitude: 65,
        wavelength: 0.0018,
        speed: 0.008,
        colorStart: 'rgba(216, 185, 138, 0.45)', // Champagne metallic
        colorMid: 'rgba(247, 244, 238, 0.65)',   // Ivory highlight
        colorEnd: 'rgba(38, 33, 28, 0.25)',     // Warm shadow
        thickness: 180,
      },
      {
        baseY: 0.44,
        amplitude: 85,
        wavelength: 0.0012,
        speed: 0.006,
        colorStart: 'rgba(197, 164, 109, 0.35)', // Warm gold
        colorMid: 'rgba(235, 222, 201, 0.55)',   // Soft cream
        colorEnd: 'rgba(23, 23, 23, 0.35)',      // Deep shadow
        thickness: 240,
      },
      {
        baseY: 0.62,
        amplitude: 50,
        wavelength: 0.0022,
        speed: 0.011,
        colorStart: 'rgba(240, 232, 218, 0.4)',  // Translucent silk
        colorMid: 'rgba(212, 178, 126, 0.5)',    // Champagne crest
        colorEnd: 'rgba(40, 32, 24, 0.2)',
        thickness: 150,
      },
    ];

    // Floating glass prism geometric shapes
    const prisms = [
      { x: 0.22, y: 0.38, w: 140, h: 220, rot: -0.15, rotSpeed: 0.002 },
      { x: 0.78, y: 0.46, w: 180, h: 280, rot: 0.22, rotSpeed: -0.0015 },
      { x: 0.52, y: 0.72, w: 260, h: 120, rot: 0.05, rotSpeed: 0.001 },
    ];

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // 1. Dynamic Architectural Sunlight & Shadow Rays
      const sunAngle = -0.45 + mouseX * 0.15 + scrollProgress * 0.2;
      const rayGradient = ctx.createLinearGradient(
        width * 0.1,
        0,
        width * 0.9,
        height
      );
      rayGradient.addColorStop(0, 'rgba(247, 244, 238, 0.08)');
      rayGradient.addColorStop(0.35, 'rgba(216, 185, 138, 0.15)');
      rayGradient.addColorStop(0.7, 'rgba(23, 23, 23, 0.04)');
      rayGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = rayGradient;
      ctx.fillRect(0, 0, width, height);

      // Architectural diagonal shadow beams
      ctx.save();
      ctx.rotate(sunAngle);
      for (let i = -width; i < width * 2; i += 220) {
        ctx.fillStyle = 'rgba(247, 244, 238, 0.025)';
        ctx.fillRect(i, -height, 90, height * 3);
      }
      ctx.restore();

      // 2. Translucent Glass Geometric Prisms (Sculptural Depth)
      prisms.forEach((p, idx) => {
        ctx.save();
        const px = width * p.x + mouseX * (20 + idx * 10);
        const py = height * p.y + mouseY * (15 + idx * 8) - scrollProgress * 150;
        const currentRot = p.rot + time * p.rotSpeed;

        ctx.translate(px, py);
        ctx.rotate(currentRot);

        // Glass shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 20;

        // Glass body gradient
        const glassGrad = ctx.createLinearGradient(-p.w / 2, -p.h / 2, p.w / 2, p.h / 2);
        glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
        glassGrad.addColorStop(0.5, 'rgba(216, 185, 138, 0.06)');
        glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

        ctx.fillStyle = glassGrad;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

        // Metallic champagne specular edge
        ctx.strokeStyle = 'rgba(216, 185, 138, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);

        // Subtle diagonal caustics refraction line
        ctx.beginPath();
        ctx.moveTo(-p.w / 2, -p.h / 2 + 30);
        ctx.lineTo(p.w / 2, p.h / 2 - 30);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      });

      // 3. Flowing Abstract Silk Ribbon Surfaces
      waves.forEach((wave, wIdx) => {
        ctx.save();
        const yOffset = height * wave.baseY + mouseY * (25 + wIdx * 15) - scrollProgress * 180;

        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, yOffset);

        for (let x = 0; x <= width; x += 12) {
          const dx = x * wave.wavelength;
          const dt = time * wave.speed;
          // Harmonic wave equation for organic liquid silk movement
          const y =
            yOffset +
            Math.sin(dx + dt) * wave.amplitude +
            Math.sin(dx * 2.2 - dt * 0.7) * (wave.amplitude * 0.4) +
            Math.cos(dx * 0.8 + dt * 1.3) * (wave.amplitude * 0.25);

          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Metallic champagne to ivory to deep warm shadow gradient
        const waveGrad = ctx.createLinearGradient(0, yOffset - wave.amplitude, 0, height);
        waveGrad.addColorStop(0, wave.colorMid);
        waveGrad.addColorStop(0.15, wave.colorStart);
        waveGrad.addColorStop(0.65, wave.colorEnd);
        waveGrad.addColorStop(1, 'rgba(20, 19, 18, 0.85)');

        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Highlight silk crest line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 12) {
          const dx = x * wave.wavelength;
          const dt = time * wave.speed;
          const y =
            yOffset +
            Math.sin(dx + dt) * wave.amplitude +
            Math.sin(dx * 2.2 - dt * 0.7) * (wave.amplitude * 0.4) +
            Math.cos(dx * 0.8 + dt * 1.3) * (wave.amplitude * 0.25);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      });

      // 4. Subtle Ambient Floating Champagne Light Dust
      for (let i = 0; i < 28; i++) {
        const seed = (i * 9301 + 49297) % 233280;
        const px = ((seed / 233280) * width + Math.sin(time * 0.01 + i) * 30 + mouseX * 20) % width;
        const py = (((i * 73) % height) + Math.cos(time * 0.008 + i) * 20 - (time * 0.3) % height + height) % height;
        const radius = (i % 3) * 0.8 + 0.8;
        const alpha = Math.abs(Math.sin(time * 0.02 + i)) * 0.45;

        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216, 185, 138, ${alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [scrollProgress, mouseX, mouseY, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

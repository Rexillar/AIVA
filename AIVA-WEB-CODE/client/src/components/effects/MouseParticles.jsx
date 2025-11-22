/*=================================================================
 * Project: AIVA-WEB
 * File: MouseParticles.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * MouseParticles component for displaying mouse particles.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React, { useEffect, useRef } from "react";

export const MouseParticles = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const frameRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = Math.random() * 2 + 1;
        this.life = 1;
        this.maxLife = Math.random() * 0.5 + 0.5;
        this.hue = Math.random() * 60 + 200; // Blue to purple range
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= 0.01;
      }

      draw(ctx) {
        const opacity = (this.life / this.maxLife) * 0.5;
        ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const createParticles = (x, y, px, py) => {
      const moveX = x - px;
      const moveY = y - py;
      const particleCount = Math.min(Math.abs(moveX) + Math.abs(moveY), 20);

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        const vx = Math.cos(angle) * speed + moveX * 0.1;
        const vy = Math.sin(angle) * speed + moveY * 0.1;
        particles.push(new Particle(x, y, vx, vy));
      }
    };

    const animate = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create particles based on mouse movement
      if (
        Math.abs(mouseRef.current.x - mouseRef.current.px) > 0 ||
        Math.abs(mouseRef.current.y - mouseRef.current.py) > 0
      ) {
        createParticles(
          mouseRef.current.x,
          mouseRef.current.y,
          mouseRef.current.px,
          mouseRef.current.py,
        );
      }

      // Update previous mouse position
      mouseRef.current.px = mouseRef.current.x;
      mouseRef.current.py = mouseRef.current.y;

      // Update and draw particles
      particles = particles.filter((particle) => particle.life > 0);
      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      if (typeof mouseRef.current.px !== "number") {
        mouseRef.current.px = e.clientX;
        mouseRef.current.py = e.clientY;
      }
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    // Add event listeners
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    resizeCanvas();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
    />
  );
};

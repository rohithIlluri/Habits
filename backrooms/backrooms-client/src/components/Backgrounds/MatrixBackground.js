import React, { useEffect, useRef } from 'react';

const MatrixBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas to match the screen size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Handle window resizing
    window.addEventListener('resize', setCanvasSize);

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize); // Number of columns
    const drops = Array(columns).fill(0); // Initial drop positions

    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+-';

    const draw = () => {
      // Add fade-out effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set the text style
      ctx.fillStyle = '#0f0'; // Neon green
      ctx.font = `${fontSize}px monospace`;

      // Loop through drops
      drops.forEach((y, index) => {
        const text = characters[Math.floor(Math.random() * characters.length)];
        const x = index * fontSize;
        ctx.fillText(text, x, y * fontSize);

        // Reset drop position randomly to create "falling" effect
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[index] = 0;
        }

        // Increment drop position
        drops[index]++;
      });
    };

    const interval = setInterval(draw, 50);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-canvas"></canvas>;
};

export default MatrixBackground;

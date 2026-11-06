import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { usePlayer } from '../../context/PlayerContext';

export default function AudioVisualizer({ className = 'w-full h-16', barCount = 48, mode = 'bars' }) {
  const canvasRef = useRef(null);
  const { isPlaying, analyserNode } = usePlayer();
  const { currentAccent } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Buffer for analyser data
    let dataArray;
    if (analyserNode) {
      dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    }

    let phase = 0;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(dataArray);
      }

      if (mode === 'bars') {
        const barWidth = (width / barCount) - 2;
        for (let i = 0; i < barCount; i++) {
          let barHeight;
          if (analyserNode && isPlaying && dataArray) {
            const dataIndex = Math.floor((i / barCount) * (dataArray.length * 0.75));
            const value = dataArray[dataIndex] || 0;
            barHeight = (value / 255) * height * 0.9 + 2;
          } else if (isPlaying) {
            // Simulated pleasant pulse when WebAudio hasn't bound
            const sinVal = Math.sin(phase + i * 0.2);
            barHeight = Math.max(4, ((sinVal + 1) / 2) * height * 0.6);
          } else {
            // Idle subtle bars
            barHeight = 3;
          }

          const x = i * (barWidth + 2);
          const y = height - barHeight;

          // Gradient bar
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, currentAccent.primary);
          gradient.addColorStop(1, currentAccent.hover);

          ctx.fillStyle = isPlaying ? gradient : 'rgba(100, 116, 139, 0.3)';
          ctx.beginPath();
          ctx.roundRect(x, y, Math.max(1, barWidth), Math.max(2, barHeight), 2);
          ctx.fill();
        }
      } else {
        // Waveform mode
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = isPlaying ? currentAccent.primary : 'rgba(100, 116, 139, 0.4)';

        const sliceWidth = width / barCount;
        let x = 0;

        for (let i = 0; i < barCount; i++) {
          let v = 0.5;
          if (analyserNode && isPlaying && dataArray) {
            const dataIndex = Math.floor((i / barCount) * (dataArray.length * 0.6));
            v = (dataArray[dataIndex] || 128) / 255;
          } else if (isPlaying) {
            v = 0.5 + Math.sin(phase + i * 0.3) * 0.35;
          }

          const y = (1 - v) * height;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
      }

      phase += 0.08;
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyserNode, isPlaying, currentAccent, barCount, mode]);

  // Handle high-DPI canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
      }
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}


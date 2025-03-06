'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Coordinates } from '../types/xfoil';

interface Props {
  coordinates: Coordinates;
}

export default function AirfoilPlot({ coordinates }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 300 });

  // Effect for handling window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const width = container.clientWidth;
          setCanvasSize({
            width: width,
            height: Math.min(300, width * 0.6) // Maintain aspect ratio with max height
          });
        }
      }
    };
    
    // Initial size calculation
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array since we only want this to run once on mount

  // Effect for drawing the airfoil
  useEffect(() => {
    if (!canvasRef.current || coordinates.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions with device pixel ratio for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    
    // Scale the context to account for the device pixel ratio
    ctx.scale(dpr, dpr);
    
    // Set the CSS size of the canvas
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Set canvas dimensions
    const width = canvasSize.width;
    const height = canvasSize.height;
    const padding = 40;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;

    // Find min/max values for scaling
    const xValues = coordinates.map(([x]) => x);
    const yValues = coordinates.map(([_, y]) => y);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    // Add some margin to the data range
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const margin = 0.1;
    
    const xMinWithMargin = xMin - xRange * margin;
    const xMaxWithMargin = xMax + xRange * margin;
    const yMinWithMargin = yMin - yRange * margin;
    const yMaxWithMargin = yMax + yRange * margin;

    // Calculate aspect ratio to maintain
    const dataAspectRatio = (xMaxWithMargin - xMinWithMargin) / (yMaxWithMargin - yMinWithMargin);
    
    // Determine scaling factors
    let scaleX, scaleY;
    if (plotWidth / plotHeight > dataAspectRatio) {
      // Canvas is wider than data aspect ratio
      scaleY = plotHeight / (yMaxWithMargin - yMinWithMargin);
      scaleX = scaleY;
    } else {
      // Canvas is taller than data aspect ratio
      scaleX = plotWidth / (xMaxWithMargin - xMinWithMargin);
      scaleY = scaleX;
    }

    // Center the plot
    const xOffset = padding + (plotWidth - (xMaxWithMargin - xMinWithMargin) * scaleX) / 2;
    const yOffset = padding + plotHeight / 2;

    // Transform coordinates to canvas space
    const transformX = (x: number) => xOffset + (x - xMinWithMargin) * scaleX;
    const transformY = (y: number) => yOffset - y * scaleY;

    // Draw coordinate system
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, yOffset);
    ctx.lineTo(width - padding, yOffset);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(transformX(0), padding);
    ctx.lineTo(transformX(0), height - padding);
    ctx.stroke();

    // Draw grid lines
    ctx.setLineDash([2, 2]);
    
    // X grid lines
    for (let x = Math.floor(xMinWithMargin * 10) / 10; x <= xMaxWithMargin; x += 0.1) {
      if (Math.abs(x) < 0.001) continue; // Skip the axis itself
      ctx.beginPath();
      ctx.moveTo(transformX(x), padding);
      ctx.lineTo(transformX(x), height - padding);
      ctx.stroke();
    }
    
    // Y grid lines
    for (let y = Math.floor(yMinWithMargin * 10) / 10; y <= yMaxWithMargin; y += 0.1) {
      if (Math.abs(y) < 0.001) continue; // Skip the axis itself
      ctx.beginPath();
      ctx.moveTo(padding, transformY(y));
      ctx.lineTo(width - padding, transformY(y));
      ctx.stroke();
    }
    
    ctx.setLineDash([]);

    // Draw airfoil
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6'; // Blue color
    ctx.lineWidth = 2;
    
    coordinates.forEach(([x, y], i) => {
      const canvasX = transformX(x);
      const canvasY = transformY(y);
      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    });
    
    ctx.stroke();
    
    // Fill the airfoil with a gradient
    const gradient = ctx.createLinearGradient(
      transformX(xMin), transformY(0),
      transformX(xMax), transformY(0)
    );
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)'); // Light blue
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');  // Light cyan
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw leading and trailing edge points
    const drawPoint = (x: number, y: number, color: string, label: string) => {
      const canvasX = transformX(x);
      const canvasY = transformY(y);
      
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      ctx.fillStyle = '#333';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, canvasX, canvasY - 10);
    };
    
    // Find leading edge (approximately at x=0)
    const leadingEdgeIndex = coordinates.findIndex(([x]) => x < 0.01);
    if (leadingEdgeIndex >= 0) {
      const [leX, leY] = coordinates[leadingEdgeIndex];
      drawPoint(leX, leY, '#ef4444', 'LE'); // Red color
    }
    
    // Trailing edge is at the first and last points
    if (coordinates.length > 0) {
      const [teX, teY] = coordinates[0];
      drawPoint(teX, teY, '#3b82f6', 'TE'); // Blue color
    }
  }, [coordinates, canvasSize]); // Only redraw when coordinates or canvasSize changes

  return (
    <div className="canvas-container">
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: 'auto' }}
        className="bg-white"
      />
      {coordinates.length === 0 && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80 rounded-lg">
          <div className="text-center p-4">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L3 9L12 14L21 9L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 14L12 19L21 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-gray-500">Generate an airfoil to see visualization</p>
            <p className="text-sm text-gray-400 mt-1">Use the NACA generator above</p>
          </div>
        </div>
      )}
    </div>
  );
} 
'use client';

import React, { useEffect, useRef } from 'react';
import { Coordinates } from '../types/xfoil';
import { generatePressureDistribution, generateTransitionPoints } from '../utils/mockData';
import '../lib/chartConfig';

interface Props {
  coordinates: Coordinates;
  alpha: number;
  reynolds: number;
  mach?: number;
}

export default function PressureDistribution({ coordinates, alpha, reynolds, mach = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || coordinates.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate pressure distribution data
    const pressureData = generatePressureDistribution(coordinates, alpha, reynolds);
    const transitionPoints = generateTransitionPoints(alpha, reynolds);

    // Set canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 50, right: 50, bottom: 50, left: 70 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Find min/max values for scaling
    const xValues = coordinates.map(([x]) => x);
    const yValues = coordinates.map(([_, y]) => y);
    const cpValues = pressureData.map(point => point.cp);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const cpMin = Math.min(...cpValues);
    const cpMax = Math.max(...cpValues);

    // Scale to fit canvas (with padding)
    const scaleX = plotWidth / (xMax - xMin);
    const scaleY = plotHeight / (yMax - yMin);
    const scaleCp = plotHeight / (cpMax - cpMin);

    // Transform coordinates to canvas space
    const transformX = (x: number) => padding.left + (x - xMin) * scaleX;
    const transformY = (y: number) => padding.top + plotHeight - (y - yMin) * scaleY;
    const transformCp = (cp: number) => padding.top + plotHeight - (cp - cpMin) * scaleCp;

    // Draw coordinate system
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + plotHeight);
    ctx.lineTo(padding.left + plotWidth, padding.top + plotHeight);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + plotHeight);
    ctx.stroke();

    // Draw Cp scale
    ctx.strokeStyle = '#ccc';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '12px Arial';
    
    // Cp ticks and labels
    const cpStep = 0.5;
    for (let cp = Math.ceil(cpMin); cp <= Math.floor(cpMax); cp += cpStep) {
      const y = transformCp(cp);
      
      ctx.beginPath();
      ctx.moveTo(padding.left - 5, y);
      ctx.lineTo(padding.left, y);
      ctx.stroke();
      
      ctx.fillText(cp.toFixed(1), padding.left - 10, y);
    }
    
    // Cp axis label
    ctx.save();
    ctx.translate(padding.left - 50, padding.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Pressure Coefficient (Cp)', 0, 0);
    ctx.restore();

    // Draw airfoil
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    coordinates.forEach(([x, y], i) => {
      const canvasX = transformX(x);
      const canvasY = transformY(y);
      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(240, 240, 240, 0.8)';
    ctx.fill();

    // Draw pressure distribution lines
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Draw lines from airfoil surface to pressure points
    pressureData.forEach(({ x, y, cp }) => {
      const surfaceX = transformX(x);
      const surfaceY = transformY(y);
      const pressureY = transformCp(cp);
      
      ctx.moveTo(surfaceX, surfaceY);
      ctx.lineTo(surfaceX, pressureY);
    });
    ctx.stroke();

    // Draw pressure distribution curve
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    pressureData.forEach(({ x, cp }, i) => {
      const canvasX = transformX(x);
      const canvasY = transformCp(cp);
      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    });
    ctx.stroke();

    // Draw transition points
    const drawTransitionPoint = (xc: number, isUpper: boolean) => {
      // Find the closest x-coordinate on the airfoil
      const surfacePoint = coordinates.reduce((closest, current) => {
        return Math.abs(current[0] - xc) < Math.abs(closest[0] - xc) ? current : closest;
      });
      
      const tx = transformX(xc);
      const ty = transformY(surfacePoint[1]) + (isUpper ? -10 : 10);
      
      ctx.beginPath();
      ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
      
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText(isUpper ? 'Top Xtr' : 'Bot Xtr', tx, ty + (isUpper ? -15 : 20));
    };
    
    drawTransitionPoint(transitionPoints.upper, true);
    drawTransitionPoint(transitionPoints.lower, false);

    // Draw title and info
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.font = '16px Arial';
    ctx.fillText(`NACA Airfoil Analysis`, width / 2, 20);
    
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`α = ${alpha.toFixed(3)}°`, width - 20, 40);
    ctx.fillText(`Re = ${(reynolds / 1e6).toFixed(3)}×10⁶`, width - 20, 60);
    ctx.fillText(`Ma = ${mach.toFixed(3)}`, width - 20, 80);

  }, [coordinates, alpha, reynolds, mach]);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={500} 
        className="w-full h-auto"
      />
    </div>
  );
} 
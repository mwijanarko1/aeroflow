import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

interface Point {
  x: number;
  y: number;
}

function generateNACA4Digit(nacaNumber: string, numPoints: number = 100): Point[] {
  const m = parseInt(nacaNumber[0]) / 100;  // maximum camber
  const p = parseInt(nacaNumber[1]) / 10;   // location of maximum camber
  const t = parseInt(nacaNumber.slice(2)) / 100;  // thickness

  const points: Point[] = [];
  const xPoints = Array.from({ length: numPoints }, (_, i) => {
    // Use cosine spacing for better point distribution
    const beta = (i * Math.PI) / (numPoints - 1);
    return (1 - Math.cos(beta)) / 2;
  });

  // Generate upper and lower surface points
  for (let i = numPoints - 1; i >= 0; i--) {
    const x = xPoints[i];
    const yt = (t / 0.2) * (0.2969 * Math.sqrt(x) - 0.1260 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1015 * x ** 4);

    let yc = 0;
    let dyc_dx = 0;

    if (x <= p) {
      yc = (m / (p * p)) * (2 * p * x - x * x);
      dyc_dx = (2 * m / (p * p)) * (p - x);
    } else {
      yc = (m / ((1 - p) * (1 - p))) * ((1 - 2 * p) + 2 * p * x - x * x);
      dyc_dx = (2 * m / ((1 - p) * (1 - p))) * (p - x);
    }

    const theta = Math.atan(dyc_dx);
    
    // Upper surface
    points.push({
      x: x - yt * Math.sin(theta),
      y: yc + yt * Math.cos(theta)
    });
  }

  // Add lower surface points
  for (let i = 1; i < numPoints; i++) {
    const x = xPoints[i];
    const yt = (t / 0.2) * (0.2969 * Math.sqrt(x) - 0.1260 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1015 * x ** 4);

    let yc = 0;
    let dyc_dx = 0;

    if (x <= p) {
      yc = (m / (p * p)) * (2 * p * x - x * x);
      dyc_dx = (2 * m / (p * p)) * (p - x);
    } else {
      yc = (m / ((1 - p) * (1 - p))) * ((1 - 2 * p) + 2 * p * x - x * x);
      dyc_dx = (2 * m / ((1 - p) * (1 - p))) * (p - x);
    }

    const theta = Math.atan(dyc_dx);

    // Lower surface
    points.push({
      x: x - yt * Math.sin(theta),
      y: yc - yt * Math.cos(theta)
    });
  }

  return points;
}

function generateNACA5Digit(nacaNumber: string, numPoints: number = 100): Point[] {
  // This is a simplified implementation of the NACA 5-digit series
  // For a complete implementation, we would need to handle all design cases
  const L = parseInt(nacaNumber[0]) * 0.15;  // Lift coefficient
  const P = parseInt(nacaNumber[1]) * 0.05;  // Location of max camber
  const Q = parseInt(nacaNumber[2]);         // Camber line type
  const t = parseInt(nacaNumber.slice(3)) / 100;  // Thickness

  // Use standard NACA 4-digit thickness distribution
  const points: Point[] = [];
  const xPoints = Array.from({ length: numPoints }, (_, i) => {
    const beta = (i * Math.PI) / (numPoints - 1);
    return (1 - Math.cos(beta)) / 2;
  });

  for (let i = numPoints - 1; i >= 0; i--) {
    const x = xPoints[i];
    const yt = (t / 0.2) * (0.2969 * Math.sqrt(x) - 0.1260 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1015 * x ** 4);

    // Simplified camber line (this should be replaced with proper equations for each Q value)
    const yc = L * (P - x);
    const dyc_dx = -L;

    const theta = Math.atan(dyc_dx);
    
    // Upper surface
    points.push({
      x: x - yt * Math.sin(theta),
      y: yc + yt * Math.cos(theta)
    });
  }

  for (let i = 1; i < numPoints; i++) {
    const x = xPoints[i];
    const yt = (t / 0.2) * (0.2969 * Math.sqrt(x) - 0.1260 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1015 * x ** 4);

    // Simplified camber line
    const yc = L * (P - x);
    const dyc_dx = -L;

    const theta = Math.atan(dyc_dx);

    // Lower surface
    points.push({
      x: x - yt * Math.sin(theta),
      y: yc - yt * Math.cos(theta)
    });
  }

  return points;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { nacaNumber } = data;

    if (!nacaNumber || !(nacaNumber.length === 4 || nacaNumber.length === 5)) {
      return NextResponse.json(
        { error: 'Invalid NACA number format' },
        { status: 400 }
      );
    }

    // Generate coordinates based on NACA number length
    const points = nacaNumber.length === 4 
      ? generateNACA4Digit(nacaNumber)
      : generateNACA5Digit(nacaNumber);

    // Convert points to Selig format (single column x,y pairs)
    const airfoilData = points
      .map(point => `${point.x.toFixed(6)}  ${point.y.toFixed(6)}`)
      .join('\n');

    return new NextResponse(airfoilData, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error generating NACA airfoil:', error);
    return NextResponse.json(
      { error: 'Failed to generate airfoil' },
      { status: 500 }
    );
  }
} 
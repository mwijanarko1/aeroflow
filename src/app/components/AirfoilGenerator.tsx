'use client';

import React, { useState } from 'react';
import { Coordinates } from '../types/xfoil';

interface Props {
  onGenerate: (coordinates: Coordinates, nacaCode: string) => void;
}

export default function AirfoilGenerator({ onGenerate }: Props) {
  const [nacaCode, setNacaCode] = useState('0012');
  const [numPoints, setNumPoints] = useState(100);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNACA4Digit = (code: string, n: number): Coordinates => {
    // Parse the 4-digit NACA code
    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      throw new Error('NACA code must be 4 digits (0-9)');
    }

    const m = parseInt(code[0]) / 100; // Maximum camber
    const p = parseInt(code[1]) / 10;  // Position of maximum camber
    const t = parseInt(code.slice(2)) / 100; // Thickness

    // Validate parameters
    if (t <= 0) {
      throw new Error('Thickness must be greater than 0');
    }

    const coordinates: Coordinates = [];
    
    // Generate points from trailing edge (1,0), around the leading edge (0,0), and back to trailing edge (1,0)
    for (let i = 0; i < n; i++) {
      // x from 1 to 0 (upper surface, trailing to leading edge)
      const x = 1 - (1 - Math.cos(Math.PI * i / (n - 1))) / 2;
      
      // Calculate thickness distribution
      const yt = t / 0.2 * (0.2969 * Math.sqrt(x) - 0.1260 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1015 * x ** 4);
      
      let yc = 0;
      let dyc_dx = 0;
      
      // Calculate camber line and its slope
      if (m > 0) {
        if (x <= p) {
          yc = m / p ** 2 * (2 * p * x - x ** 2);
          dyc_dx = 2 * m / p ** 2 * (p - x);
        } else {
          yc = m / (1 - p) ** 2 * ((1 - 2 * p) + 2 * p * x - x ** 2);
          dyc_dx = 2 * m / (1 - p) ** 2 * (p - x);
        }
      }
      
      // Calculate the angle of the camber line
      const theta = Math.atan(dyc_dx);
      
      // Calculate upper and lower surface coordinates
      const xu = x - yt * Math.sin(theta);
      const yu = yc + yt * Math.cos(theta);
      
      coordinates.push([xu, yu]);
    }
    
    // Lower surface, leading to trailing edge
    for (let i = n - 1; i >= 0; i--) {
      const x = 1 - (1 - Math.cos(Math.PI * i / (n - 1))) / 2;
      
      // Calculate thickness distribution
      const yt = t / 0.2 * (0.2969 * Math.sqrt(x) - 0.1260 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1015 * x ** 4);
      
      let yc = 0;
      let dyc_dx = 0;
      
      // Calculate camber line and its slope
      if (m > 0) {
        if (x <= p) {
          yc = m / p ** 2 * (2 * p * x - x ** 2);
          dyc_dx = 2 * m / p ** 2 * (p - x);
        } else {
          yc = m / (1 - p) ** 2 * ((1 - 2 * p) + 2 * p * x - x ** 2);
          dyc_dx = 2 * m / (1 - p) ** 2 * (p - x);
        }
      }
      
      // Calculate the angle of the camber line
      const theta = Math.atan(dyc_dx);
      
      // Calculate upper and lower surface coordinates
      const xl = x + yt * Math.sin(theta);
      const yl = yc - yt * Math.cos(theta);
      
      coordinates.push([xl, yl]);
    }
    
    return coordinates;
  };

  const handleGenerate = () => {
    try {
      setError('');
      setIsGenerating(true);
      
      // Add a small delay to allow UI to update
      setTimeout(() => {
        try {
          const coords = generateNACA4Digit(nacaCode, numPoints);
          console.log(`Generated ${coords.length} coordinates for NACA ${nacaCode}`);
          onGenerate(coords, nacaCode);
          setIsGenerating(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to generate airfoil');
          setIsGenerating(false);
        }
      }, 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate airfoil');
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="naca-code" className="block text-sm font-medium text-gray-700">
          NACA 4-Digit Code
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            NACA
          </span>
          <input
            type="text"
            id="naca-code"
            value={nacaCode}
            onChange={(e) => setNacaCode(e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="0012"
            maxLength={4}
            pattern="[0-9]{4}"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Example: 0012 (symmetric), 2412 (cambered)
        </p>
      </div>

      <div>
        <label htmlFor="num-points" className="block text-sm font-medium text-gray-700">
          Number of Points
        </label>
        <input
          type="number"
          id="num-points"
          value={numPoints}
          onChange={(e) => setNumPoints(Number(e.target.value))}
          min={20}
          max={200}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'Generating...' : 'Generate Airfoil'}
      </button>
      
      <div className="text-xs text-gray-500 mt-2">
        <p>Common NACA profiles:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {['0012', '2412', '4412', '6412', '0006', '0009', '0015'].map(code => (
            <button
              key={code}
              type="button"
              onClick={() => setNacaCode(code)}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 
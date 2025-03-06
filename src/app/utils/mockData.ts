'use client';

import { Coordinates } from '../types/xfoil';

/**
 * Generates a mock pressure distribution around an airfoil
 * This simulates the Cp (pressure coefficient) distribution that XFoil would calculate
 */
export function generatePressureDistribution(
  coordinates: Coordinates,
  alpha: number,
  reynolds: number
): { x: number; y: number; cp: number }[] {
  // Sort coordinates to ensure they go from trailing edge, around the airfoil, and back
  // This is important for proper pressure distribution visualization
  const sortedCoords = [...coordinates];
  
  // Find leading edge (approximately at x=0)
  const leadingEdgeIndex = sortedCoords.findIndex(([x]) => x < 0.01);
  
  // Separate upper and lower surfaces
  const upperSurface = sortedCoords.slice(0, leadingEdgeIndex + 1);
  const lowerSurface = sortedCoords.slice(leadingEdgeIndex);
  
  // Ensure proper ordering (trailing edge to leading edge for upper, leading edge to trailing edge for lower)
  upperSurface.reverse();
  
  // Generate pressure coefficients
  const alphaRad = alpha * Math.PI / 180;
  const pressureData = [];
  
  // Process upper surface (suction side, typically negative Cp)
  for (let i = 0; i < upperSurface.length; i++) {
    const [x, y] = upperSurface[i];
    const position = i / (upperSurface.length - 1); // 0 at trailing edge, 1 at leading edge
    
    // Simulate pressure peak near leading edge on upper surface
    // More negative Cp means stronger suction
    let cp = -1.0 - 3.0 * Math.pow(position, 0.5) * (1 - position);
    
    // Adjust based on angle of attack - higher alpha means stronger suction peak
    cp *= (1 + 0.2 * alpha);
    
    // Add some randomness for realism
    cp *= (0.95 + Math.random() * 0.1);
    
    pressureData.push({ x, y, cp });
  }
  
  // Process lower surface (pressure side, typically positive Cp near leading edge)
  for (let i = 0; i < lowerSurface.length; i++) {
    const [x, y] = lowerSurface[i];
    const position = i / (lowerSurface.length - 1); // 0 at leading edge, 1 at trailing edge
    
    // Simulate pressure distribution on lower surface
    // Positive near leading edge, approaching zero at trailing edge
    let cp = 1.0 * (1 - position) * (1 - Math.pow(position, 2));
    
    // Adjust based on angle of attack
    cp *= (1 + 0.1 * alpha);
    
    // Add some randomness for realism
    cp *= (0.95 + Math.random() * 0.1);
    
    pressureData.push({ x, y, cp });
  }
  
  return pressureData;
}

/**
 * Generates mock boundary layer transition points
 * Returns x/c positions where transition occurs on upper and lower surfaces
 */
export function generateTransitionPoints(alpha: number, reynolds: number): { upper: number; lower: number } {
  // In reality, transition depends on pressure gradient, Reynolds number, surface roughness, etc.
  // Here we'll use a simplified model based on angle of attack and Reynolds number
  
  // Higher Reynolds number moves transition point forward
  const reEffect = Math.min(0.8, Math.max(0.2, 1.0 - Math.log10(reynolds) / 8));
  
  // Higher alpha moves upper surface transition forward, lower surface transition backward
  const alphaEffect = Math.min(0.3, Math.max(-0.3, alpha / 30));
  
  // Calculate transition points (x/c)
  let upperTransition = reEffect - alphaEffect;
  let lowerTransition = reEffect + alphaEffect;
  
  // Add some randomness
  upperTransition = Math.min(0.9, Math.max(0.1, upperTransition * (0.95 + Math.random() * 0.1)));
  lowerTransition = Math.min(0.9, Math.max(0.1, lowerTransition * (0.95 + Math.random() * 0.1)));
  
  return {
    upper: upperTransition,
    lower: lowerTransition
  };
} 
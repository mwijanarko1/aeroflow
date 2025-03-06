import { NextRequest, NextResponse } from 'next/server';
import { generatePressureDistribution, generateTransitionPoints } from '../../utils/mockData';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { coordinates, alpha, reynolds, mach = 0, viscous = true } = data;

    // Mock implementation that returns simulated results based on input parameters
    // This allows testing the UI without requiring XFoil to be installed
    
    // Simple simulation of lift coefficient based on angle of attack
    // CL ≈ 2π * sin(alpha) for small angles
    const alphaRad = alpha * Math.PI / 180;
    const cl = 2 * Math.PI * Math.sin(alphaRad);
    
    // Simulate drag coefficient based on angle of attack and Reynolds number
    // CD increases with alpha^2 and decreases with Reynolds number
    const cd = 0.01 + 0.1 * Math.pow(Math.abs(alpha) / 10, 2) + (1e6 / reynolds) * 0.01;
    
    // Simulate moment coefficient
    // CM is typically negative and proportional to alpha for cambered airfoils
    const cm = -0.05 - 0.01 * alpha;

    // Add some randomness to make it look more realistic
    const randomFactor = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
    
    // Generate transition points
    const transitionPoints = generateTransitionPoints(alpha, reynolds);
    
    const results = {
      CL: cl * randomFactor,
      CD: cd * randomFactor,
      CM: cm * randomFactor,
      transitionPoints
    };

    console.log(`Mock analysis results for alpha=${alpha}, Re=${reynolds}:`, results);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze airfoil' },
      { status: 500 }
    );
  }
} 
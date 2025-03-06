import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const {
            coordinates,
            alpha_start,
            alpha_end,
            alpha_step,
            reynolds,
            mach = 0,
            viscous = true
        } = data;

        // Generate a range of alpha values
        const alphaValues = [];
        for (let alpha = alpha_start; alpha <= alpha_end; alpha += alpha_step) {
            alphaValues.push(alpha);
        }

        // Generate mock polar data
        const polarData = alphaValues.map(alpha => {
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

            // Simulate transition points
            const x_tr_upper = 0.3 - 0.2 * alphaRad + 0.1 * (1e6 / reynolds);
            const x_tr_lower = 0.4 + 0.2 * alphaRad + 0.1 * (1e6 / reynolds);
            
            return {
                alpha,
                CL: cl * randomFactor,
                CD: cd * randomFactor,
                CM: cm * randomFactor,
                transitionPoints: {
                    upper: x_tr_upper,
                    lower: x_tr_lower
                }
            };
        });

        console.log(`Generated polar data with ${polarData.length} points`);
        
        return NextResponse.json(polarData);
    } catch (error) {
        console.error('Polar generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate polar data' },
            { status: 500 }
        );
    }
} 
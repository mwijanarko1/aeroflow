'use client';

import {
    AnalysisRequest,
    AnalysisResponse,
    PolarRequest,
    PolarResponse,
} from '../types/xfoil';

export async function analyzeAirfoil(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to analyze airfoil: ${errorText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error analyzing airfoil:', error);
        throw error;
    }
}

export async function generatePolar(request: PolarRequest): Promise<PolarResponse> {
    try {
        const response = await fetch('/api/polar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to generate polar: ${errorText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error generating polar:', error);
        throw error;
    }
} 
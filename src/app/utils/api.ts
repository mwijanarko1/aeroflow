'use client';

import {
    AnalysisRequest,
    AnalysisResponse,
    PolarRequest,
    PolarResponse,
} from '../types/xfoil';

// Use the Python backend instead of the Next.js API routes
const API_BASE_URL = 'http://localhost:8000';

export async function analyzeAirfoil(request: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to analyze airfoil');
    }

    return response.json();
}

export async function generatePolar(request: PolarRequest): Promise<PolarResponse> {
    const response = await fetch(`${API_BASE_URL}/polar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate polar');
    }

    return response.json();
} 
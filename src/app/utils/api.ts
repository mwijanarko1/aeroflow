'use client';

import {
    AnalysisRequest,
    AnalysisResponse,
    PolarRequest,
    PolarResponse,
} from '../types/xfoil';

// Determine the API base URL based on the environment
const getApiBaseUrl = () => {
    // For development
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:8000';
    }
    
    // For production - use the same Vercel domain with /api route
    return 'https://aeroflow-nu.vercel.app/api';
};

const API_BASE_URL = getApiBaseUrl();

export async function analyzeAirfoil(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            mode: 'cors', // Explicitly set CORS mode
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
        const response = await fetch(`${API_BASE_URL}/polar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            mode: 'cors', // Explicitly set CORS mode
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
'use client';

import {
    AnalysisRequest,
    AnalysisResponse,
    PolarRequest,
    PolarResponse,
} from '../types/xfoil';

// Determine the API base URL based on the environment
const getApiBaseUrl = () => {
    // Check if we're running in a browser environment
    if (typeof window === 'undefined') {
        return 'http://localhost:8000';
    }

    // Get the current hostname
    const hostname = window.location.hostname;

    // If we're on localhost, use port 8000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }

    // For production (Vercel deployment)
    return 'https://aeroflow-api.vercel.app';
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
            credentials: 'include', // Include credentials if needed
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to analyze airfoil');
        }

        return response.json();
    } catch (error) {
        console.error('Error analyzing airfoil:', error);
        if (error instanceof Error && error.message.includes('CORS')) {
            throw new Error('Unable to connect to analysis server. Please ensure the server is running and accessible.');
        }
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
            credentials: 'include', // Include credentials if needed
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate polar');
        }

        return response.json();
    } catch (error) {
        console.error('Error generating polar:', error);
        if (error instanceof Error && error.message.includes('CORS')) {
            throw new Error('Unable to connect to analysis server. Please ensure the server is running and accessible.');
        }
        throw error;
    }
} 
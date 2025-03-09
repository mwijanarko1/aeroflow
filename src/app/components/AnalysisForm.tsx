'use client';

import React, { useState } from 'react';
import { AnalysisRequest, AnalysisResponse, Coordinates } from '../types/xfoil';
import { analyzeAirfoil } from '../utils/api';
import AnalysisResults from './AnalysisResults';

interface Props {
    coordinates: Coordinates;
}

interface AnalysisParams {
    alpha: number;
    reynolds: number;
    mach: number;
    viscous: boolean;
}

export default function AnalysisForm({ coordinates }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [results, setResults] = useState<AnalysisResponse | null>(null);
    const [formData, setFormData] = useState<AnalysisParams>({
        alpha: 0,
        reynolds: 1e6,
        mach: 0,
        viscous: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const analysisResults = await analyzeAirfoil({
                coordinates,
                ...formData
            });
            setResults(analysisResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze airfoil');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="alpha" className="block text-sm font-medium text-gray-700">
                            Angle of Attack (degrees)
                        </label>
                        <input
                            type="number"
                            id="alpha"
                            name="alpha"
                            step="0.5"
                            value={formData.alpha}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="reynolds" className="block text-sm font-medium text-gray-700">
                            Reynolds Number
                        </label>
                        <input
                            type="number"
                            id="reynolds"
                            name="reynolds"
                            step="100000"
                            value={formData.reynolds}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="mach" className="block text-sm font-medium text-gray-700">
                            Mach Number
                        </label>
                        <input
                            type="number"
                            id="mach"
                            name="mach"
                            step="0.01"
                            min="0"
                            max="1"
                            value={formData.mach}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="viscous"
                        name="viscous"
                        checked={formData.viscous}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="viscous" className="ml-2 block text-sm text-gray-900">
                        Viscous Analysis
                    </label>
                </div>

                {error && (
                    <div className="text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || coordinates.length === 0}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                        ${loading || coordinates.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                >
                    {loading ? 'Analyzing...' : 'Analyze Airfoil'}
                </button>
            </form>

            {results && (
                <AnalysisResults 
                    results={results} 
                    coordinates={coordinates}
                    analysisParams={formData}
                />
            )}
        </div>
    );
} 
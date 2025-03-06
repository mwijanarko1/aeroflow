'use client';

import React, { useState } from 'react';
import { PolarRequest, PolarResponse, Coordinates } from '../types/xfoil';
import { generatePolar } from '../utils/api';
import { Line } from 'react-chartjs-2';
import '../lib/chartConfig';
import SaveAnalysisButton from './SaveAnalysisButton';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    coordinates: Coordinates;
    nacaCode?: string;
}

export default function PolarForm({ coordinates, nacaCode }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [polarData, setPolarData] = useState<PolarResponse>([]);
    const [formData, setFormData] = useState<Omit<PolarRequest, 'coordinates'>>({
        alpha_start: -5,
        alpha_end: 15,
        alpha_step: 1,
        reynolds: 1e6,
        mach: 0,
        viscous: true
    });
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const results = await generatePolar({
                coordinates,
                ...formData
            });
            setPolarData(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate polar');
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

    // Prepare chart data for CL vs alpha
    const clAlphaData = {
        datasets: [
            {
                label: 'CL vs Alpha',
                data: polarData.map(point => ({ x: point.alpha, y: point.CL })),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
            }
        ]
    };

    // Prepare chart data for CL vs CD (drag polar)
    const clCdData = {
        datasets: [
            {
                label: 'CL vs CD',
                data: polarData.map(point => ({ x: point.CD, y: point.CL })),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1,
            }
        ]
    };

    // Prepare chart data for CM vs alpha
    const cmAlphaData = {
        datasets: [
            {
                label: 'CM vs Alpha',
                data: polarData.map(point => ({ x: point.alpha, y: point.CM })),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                tension: 0.1,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'linear' as const,
                title: {
                    display: true,
                }
            },
            y: {
                type: 'linear' as const,
                title: {
                    display: true,
                }
            }
        }
    };

    const clAlphaOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            x: {
                ...chartOptions.scales.x,
                title: {
                    display: true,
                    text: 'Alpha (degrees)'
                }
            },
            y: {
                ...chartOptions.scales.y,
                title: {
                    display: true,
                    text: 'CL'
                }
            }
        }
    };

    const clCdOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            x: {
                ...chartOptions.scales.x,
                title: {
                    display: true,
                    text: 'CD'
                }
            },
            y: {
                ...chartOptions.scales.y,
                title: {
                    display: true,
                    text: 'CL'
                }
            }
        }
    };

    const cmAlphaOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            x: {
                ...chartOptions.scales.x,
                title: {
                    display: true,
                    text: 'Alpha (degrees)'
                }
            },
            y: {
                ...chartOptions.scales.y,
                title: {
                    display: true,
                    text: 'CM'
                }
            }
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="alpha_start" className="block text-sm font-medium text-gray-700">
                            Start Alpha (degrees)
                        </label>
                        <input
                            type="number"
                            id="alpha_start"
                            name="alpha_start"
                            step="0.5"
                            value={formData.alpha_start}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="alpha_end" className="block text-sm font-medium text-gray-700">
                            End Alpha (degrees)
                        </label>
                        <input
                            type="number"
                            id="alpha_end"
                            name="alpha_end"
                            step="0.5"
                            value={formData.alpha_end}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="alpha_step" className="block text-sm font-medium text-gray-700">
                            Alpha Step (degrees)
                        </label>
                        <input
                            type="number"
                            id="alpha_step"
                            name="alpha_step"
                            step="0.1"
                            min="0.1"
                            value={formData.alpha_step}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {loading ? 'Generating...' : 'Generate Polar'}
                </button>
            </form>

            {polarData.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Polar Results</h3>
                        <SaveAnalysisButton
                            coordinates={coordinates}
                            nacaCode={nacaCode}
                            analysisData={{
                                alpha: polarData.map(p => p.alpha),
                                cl: polarData.map(p => p.CL),
                                cd: polarData.map(p => p.CD),
                                cm: polarData.map(p => p.CM)
                            }}
                            settings={{
                                reynolds: formData.reynolds,
                                mach: formData.mach,
                                viscous: formData.viscous ?? true
                            }}
                            analysisType="polar"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-80 border rounded-lg p-4">
                            <Line data={clAlphaData} options={clAlphaOptions} />
                        </div>
                        
                        <div className="h-80 border rounded-lg p-4">
                            <Line data={clCdData} options={clCdOptions} />
                        </div>
                        
                        <div className="h-80 border rounded-lg p-4">
                            <Line data={cmAlphaData} options={cmAlphaOptions} />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Alpha (deg)
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        CL
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        CD
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        CM
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {polarData.map((point, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {point.alpha.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {point.CL.toFixed(4)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {point.CD.toFixed(4)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {point.CM.toFixed(4)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Want to save these polar results?</h3>
                                <div className="mt-1 text-sm text-blue-700">
                                    <p>Sign in to save your polar data and create a personal library of airfoil analyses.</p>
                                </div>
                                <div className="mt-3">
                                    <button 
                                        onClick={() => setShowAuthModal(true)} 
                                        className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Sign In</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Sign in to save your analysis results and access them later.
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    setShowAuthModal(false);
                                    document.querySelector<HTMLButtonElement>('[data-auth-button="true"]')?.click();
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                            >
                                Continue to Sign In
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
'use client';

import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Coordinates } from '../types/xfoil';
import { generateNACACoordinates } from '../utils/naca';
import '../lib/chartConfig';

interface Props {
    onCoordinatesGenerated: (coordinates: Coordinates) => void;
}

export default function NACAInput({ onCoordinatesGenerated }: Props) {
    const [nacaNumber, setNacaNumber] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [coordinates, setCoordinates] = useState<Coordinates>([]);
    const [numPoints, setNumPoints] = useState<number>(100);
    const [closedTE, setClosedTE] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const coords = generateNACACoordinates(nacaNumber, numPoints, closedTE);
            setCoordinates(coords);
            onCoordinatesGenerated(coords);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate airfoil');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.slice(0, 4); // Limit to 4 digits
        setNacaNumber(value);
        
        // Clear any previous error when user starts typing
        if (error) {
            setError('');
        }
    };

    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 20 && value <= 500) {
            setNumPoints(value);
        }
    };

    const handleClosedTEChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClosedTE(e.target.checked);
    };

    // Calculate chart bounds to maintain proper scaling
    const xMin = coordinates.length > 0 ? Math.min(...coordinates.map(([x]) => x)) : 0;
    const xMax = coordinates.length > 0 ? Math.max(...coordinates.map(([x]) => x)) : 1;
    const yMin = coordinates.length > 0 ? Math.min(...coordinates.map(([_, y]) => y)) : -0.2;
    const yMax = coordinates.length > 0 ? Math.max(...coordinates.map(([_, y]) => y)) : 0.2;
    
    // Calculate padding to maintain aspect ratio
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const padding = Math.max(xRange, yRange) * 0.1;

    // Calculate the mean camber line if it's a cambered airfoil
    let camberLineData = null;
    if (coordinates.length > 0 && nacaNumber && nacaNumber[0] !== '0') {
        // Extract NACA parameters
        const m = parseInt(nacaNumber[0]) / 100;  // Maximum camber
        const p = parseInt(nacaNumber[1]) / 10;   // Location of maximum camber
        
        // Generate x points for camber line
        const xPoints = Array.from({ length: 100 }, (_, i) => i / 99);
        
        // Calculate camber line using the same equations as in naca.ts
        const camberPoints = xPoints.map(x => {
            let y;
            if (x <= p) {
                y = (m / Math.pow(p, 2)) * (2 * p * x - Math.pow(x, 2));
            } else {
                y = (m / Math.pow(1 - p, 2)) * (1 - 2 * p + 2 * p * x - Math.pow(x, 2));
            }
            return { x, y };
        });
        
        camberLineData = {
            label: 'Mean Camber Line',
            data: camberPoints,
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
            tension: 0,
            fill: false,
            pointRadius: 0,
        };
    }

    const chartData = {
        datasets: [
            {
                label: `NACA ${nacaNumber}`,
                data: coordinates.map(([x, y]) => ({ x, y })),
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                tension: 0,
                fill: false,
                pointRadius: 0, // Hide points to show only the line
            },
            ...(camberLineData ? [camberLineData] : [])
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        scales: {
            x: {
                type: 'linear' as const,
                position: 'center' as const,
                min: -0.05,
                max: 1.05,
                title: {
                    display: true,
                    text: 'x/c'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawTicks: true,
                }
            },
            y: {
                type: 'linear' as const,
                position: 'center' as const,
                min: yMin - padding,
                max: yMax + padding,
                title: {
                    display: true,
                    text: 'y/c'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawTicks: true,
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
            tooltip: {
                enabled: false // Disable tooltips for cleaner visualization
            }
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="naca" className="block text-sm font-medium text-gray-700">
                        NACA Number
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            NACA
                        </span>
                        <input
                            type="text"
                            id="naca"
                            name="naca"
                            value={nacaNumber}
                            onChange={handleInputChange}
                            pattern="[0-9]{4}"
                            maxLength={4}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="0012"
                        />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        Enter a 4-digit NACA airfoil number (e.g., 0012, 2412)
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                            Number of Points
                        </label>
                        <input
                            type="number"
                            id="points"
                            name="points"
                            value={numPoints}
                            onChange={handlePointsChange}
                            min={20}
                            max={500}
                            className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Number of points to generate (20-500)
                        </p>
                    </div>

                    <div className="flex items-center mt-6">
                        <input
                            type="checkbox"
                            id="closedTE"
                            name="closedTE"
                            checked={closedTE}
                            onChange={handleClosedTEChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="closedTE" className="ml-2 block text-sm text-gray-700">
                            Closed Trailing Edge
                        </label>
                        <p className="ml-2 text-sm text-gray-500">
                            (a4 = -0.1036 instead of -0.1015)
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Generate Airfoil
                </button>
            </form>

            {coordinates.length > 0 && (
                <div className="border rounded-lg p-4">
                    <div className="mb-2 text-sm text-gray-700">
                        <strong>NACA {nacaNumber}:</strong> {nacaNumber[0] !== '0' ? (
                            <>
                                {parseInt(nacaNumber[0])}% camber at {parseInt(nacaNumber[1])*10}% chord, {parseInt(nacaNumber.slice(2))}% thickness
                            </>
                        ) : (
                            <>
                                Symmetric airfoil with {parseInt(nacaNumber.slice(2))}% thickness
                            </>
                        )}
                    </div>
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}
        </div>
    );
} 
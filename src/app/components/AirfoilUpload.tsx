'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Line } from 'react-chartjs-2';
import '../lib/chartConfig';
import { Coordinates } from '../types/xfoil';

interface Props {
    onCoordinatesLoaded: (coordinates: Coordinates) => void;
}

export default function AirfoilUpload({ onCoordinatesLoaded }: Props) {
    const [coordinates, setCoordinates] = useState<Coordinates>([]);
    const [error, setError] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const text = reader.result as string;
                const lines = text.split('\n');
                
                // Skip header line if it exists
                const startLine = isNaN(Number(lines[0].split(/\s+/)[0])) ? 1 : 0;
                
                const coords: Coordinates = lines
                    .slice(startLine)
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map(line => {
                        const [x, y] = line.split(/\s+/).map(Number);
                        if (isNaN(x) || isNaN(y)) {
                            throw new Error('Invalid coordinate format');
                        }
                        return [x, y];
                    });

                setCoordinates(coords);
                setFileName(file.name.replace(/\.[^/.]+$/, "")); // Remove file extension
                onCoordinatesLoaded(coords);
                setError('');
            } catch (err) {
                setError('Failed to parse airfoil file. Please ensure it contains x y coordinates.');
            }
        };

        reader.readAsText(file);
    }, [onCoordinatesLoaded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.dat', '.txt']
        },
        multiple: false
    });

    // Calculate chart bounds to maintain proper scaling
    const xMin = coordinates.length > 0 ? Math.min(...coordinates.map(([x]) => x)) : 0;
    const xMax = coordinates.length > 0 ? Math.max(...coordinates.map(([x]) => x)) : 1;
    const yMin = coordinates.length > 0 ? Math.min(...coordinates.map(([_, y]) => y)) : -0.2;
    const yMax = coordinates.length > 0 ? Math.max(...coordinates.map(([_, y]) => y)) : 0.2;
    
    // Calculate padding to maintain aspect ratio
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const padding = Math.max(xRange, yRange) * 0.1;

    const chartData = {
        datasets: [
            {
                label: fileName || 'Airfoil Profile',
                data: coordinates.map(([x, y]) => ({ x, y })),
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                tension: 0,
                fill: false,
                pointRadius: 0, // Hide points to show only the line
            }
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
            <div
                {...getRootProps()}
                className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the airfoil file here...</p>
                ) : (
                    <p>Drag and drop an airfoil file here, or click to select</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                    Accepts .dat or .txt files with x y coordinates
                </p>
            </div>

            {error && (
                <div className="text-red-500 text-sm">
                    {error}
                </div>
            )}

            {coordinates.length > 0 && (
                <div className="border rounded-lg p-4">
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}
        </div>
    );
} 
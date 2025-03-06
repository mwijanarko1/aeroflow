'use client';

import React, { useState } from 'react';
import NACAInput from './NACAInput';
import AirfoilUpload from './AirfoilUpload';
import { Coordinates } from '../types/xfoil';

interface Props {
    onCoordinatesLoaded: (coordinates: Coordinates) => void;
}

export default function AirfoilInput({ onCoordinatesLoaded }: Props) {
    const [activeTab, setActiveTab] = useState<'naca' | 'upload'>('naca');

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('naca')}
                        className={`
                            py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === 'naca'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                        `}
                    >
                        NACA Airfoil
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`
                            py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === 'upload'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                        `}
                    >
                        Upload Coordinates
                    </button>
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'naca' ? (
                <NACAInput onCoordinatesGenerated={onCoordinatesLoaded} />
            ) : (
                <AirfoilUpload onCoordinatesLoaded={onCoordinatesLoaded} />
            )}
        </div>
    );
} 
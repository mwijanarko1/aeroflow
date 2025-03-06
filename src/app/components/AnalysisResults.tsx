'use client';

import React, { useState } from 'react';
import { AnalysisResponse } from '../types/xfoil';
import { useAuth } from '../contexts/AuthContext';
import SaveAnalysisButton from './SaveAnalysisButton';

interface Props {
    results: AnalysisResponse;
    coordinates?: number[][];
    analysisParams?: {
        alpha: number;
        reynolds: number;
        mach: number;
        viscous: boolean;
    };
}

export default function AnalysisResults({ results, coordinates, analysisParams }: Props) {
    const { user } = useAuth();

    if (!coordinates || !analysisParams) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Analysis Results
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Aerodynamic coefficients calculated for the airfoil
                    </p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Lift Coefficient (CL)
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {results.CL.toFixed(4)}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Drag Coefficient (CD)
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {results.CD.toFixed(4)}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Moment Coefficient (CM)
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {results.CM.toFixed(4)}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Lift-to-Drag Ratio (L/D)
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {(results.CL / results.CD).toFixed(2)}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="flex space-x-4">
                <SaveAnalysisButton
                    coordinates={coordinates as [number, number][]}
                    analysisData={{
                        alpha: analysisParams.alpha,
                        cl: results.CL,
                        cd: results.CD,
                        cm: results.CM
                    }}
                    settings={{
                        reynolds: analysisParams.reynolds,
                        mach: analysisParams.mach,
                        viscous: analysisParams.viscous
                    }}
                    analysisType="single-point"
                />
            </div>
        </div>
    );
} 
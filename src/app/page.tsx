'use client';

import React, { useState } from 'react';
import AirfoilGenerator from '../app/components/AirfoilGenerator';
import AirfoilPlot from '../app/components/AirfoilPlot';
import AnalysisForm from '../app/components/AnalysisForm';
import PolarForm from '../app/components/PolarForm';
import { Coordinates } from './types/xfoil';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

export default function Home() {
    const [coordinates, setCoordinates] = useState<Coordinates>([]);
    const [nacaCode, setNacaCode] = useState<string>('');

    const handleAirfoilGenerate = (coords: Coordinates, code: string) => {
        setCoordinates(coords);
        setNacaCode(code);
    };

    return (
        <div className="animate-fade-in">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                        Advanced Airfoil Analysis & Design
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Design, analyze, and optimize airfoils with precision using our powerful computational fluid dynamics tools.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card animate-slide-up" style={{animationDelay: '0.1s'}}>
                            <div className="card-header bg-gradient-to-r from-blue-50 to-cyan-50">
                                <div className="flex items-center">
                                    <svg className="h-6 w-6 text-blue-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 4L3 9L12 14L21 9L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <h2 className="text-xl font-semibold text-gray-900">Airfoil Generator</h2>
                                </div>
                            </div>
                            <div className="card-body">
                                <AirfoilGenerator onGenerate={handleAirfoilGenerate} />
                            </div>
                        </div>
                        
                        <div className="card animate-slide-up" style={{animationDelay: '0.2s'}}>
                            <div className="card-header bg-gradient-to-r from-blue-50 to-cyan-50">
                                <div className="flex items-center">
                                    <svg className="h-6 w-6 text-blue-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    <h2 className="text-xl font-semibold text-gray-900">Airfoil Visualization</h2>
                                </div>
                            </div>
                            <div className="card-body">
                                <AirfoilPlot coordinates={coordinates} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-2 animate-slide-up" style={{animationDelay: '0.3s'}}>
                        <div className="card h-full">
                            <div className="card-header bg-gradient-to-r from-blue-50 to-cyan-50">
                                <Tabs defaultValue="analysis" className="w-full">
                                    <div className="mb-0 bg-transparent p-0 space-x-2">
                                        <TabsList className="bg-transparent p-0 space-x-2">
                                            <TabsTrigger value="analysis" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2 rounded-t-lg font-medium text-gray-600 transition-all">
                                                Single-Point Analysis
                                            </TabsTrigger>
                                            <TabsTrigger value="polar" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2 rounded-t-lg font-medium text-gray-600 transition-all">
                                                Polar Generation
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                
                                    <TabsContent value="analysis" className="mt-0 pt-6">
                                        <div className="flex items-center mb-4">
                                            <svg className="h-6 w-6 text-blue-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 8L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M8 8L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <h2 className="text-xl font-semibold text-gray-900">Airfoil Analysis</h2>
                                        </div>
                                        <AnalysisForm coordinates={coordinates} />
                                    </TabsContent>
                                    
                                    <TabsContent value="polar" className="mt-0 pt-6">
                                        <div className="flex items-center mb-4">
                                            <svg className="h-6 w-6 text-blue-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                                                <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                            <h2 className="text-xl font-semibold text-gray-900">Polar Generation</h2>
                                        </div>
                                        <PolarForm coordinates={coordinates} nacaCode={nacaCode} />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
                    <div className="card p-6">
                        <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                            <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Comprehensive Analysis</h3>
                        <p className="text-gray-600">Detailed aerodynamic analysis including lift, drag, moment coefficients, and pressure distributions.</p>
                    </div>
                    
                    <div className="card p-6">
                        <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                            <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L3 9L12 14L21 9L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3 14L12 19L21 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">NACA Airfoil Generation</h3>
                        <p className="text-gray-600">Generate standard NACA airfoils with precise control over parameters and visualization.</p>
                    </div>
                    
                    <div className="card p-6">
                        <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                            <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 17L15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 6V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Performance Optimization</h3>
                        <p className="text-gray-600">Optimize airfoil designs for specific flight conditions and performance requirements.</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 
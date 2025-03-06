'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SavedAnalysis } from '../types/xfoil';

interface Props {
  coordinates: [number, number][];
  nacaCode?: string;
  analysisData: {
    alpha: number | number[];
    cl: number | number[];
    cd: number | number[];
    cm: number | number[];
  };
  settings: {
    reynolds: number;
    mach?: number;
    viscous: boolean;
  };
  analysisType: 'single-point' | 'polar';
  onSaveSuccess?: () => void;
}

export default function SaveAnalysisButton({ 
  coordinates, 
  nacaCode, 
  analysisData, 
  settings,
  analysisType,
  onSaveSuccess 
}: Props) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const generateAnalysisText = (): string => {
    const timestamp = new Date().toISOString();
    let text = '';

    // Header
    text += '='.repeat(80) + '\n';
    text += `XFOIL.ai Analysis Results\n`;
    text += `Generated: ${timestamp}\n`;
    text += `Analysis Type: ${analysisType === 'polar' ? 'Polar Analysis' : 'Single-Point Analysis'}\n`;
    text += '='.repeat(80) + '\n\n';

    // Analysis Settings
    text += 'Analysis Settings:\n';
    text += '-'.repeat(40) + '\n';
    if (nacaCode) {
      text += `NACA Airfoil: ${nacaCode}\n`;
    }
    text += `Reynolds Number: ${settings.reynolds.toExponential(2)}\n`;
    text += `Mach Number: ${settings.mach?.toFixed(3) || '0.000'}\n`;
    text += `Viscous Analysis: ${settings.viscous ? 'Yes' : 'No'}\n\n`;

    // Coordinates
    text += 'Airfoil Coordinates:\n';
    text += '-'.repeat(40) + '\n';
    text += 'X           Y\n';
    coordinates.forEach(([x, y]) => {
      text += `${x.toFixed(6).padStart(10)} ${y.toFixed(6).padStart(10)}\n`;
    });
    text += '\n';

    // Analysis Results
    text += 'Analysis Results:\n';
    text += '-'.repeat(40) + '\n';

    if (analysisType === 'single-point') {
      text += `Alpha: ${(analysisData.alpha as number).toFixed(3)}°\n`;
      text += `CL: ${(analysisData.cl as number).toFixed(4)}\n`;
      text += `CD: ${(analysisData.cd as number).toFixed(4)}\n`;
      text += `CM: ${(analysisData.cm as number).toFixed(4)}\n`;
    } else {
      text += 'Alpha        CL         CD         CM\n';
      const alphas = analysisData.alpha as number[];
      const cls = analysisData.cl as number[];
      const cds = analysisData.cd as number[];
      const cms = analysisData.cm as number[];
      
      for (let i = 0; i < alphas.length; i++) {
        text += `${alphas[i].toFixed(3).padStart(8)}° `;
        text += `${cls[i].toFixed(4).padStart(10)} `;
        text += `${cds[i].toFixed(4).padStart(10)} `;
        text += `${cms[i].toFixed(4).padStart(10)}\n`;
      }
    }

    return text;
  };

  const downloadAnalysisFile = () => {
    const text = generateAnalysisText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || 'analysis'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setError('');

    try {
      const analysis: Omit<SavedAnalysis, 'id'> = {
        userId: user.uid,
        name,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
        airfoilData: {
          coordinates,
          nacaCode
        },
        analysisData: {
          alpha: Array.isArray(analysisData.alpha) ? analysisData.alpha : [analysisData.alpha],
          cl: Array.isArray(analysisData.cl) ? analysisData.cl : [analysisData.cl],
          cd: Array.isArray(analysisData.cd) ? analysisData.cd : [analysisData.cd],
          cm: Array.isArray(analysisData.cm) ? analysisData.cm : [analysisData.cm]
        },
        settings,
        analysisType
      };

      // TODO: Save to your database
      // const response = await fetch('/api/analyses', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(analysis)
      // });

      // Download the analysis file
      downloadAnalysisFile();

      setShowModal(false);
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setError('Failed to save analysis. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        Save {analysisType === 'polar' ? 'Polar' : 'Analysis'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Save {analysisType === 'polar' ? 'Polar Analysis' : 'Single-Point Analysis'}
            </h3>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                  placeholder={analysisType === 'polar' ? 'My Polar Analysis' : 'My Analysis'}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This name will be used for the downloaded file: [name].txt
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Add notes about this analysis..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save & Download'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 
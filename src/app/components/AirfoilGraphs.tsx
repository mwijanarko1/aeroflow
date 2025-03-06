'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AirfoilGraphsProps {
  clData: { alpha: number; cl: number }[];
  cdData: { cl: number; cd: number }[];
  cpData: { x: number; cp: number }[];
  blData?: {
    x: number;
    h: number;     // Shape parameter
    theta: number; // Momentum thickness
    cf: number;    // Skin friction coefficient
  }[];
}

export default function AirfoilGraphs({ clData, cdData, cpData, blData }: AirfoilGraphsProps) {
  return (
    <div className="space-y-8">
      {/* Cl vs Alpha */}
      <div className="h-64">
        <h4 className="text-sm font-medium mb-2">Lift Coefficient vs Angle of Attack</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={clData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="alpha"
              label={{ value: 'Angle of Attack (°)', position: 'insideBottom', offset: -5 }}
              type="number"
            />
            <YAxis
              label={{ value: 'Cl', angle: -90, position: 'insideLeft' }}
              type="number"
            />
            <Tooltip />
            <Line type="monotone" dataKey="cl" stroke="#2563eb" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cd vs Cl (Drag Polar) */}
      <div className="h-64">
        <h4 className="text-sm font-medium mb-2">Drag Polar</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cdData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="cd"
              label={{ value: 'Cd', position: 'insideBottom', offset: -5 }}
              type="number"
              domain={['auto', 'auto']}
            />
            <YAxis
              dataKey="cl"
              label={{ value: 'Cl', angle: -90, position: 'insideLeft' }}
              type="number"
            />
            <Tooltip />
            <Line type="monotone" dataKey="cl" stroke="#2563eb" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pressure Distribution */}
      <div className="h-64">
        <h4 className="text-sm font-medium mb-2">Pressure Distribution</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cpData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              label={{ value: 'x/c', position: 'insideBottom', offset: -5 }}
              type="number"
            />
            <YAxis
              dataKey="cp"
              label={{ value: 'Cp', angle: -90, position: 'insideLeft' }}
              type="number"
              reversed
            />
            <Tooltip />
            <Line type="monotone" dataKey="cp" stroke="#2563eb" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Boundary Layer Parameters */}
      {blData && blData.length > 0 && (
        <>
          {/* Shape Parameter */}
          <div className="h-64">
            <h4 className="text-sm font-medium mb-2">Shape Parameter Distribution</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={blData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  label={{ value: 'x/c', position: 'insideBottom', offset: -5 }}
                  type="number"
                />
                <YAxis
                  dataKey="h"
                  label={{ value: 'H', angle: -90, position: 'insideLeft' }}
                  type="number"
                />
                <Tooltip />
                <Line type="monotone" dataKey="h" stroke="#2563eb" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Skin Friction */}
          <div className="h-64">
            <h4 className="text-sm font-medium mb-2">Skin Friction Distribution</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={blData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  label={{ value: 'x/c', position: 'insideBottom', offset: -5 }}
                  type="number"
                />
                <YAxis
                  dataKey="cf"
                  label={{ value: 'Cf', angle: -90, position: 'insideLeft' }}
                  type="number"
                />
                <Tooltip />
                <Line type="monotone" dataKey="cf" stroke="#2563eb" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
} 
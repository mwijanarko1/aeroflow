import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation | AeroFlow',
  description: 'Comprehensive documentation of equations and formulas used in AeroFlow airfoil analysis',
};

export default function DocumentationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">AeroFlow Documentation</h1>
      <p className="mb-8 text-gray-600">
        This documentation provides a comprehensive overview of the equations and formulas used in AeroFlow for airfoil analysis.
      </p>

      <div className="space-y-12">
        {/* NACA Airfoil Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">NACA 4-Digit Airfoil Series</h2>
          <p className="mb-4">
            The NACA 4-digit airfoil series is defined by the following parameters:
          </p>
          
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">NACA MPXX</h3>
            <p className="mb-2">Where:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>M</strong> is the maximum camber divided by 100. For example, in NACA 2412, M=2 means the maximum camber is 0.02 or 2% of the chord.</li>
              <li><strong>P</strong> is the position of the maximum camber divided by 10. For example, in NACA 2412, P=4 means the maximum camber is at 0.4 or 40% of the chord.</li>
              <li><strong>XX</strong> is the thickness divided by 100. For example, in NACA 2412, XX=12 means the thickness is 0.12 or 12% of the chord.</li>
            </ul>
          </div>

          <h3 className="text-xl font-medium mb-3">Camber Line Equations</h3>
          <p className="mb-2">The equation for the camber line is split into sections either side of the point of maximum camber position (P):</p>
          
          <div className="mb-4 bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Front (0 ≤ x &lt; p)</h4>
            <div className="font-mono bg-gray-100 p-2 rounded">
              yc = (M/p²) * (2px - x²)
            </div>
          </div>
          
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Back (p ≤ x ≤ 1)</h4>
            <div className="font-mono bg-gray-100 p-2 rounded">
              yc = (M/(1-p)²) * (1 - 2p + 2px - x²)
            </div>
          </div>

          <h3 className="text-xl font-medium mb-3">Gradient of Camber Line</h3>
          
          <div className="mb-4 bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Front (0 ≤ x &lt; p)</h4>
            <div className="font-mono bg-gray-100 p-2 rounded">
              dyc/dx = (2M/p²) * (p - x)
            </div>
          </div>
          
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Back (p ≤ x ≤ 1)</h4>
            <div className="font-mono bg-gray-100 p-2 rounded">
              dyc/dx = (2M/(1-p)²) * (p - x)
            </div>
          </div>

          <h3 className="text-xl font-medium mb-3">Thickness Distribution</h3>
          <div className="mb-4 bg-gray-50 p-4 rounded-md">
            <div className="font-mono bg-gray-100 p-2 rounded">
              yt = (T/0.2) * (a₀x^0.5 + a₁x + a₂x² + a₃x³ + a₄x⁴)
            </div>
            <p className="mt-2">Where:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>a₀ = 0.2969</li>
              <li>a₁ = -0.126</li>
              <li>a₂ = -0.3516</li>
              <li>a₃ = 0.2843</li>
              <li>a₄ = -0.1015 (for open trailing edge) or -0.1036 (for closed trailing edge)</li>
            </ul>
          </div>
          
          <p className="mb-4">
            The value of yt is a half thickness and needs to be applied both sides of the camber line.
          </p>

          <h3 className="text-xl font-medium mb-3">Final Airfoil Coordinates</h3>
          <p className="mb-2">Using the equations above, for a given value of x, we calculate:</p>
          <ol className="list-decimal pl-6 mb-4 space-y-1">
            <li>The camber line position (yc)</li>
            <li>The gradient of the camber line (dyc/dx)</li>
            <li>The thickness (yt)</li>
          </ol>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="mb-2">The position of the upper and lower surface can then be calculated perpendicular to the camber line:</p>
            <div className="font-mono bg-gray-100 p-2 rounded mb-2">
              θ = atan(dyc/dx)
            </div>
            <p className="font-medium mt-3 mb-1">Upper Surface:</p>
            <div className="font-mono bg-gray-100 p-2 rounded mb-2">
              xu = xc - yt * sin(θ)<br />
              yu = yc + yt * cos(θ)
            </div>
            <p className="font-medium mt-3 mb-1">Lower Surface:</p>
            <div className="font-mono bg-gray-100 p-2 rounded">
              xl = xc + yt * sin(θ)<br />
              yl = yc - yt * cos(θ)
            </div>
          </div>
        </section>

        {/* Aerodynamic Analysis Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Aerodynamic Analysis</h2>
          
          <h3 className="text-xl font-medium mb-3">Lift Coefficient (Cl)</h3>
          <p className="mb-2">
            The lift coefficient is a dimensionless quantity that relates the lift generated by an airfoil to the fluid density, velocity, and an associated reference area.
          </p>
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <div className="font-mono bg-gray-100 p-2 rounded">
              Cl = L / (0.5 * ρ * V² * S)
            </div>
            <p className="mt-2">Where:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>L = Lift force</li>
              <li>ρ = Air density</li>
              <li>V = Airspeed</li>
              <li>S = Reference area (typically chord length for 2D airfoils)</li>
            </ul>
          </div>

          <h3 className="text-xl font-medium mb-3">Drag Coefficient (Cd)</h3>
          <p className="mb-2">
            The drag coefficient is a dimensionless quantity that relates the drag force to the fluid density, velocity, and an associated reference area.
          </p>
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <div className="font-mono bg-gray-100 p-2 rounded">
              Cd = D / (0.5 * ρ * V² * S)
            </div>
            <p className="mt-2">Where:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>D = Drag force</li>
              <li>ρ = Air density</li>
              <li>V = Airspeed</li>
              <li>S = Reference area (typically chord length for 2D airfoils)</li>
            </ul>
          </div>

          <h3 className="text-xl font-medium mb-3">Moment Coefficient (Cm)</h3>
          <p className="mb-2">
            The moment coefficient is a dimensionless quantity that relates the pitching moment to the fluid density, velocity, reference area, and a reference length.
          </p>
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <div className="font-mono bg-gray-100 p-2 rounded">
              Cm = M / (0.5 * ρ * V² * S * c)
            </div>
            <p className="mt-2">Where:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>M = Pitching moment</li>
              <li>ρ = Air density</li>
              <li>V = Airspeed</li>
              <li>S = Reference area</li>
              <li>c = Chord length</li>
            </ul>
          </div>

          <h3 className="text-xl font-medium mb-3">Reynolds Number</h3>
          <p className="mb-2">
            The Reynolds number is a dimensionless quantity that helps predict flow patterns in different fluid flow situations.
          </p>
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <div className="font-mono bg-gray-100 p-2 rounded">
              Re = (ρ * V * L) / μ
            </div>
            <p className="mt-2">Where:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>ρ = Fluid density</li>
              <li>V = Flow velocity</li>
              <li>L = Characteristic length (chord length for airfoils)</li>
              <li>μ = Dynamic viscosity of the fluid</li>
            </ul>
          </div>

          <h3 className="text-xl font-medium mb-3">Pressure Coefficient (Cp)</h3>
          <p className="mb-2">
            The pressure coefficient is a dimensionless number that describes the relative pressures throughout a flow field.
          </p>
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <div className="font-mono bg-gray-100 p-2 rounded">
              Cp = (p - p∞) / (0.5 * ρ * V²)
            </div>
            <p className="mt-2">Where:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>p = Pressure at the point of interest</li>
              <li>p∞ = Free-stream pressure</li>
              <li>ρ = Fluid density</li>
              <li>V = Free-stream velocity</li>
            </ul>
          </div>
        </section>

        {/* XFoil Analysis Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">XFoil Analysis Methods</h2>
          
          <p className="mb-4">
            XFoil uses a combination of panel methods and boundary layer formulations to analyze airfoils:
          </p>

          <h3 className="text-xl font-medium mb-3">Panel Method</h3>
          <p className="mb-4">
            XFoil uses a linear vorticity stream function panel method for the inviscid formulation. The airfoil is represented by a distribution of panel elements.
          </p>

          <h3 className="text-xl font-medium mb-3">Boundary Layer Formulation</h3>
          <p className="mb-4">
            XFoil uses a two-equation lagged dissipation integral boundary layer formulation and an envelope e^n transition criterion, which is used to determine the transition from laminar to turbulent flow.
          </p>

          <h3 className="text-xl font-medium mb-3">Viscous-Inviscid Interaction</h3>
          <p className="mb-4">
            The boundary layer and transition are interacted with the incompressible potential flow via the surface transpiration model, which allows XFoil to predict the limited separation regions.
          </p>

          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2 text-blue-700">Key Features of XFoil Analysis:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Viscous and inviscid flow analysis</li>
              <li>Transition prediction</li>
              <li>Limited trailing edge separation modeling</li>
              <li>Compressibility corrections for subsonic flow</li>
              <li>Karman-Tsien correction for compressibility effects</li>
              <li>Polar generation over a range of angles of attack</li>
            </ul>
          </div>
        </section>

        {/* Performance Metrics Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Performance Metrics</h2>
          
          <h3 className="text-xl font-medium mb-3">Lift-to-Drag Ratio (L/D)</h3>
          <p className="mb-2">
            The lift-to-drag ratio is a measure of the aerodynamic efficiency of an airfoil.
          </p>
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <div className="font-mono bg-gray-100 p-2 rounded">
              L/D = Cl / Cd
            </div>
          </div>

          <h3 className="text-xl font-medium mb-3">Stall Angle</h3>
          <p className="mb-4">
            The stall angle is the angle of attack at which the lift coefficient reaches its maximum value before decreasing with further increase in angle of attack.
          </p>

          <h3 className="text-xl font-medium mb-3">Zero-Lift Angle of Attack</h3>
          <p className="mb-4">
            The angle of attack at which the airfoil produces zero lift.
          </p>

          <h3 className="text-xl font-medium mb-3">Moment Coefficient at Zero Lift (Cm0)</h3>
          <p className="mb-4">
            The pitching moment coefficient when the airfoil is producing zero lift.
          </p>

          <h3 className="text-xl font-medium mb-3">Aerodynamic Center</h3>
          <p className="mb-2">
            The point on the airfoil about which the pitching moment remains approximately constant as the angle of attack changes.
          </p>
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <p>For a typical subsonic airfoil, the aerodynamic center is located approximately at the quarter-chord point (25% of the chord from the leading edge).</p>
          </div>
        </section>
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">Need to Save Your Analysis?</h2>
        <p className="mb-4">
          Sign in to save your airfoil designs, analysis results, and create a personal library of airfoils for future reference.
        </p>
        <a href="#" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
          Sign In
        </a>
      </div>
    </div>
  );
} 
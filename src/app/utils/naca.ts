'use client';

import { Coordinates } from '../types/xfoil';

function camberLine(x: number, m: number, p: number): number {
    if (x >= 0 && x <= p) {
        return (m / Math.pow(p, 2)) * (2 * p * x - Math.pow(x, 2));
    } else {
        return (m / Math.pow(1 - p, 2)) * (1 - 2 * p + 2 * p * x - Math.pow(x, 2));
    }
}

function dycOverDx(x: number, m: number, p: number): number {
    if (x >= 0 && x <= p) {
        return (2 * m / Math.pow(p, 2)) * (p - x);
    } else {
        return (2 * m / Math.pow(1 - p, 2)) * (p - x);
    }
}

function thickness(x: number, t: number, closedTE: boolean = false): number {
    const a0 = 0.2969;
    const a1 = -0.126;
    const a2 = -0.3516;
    const a3 = 0.2843;
    // Use -0.1015 for open trailing edge, -0.1036 for closed trailing edge
    const a4 = closedTE ? -0.1036 : -0.1015;
    
    return (t / 0.2) * (
        a0 * Math.sqrt(x) +
        a1 * x +
        a2 * Math.pow(x, 2) +
        a3 * Math.pow(x, 3) +
        a4 * Math.pow(x, 4)
    );
}

function generateNACA4Coordinates(nacaNumber: string, numPoints: number = 100, closedTE: boolean = false): Coordinates {
    // Parse NACA digits
    const m = parseInt(nacaNumber[0]) / 100;  // Maximum camber
    const p = parseInt(nacaNumber[1]) / 10;   // Location of maximum camber
    const t = parseInt(nacaNumber.slice(2)) / 100;  // Thickness

    // Generate x coordinates with cosine spacing for better point distribution
    const beta = Array.from({ length: numPoints }, (_, i) => (i * Math.PI) / (numPoints - 1));
    const x = beta.map(b => (1 - Math.cos(b)) / 2);

    // Initialize arrays for coordinates
    const upperSurface: [number, number][] = [];
    const lowerSurface: [number, number][] = [];
    
    // Calculate coordinates for each point
    for (let i = 0; i < x.length; i++) {
        const xi = x[i];
        
        // Calculate camber and gradient at this x position
        const yc = camberLine(xi, m, p);
        const dyc_dx = dycOverDx(xi, m, p);
        
        // Calculate theta angle
        const theta = Math.atan(dyc_dx);
        
        // Calculate thickness at this x position
        const yt = thickness(xi, t, closedTE);
        
        // Calculate upper and lower surface coordinates
        const xu = xi - yt * Math.sin(theta);
        const yu = yc + yt * Math.cos(theta);
        const xl = xi + yt * Math.sin(theta);
        const yl = yc - yt * Math.cos(theta);
        
        // Store coordinates in separate arrays
        upperSurface.push([xu, yu]);
        if (i > 0 && i < x.length - 1) { // Skip first and last points to avoid duplicates
            lowerSurface.unshift([xl, yl]);
        }
    }
    
    // Combine upper and lower surfaces to form a closed loop
    // Start from trailing edge, go to leading edge along upper surface,
    // then back to trailing edge along lower surface
    const coordinates: Coordinates = [...upperSurface, ...lowerSurface];
    
    return coordinates;
}

export function generateNACACoordinates(nacaNumber: string, numPoints: number = 100, closedTE: boolean = false): Coordinates {
    // Validate NACA number format
    const nacaRegex = /^[0-9]{4}$/;
    if (!nacaRegex.test(nacaNumber)) {
        throw new Error('Invalid NACA number. Please enter a 4-digit NACA number.');
    }

    return generateNACA4Coordinates(nacaNumber, numPoints, closedTE);
} 
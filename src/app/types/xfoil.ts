export type Coordinates = [number, number][];

export interface AnalysisRequest {
    coordinates: Coordinates;
    alpha: number;
    reynolds: number;
    mach?: number;
    viscous?: boolean;
}

export interface AnalysisResponse {
    CL: number;
    CD: number;
    CM: number;
    transitionPoints?: {
        upper: number;
        lower: number;
    };
}

export interface PolarRequest {
    coordinates: Coordinates;
    alpha_start: number;
    alpha_end: number;
    alpha_step: number;
    reynolds: number;
    mach?: number;
    viscous?: boolean;
}

export interface PolarPoint {
    alpha: number;
    CL: number;
    CD: number;
    CM: number;
}

export type PolarResponse = PolarPoint[];

export interface SavedAnalysis {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  airfoilData: {
    coordinates: Coordinates;
    nacaCode?: string;
  };
  analysisData: {
    alpha: number[];
    cl: number[];
    cd: number[];
    cm: number[];
  };
  settings: {
    reynolds: number;
    mach?: number;
    viscous: boolean;
  };
  analysisType: 'single-point' | 'polar';
} 
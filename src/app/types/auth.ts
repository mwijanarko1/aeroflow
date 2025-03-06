import { AnalysisResponse } from './xfoil';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  agreedToTerms: boolean;
  agreedAt: string;
}

export interface SavedAnalysis {
  id: string;
  name: string;
  description?: string;
  results: AnalysisResponse;
  coordinates: number[][];
  analysisParams: {
    alpha: number;
    reynolds: number;
    mach: number;
    viscous: boolean;
  };
  timestamp: string;
  createdAt: string;
  userId: string;
} 
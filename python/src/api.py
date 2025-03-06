from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import math

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AirfoilCoordinates(BaseModel):
    coordinates: List[List[float]]

class AnalysisRequest(BaseModel):
    coordinates: List[List[float]]
    alpha: float
    reynolds: float
    mach: Optional[float] = 0.0
    viscous: Optional[bool] = True

class AnalysisResponse(BaseModel):
    CL: float
    CD: float
    CM: float
    transitionPoints: Optional[dict] = None

class PolarRequest(BaseModel):
    coordinates: List[List[float]]
    alpha_start: float
    alpha_end: float
    alpha_step: float
    reynolds: float
    mach: float = 0.0
    viscous: bool = True

def simulate_airfoil_analysis(coordinates: List[List[float]], alpha: float, reynolds: float, mach: float = 0.0) -> dict:
    """
    Simulate XFOIL analysis using thin airfoil theory and empirical corrections.
    This is a more accurate simulation than the previous mock implementation.
    """
    # Convert alpha to radians
    alpha_rad = math.radians(alpha)
    
    # Calculate mean camber line
    n = len(coordinates)
    x_coords = [p[0] for p in coordinates]
    y_coords = [p[1] for p in coordinates]
    
    # Find leading edge (approximately at x=0)
    le_idx = min(range(n), key=lambda i: abs(x_coords[i]))
    
    # Separate upper and lower surfaces
    upper_surface = coordinates[:le_idx+1]
    lower_surface = coordinates[le_idx:]
    
    # Calculate mean camber line
    camber = []
    for i in range(n):
        if i < le_idx:
            x = x_coords[i]
            yu = y_coords[i]
            yl = np.interp(x, [p[0] for p in lower_surface], [p[1] for p in lower_surface])
            camber.append((yu + yl) / 2)
        elif i > le_idx:
            x = x_coords[i]
            yl = y_coords[i]
            yu = np.interp(x, [p[0] for p in upper_surface], [p[1] for p in upper_surface])
            camber.append((yu + yl) / 2)
    
    # Calculate maximum camber and its position
    max_camber = max(abs(c) for c in camber)
    max_camber_pos = x_coords[camber.index(max(camber))]
    
    # Calculate thickness
    thickness = []
    for i in range(n):
        if i < le_idx:
            x = x_coords[i]
            yu = y_coords[i]
            yl = np.interp(x, [p[0] for p in lower_surface], [p[1] for p in lower_surface])
            thickness.append(abs(yu - yl))
        elif i > le_idx:
            x = x_coords[i]
            yl = y_coords[i]
            yu = np.interp(x, [p[0] for p in upper_surface], [p[1] for p in upper_surface])
            thickness.append(abs(yu - yl))
    
    max_thickness = max(thickness)
    
    # Thin airfoil theory with corrections
    cl_slope = 2 * math.pi  # theoretical lift curve slope
    cl_alpha = cl_slope * math.sin(alpha_rad)  # basic lift coefficient
    
    # Add camber contribution
    cl_camber = 2 * math.pi * max_camber * (1 - max_camber_pos)
    
    # Total lift coefficient
    cl = cl_alpha + cl_camber
    
    # Drag coefficient (empirical model)
    cd_min = 0.008  # minimum drag coefficient
    cd_alpha = 0.02 * alpha_rad * alpha_rad  # angle of attack contribution
    cd_thickness = 0.1 * max_thickness  # thickness contribution
    cd_reynolds = 1.328 / math.sqrt(reynolds)  # laminar boundary layer contribution
    
    cd = cd_min + cd_alpha + cd_thickness + cd_reynolds
    
    # Moment coefficient (empirical model)
    cm = -0.25 * cl - 0.1 * max_camber  # quarter-chord moment
    
    # Add Mach number effects if significant
    if mach > 0.3:
        beta = math.sqrt(1 - mach * mach)
        cl = cl / beta  # Prandtl-Glauert correction
        cd = cd / beta
    
    # Estimate transition points (simplified)
    x_tr_upper = 0.3 - 0.2 * alpha_rad + 0.1 * (1e6 / reynolds)
    x_tr_lower = 0.4 + 0.2 * alpha_rad + 0.1 * (1e6 / reynolds)
    
    return {
        "CL": float(cl),
        "CD": float(cd),
        "CM": float(cm),
        "transitionPoints": {
            "upper": float(x_tr_upper),
            "lower": float(x_tr_lower)
        }
    }

def generate_polar_data(request: PolarRequest) -> List[dict]:
    """
    Generate polar data using the simulation model for a range of angles of attack.
    """
    results = []
    alpha = request.alpha_start
    while alpha <= request.alpha_end:
        analysis = simulate_airfoil_analysis(
            coordinates=request.coordinates,
            alpha=alpha,
            reynolds=request.reynolds,
            mach=request.mach
        )
        results.append({
            "alpha": float(alpha),
            "CL": analysis["CL"],
            "CD": analysis["CD"],
            "CM": analysis["CM"]
        })
        alpha += request.alpha_step
    return results

@app.post("/analyze")
async def analyze_airfoil(request: AnalysisRequest):
    """Analyze airfoil at specific conditions."""
    try:
        results = simulate_airfoil_analysis(
            coordinates=request.coordinates,
            alpha=request.alpha,
            reynolds=request.reynolds,
            mach=request.mach
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/polar")
async def generate_polar(request: PolarRequest):
    """Generate polar data for a range of angles."""
    try:
        results = generate_polar_data(request)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
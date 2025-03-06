import subprocess
import tempfile
import os
from typing import List, Dict, Union, Optional
import numpy as np
import pandas as pd

class XFoilInterface:
    def __init__(self, xfoil_path: str = "xfoil"):
        """Initialize XFoil interface.
        
        Args:
            xfoil_path (str): Path to XFoil executable
        """
        self.xfoil_path = xfoil_path
        
    def _run_xfoil_commands(self, commands: List[str], timeout: int = 30) -> str:
        """Run XFoil with given commands.
        
        Args:
            commands (List[str]): List of XFoil commands
            timeout (int): Timeout in seconds
            
        Returns:
            str: XFoil output
        """
        process = subprocess.Popen(
            [self.xfoil_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        input_text = "\n".join(commands + ["QUIT"]) + "\n"
        try:
            stdout, stderr = process.communicate(input_text, timeout=timeout)
            if stderr:
                raise RuntimeError(f"XFoil error: {stderr}")
            return stdout
        except subprocess.TimeoutExpired:
            process.kill()
            raise TimeoutError("XFoil process timed out")
            
    def analyze_airfoil(
        self,
        coordinates: List[List[float]],
        alpha: float,
        reynolds: float,
        mach: float = 0.0,
        viscous: bool = True,
    ) -> Dict[str, float]:
        """Analyze airfoil at given conditions.
        
        Args:
            coordinates (List[List[float]]): List of [x, y] coordinates
            alpha (float): Angle of attack in degrees
            reynolds (float): Reynolds number
            mach (float): Mach number
            viscous (bool): Whether to run viscous analysis
            
        Returns:
            Dict[str, float]: Analysis results containing CL, CD, CM
        """
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            # Write coordinates
            f.write("Airfoil\n")
            for x, y in coordinates:
                f.write(f"{x:.6f}  {y:.6f}\n")
                
        commands = [
            f"LOAD {f.name}",
            "PANE",
            "OPER"
        ]
        
        if viscous:
            commands.extend([
                "VISC",
                f"RE {reynolds}"
            ])
            
        commands.extend([
            f"MACH {mach}",
            f"ALFA {alpha}",
            "CPWR temp.cp"  # Write Cp distribution
        ])
        
        output = self._run_xfoil_commands(commands)
        os.unlink(f.name)  # Clean up temp file
        
        # Parse results
        results = {}
        for line in output.split('\n'):
            if "CL =" in line:
                parts = line.split()
                results["CL"] = float(parts[parts.index("CL") + 2])
                results["CD"] = float(parts[parts.index("CD") + 2])
                results["CM"] = float(parts[parts.index("CM") + 2])
                break
                
        return results
        
    def generate_polar(
        self,
        coordinates: List[List[float]],
        alpha_start: float,
        alpha_end: float,
        alpha_step: float,
        reynolds: float,
        mach: float = 0.0,
        viscous: bool = True
    ) -> pd.DataFrame:
        """Generate polar data over a range of angles.
        
        Args:
            coordinates (List[List[float]]): List of [x, y] coordinates
            alpha_start (float): Starting angle of attack
            alpha_end (float): Ending angle of attack
            alpha_step (float): Angle step size
            reynolds (float): Reynolds number
            mach (float): Mach number
            viscous (bool): Whether to run viscous analysis
            
        Returns:
            pd.DataFrame: Polar data with columns [alpha, CL, CD, CM]
        """
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            f.write("Airfoil\n")
            for x, y in coordinates:
                f.write(f"{x:.6f}  {y:.6f}\n")
                
        commands = [
            f"LOAD {f.name}",
            "PANE",
            "OPER"
        ]
        
        if viscous:
            commands.extend([
                "VISC",
                f"RE {reynolds}"
            ])
            
        commands.extend([
            f"MACH {mach}",
            "PACC",
            "polar.txt",
            "",
            f"ASEQ {alpha_start} {alpha_end} {alpha_step}",
            "",
            "PACC"
        ])
        
        self._run_xfoil_commands(commands)
        os.unlink(f.name)
        
        # Read polar data
        try:
            polar_data = pd.read_csv(
                "polar.txt",
                delim_whitespace=True,
                skiprows=12,
                names=["alpha", "CL", "CD", "CDp", "CM", "Top_Xtr", "Bot_Xtr"]
            )
            os.unlink("polar.txt")
            return polar_data[["alpha", "CL", "CD", "CM"]]
        except:
            raise RuntimeError("Failed to read polar data") 
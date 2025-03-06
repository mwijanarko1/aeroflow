import subprocess
import os
import tempfile
import numpy as np
from typing import Dict, List, Tuple, Optional

class XFoilWrapper:
    def __init__(self, xfoil_path: str = "xfoil"):
        """Initialize XFoil wrapper.
        
        Args:
            xfoil_path: Path to XFoil executable
        """
        self.xfoil_path = xfoil_path
        
    def _write_airfoil_file(self, coordinates: str) -> str:
        """Write airfoil coordinates to a temporary file.
        
        Args:
            coordinates: String containing airfoil coordinates
            
        Returns:
            Path to temporary file
        """
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.dat') as f:
            f.write(coordinates)
            return f.name
            
    def _parse_results(self, output: str) -> Dict:
        """Parse XFoil output to extract results.
        
        Args:
            output: String containing XFoil output
            
        Returns:
            Dictionary containing parsed results
        """
        lines = output.split('\n')
        results = {
            'alpha': [],
            'cl': [],
            'cd': [],
            'cm': [],
            'cp': []
        }
        
        reading_cp = False
        cp_data = []
        
        for line in lines:
            if 'alpha' in line.lower() and 'cl' in line.lower() and 'cd' in line.lower():
                try:
                    parts = line.split()
                    results['alpha'].append(float(parts[0]))
                    results['cl'].append(float(parts[1]))
                    results['cd'].append(float(parts[2]))
                    if len(parts) > 3:
                        results['cm'].append(float(parts[4]))
                except (ValueError, IndexError):
                    continue
                    
            if 'cp vs. x' in line.lower():
                reading_cp = True
                continue
                
            if reading_cp:
                try:
                    parts = line.split()
                    if len(parts) == 2:
                        x, cp = float(parts[0]), float(parts[1])
                        cp_data.append((x, cp))
                except (ValueError, IndexError):
                    continue
                    
        results['cp'] = cp_data
        return results
        
    def analyze(self, 
                airfoil_data: str,
                reynolds: float,
                mach: float,
                alpha: float,
                n_crit: float = 9.0) -> Dict:
        """Run XFoil analysis.
        
        Args:
            airfoil_data: String containing airfoil coordinates or NACA designation
            reynolds: Reynolds number
            mach: Mach number
            alpha: Angle of attack (degrees)
            n_crit: Critical amplification ratio
            
        Returns:
            Dictionary containing analysis results
        """
        # Create temporary files
        if airfoil_data.startswith('NACA'):
            airfoil_name = airfoil_data
        else:
            temp_airfoil_file = self._write_airfoil_file(airfoil_data)
            airfoil_name = os.path.basename(temp_airfoil_file)
        
        # Prepare XFoil commands
        commands = [
            f"{'NACA ' if airfoil_data.startswith('NACA') else 'LOAD '}{airfoil_name}",
            "OPER",
            f"VISC {reynolds}",
            f"MACH {mach}",
            f"VPAR",
            f"N {n_crit}",
            "",
            "PACC",
            "temp.pol",
            "",
            f"ALFA {alpha}",
            "CPWR temp.cp",
            "QUIT"
        ]
        
        # Run XFoil
        try:
            process = subprocess.Popen(
                [self.xfoil_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            output, error = process.communicate("\n".join(commands))
            
            # Read results
            results = {}
            try:
                with open('temp.pol', 'r') as f:
                    pol_data = f.read()
                with open('temp.cp', 'r') as f:
                    cp_data = f.read()
                    
                results = self._parse_results(pol_data + '\n' + cp_data)
            except FileNotFoundError:
                pass
                
            # Cleanup
            if not airfoil_data.startswith('NACA'):
                os.unlink(temp_airfoil_file)
            try:
                os.unlink('temp.pol')
                os.unlink('temp.cp')
            except FileNotFoundError:
                pass
                
            return results
            
        except Exception as e:
            raise Exception(f"XFoil analysis failed: {str(e)}")
            
    def generate_naca_coordinates(self, naca_number: str) -> str:
        """Generate coordinates for a NACA airfoil.
        
        Args:
            naca_number: NACA designation (4 or 5 digits)
            
        Returns:
            String containing airfoil coordinates
        """
        commands = [
            f"NACA {naca_number}",
            "SAVE",
            "temp.dat",
            "QUIT"
        ]
        
        try:
            process = subprocess.Popen(
                [self.xfoil_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            process.communicate("\n".join(commands))
            
            with open('temp.dat', 'r') as f:
                coordinates = f.read()
                
            os.unlink('temp.dat')
            return coordinates
            
        except Exception as e:
            raise Exception(f"Failed to generate NACA coordinates: {str(e)}") 
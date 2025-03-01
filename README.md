# XFOIL.ai - Web-based Airfoil Analysis Tool

XFOIL.ai is a web-based tool for generating and analyzing airfoil geometries using the XFOIL aerodynamic analysis code.

## NACA 4-Digit Airfoil Series

The NACA 4-digit airfoil series is defined by the following parameters:

### NACA MPXX

Where:
- **M** is the maximum camber divided by 100. For example, in NACA 2412, M=2 means the maximum camber is 0.02 or 2% of the chord.
- **P** is the position of the maximum camber divided by 10. For example, in NACA 2412, P=4 means the maximum camber is at 0.4 or 40% of the chord.
- **XX** is the thickness divided by 100. For example, in NACA 2412, XX=12 means the thickness is 0.12 or 12% of the chord.

### Equations

The airfoil is created from a camber line and a thickness distribution plotted perpendicular to the camber line.

#### Camber Line

The equation for the camber line is split into sections either side of the point of maximum camber position (P):

**Front (0 ≤ x < p)**
```
yc = (M/p²) * (2px - x²)
```

**Back (p ≤ x ≤ 1)**
```
yc = (M/(1-p)²) * (1 - 2p + 2px - x²)
```

#### Gradient of Camber Line

**Front (0 ≤ x < p)**
```
dyc/dx = (2M/p²) * (p - x)
```

**Back (p ≤ x ≤ 1)**
```
dyc/dx = (2M/(1-p)²) * (p - x)
```

#### Thickness Distribution

```
yt = (T/0.2) * (a₀x^0.5 + a₁x + a₂x² + a₃x³ + a₄x⁴)
```

Where:
- a₀ = 0.2969
- a₁ = -0.126
- a₂ = -0.3516
- a₃ = 0.2843
- a₄ = -0.1015 (for open trailing edge) or -0.1036 (for closed trailing edge)

The value of yt is a half thickness and needs to be applied both sides of the camber line.

#### Final Airfoil Coordinates

Using the equations above, for a given value of x, we calculate:
1. The camber line position (yc)
2. The gradient of the camber line (dyc/dx)
3. The thickness (yt)

The position of the upper and lower surface can then be calculated perpendicular to the camber line:

```
θ = atan(dyc/dx)

Upper Surface:
xu = xc - yt * sin(θ)
yu = yc + yt * cos(θ)

Lower Surface:
xl = xc + yt * sin(θ)
yl = yc - yt * cos(θ)
```

## Features

- Generate NACA 4-digit airfoils with customizable parameters
- Visualize airfoil geometry with proper scaling
- Option for closed or open trailing edge
- Adjustable number of points for better resolution
- Display of mean camber line for cambered airfoils

## Prerequisites

- Node.js 18.x or later
- Python 3.8 or later
- XFoil installed and available in your system PATH

### Installing XFoil

#### macOS
```bash
brew install xfoil
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install xfoil
```

#### Windows
Download the latest version from the [XFoil website](https://web.mit.edu/drela/Public/web/xfoil/) and add it to your system PATH.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/xfoil.ai.git
cd xfoil.ai
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Development

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Upload an airfoil file in DAT format (x, y coordinates)
2. Choose between single-point analysis or polar generation
3. Set analysis parameters:
   - Reynolds number
   - Mach number
   - Angle of attack (or range for polar)
   - Viscous/inviscid analysis
4. View results in the interactive charts and data tables

## API Routes

### POST /api/analyze
Analyze an airfoil at a single point.

Request body:
```json
{
    "coordinates": [[x1, y1], [x2, y2], ...],
    "alpha": number,
    "reynolds": number,
    "mach": number,
    "viscous": boolean
}
```

### POST /api/polar
Generate polar data over a range of angles.

Request body:
```json
{
    "coordinates": [[x1, y1], [x2, y2], ...],
    "alpha_start": number,
    "alpha_end": number,
    "alpha_step": number,
    "reynolds": number,
    "mach": number,
    "viscous": boolean
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Mark Drela and Harold Youngren for creating XFoil
- The Next.js and React communities for their excellent tools and documentation # aeroflow

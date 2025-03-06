import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Forward the request to the Python backend
    const response = await fetch(`${PYTHON_API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Python API returned ${response.status}`);
    }

    const results = await response.json();
    return NextResponse.json(results);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze airfoil' },
      { status: 500 }
    );
  }
} 
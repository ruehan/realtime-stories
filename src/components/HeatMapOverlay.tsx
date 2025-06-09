import React, { useMemo } from 'react';

interface HeatPoint {
  x: number;
  y: number;
  intensity: number;
}

interface HeatMapOverlayProps {
  users: Array<{ x: number; y: number; status: string }>;
  width: number;
  height: number;
  gridSize?: number;
  opacity?: number;
}

const HeatMapOverlay: React.FC<HeatMapOverlayProps> = ({
  users,
  width,
  height,
  gridSize = 50,
  opacity = 0.3
}) => {
  const heatData = useMemo(() => {
    const grid: number[][] = [];
    const cols = Math.ceil(width / gridSize);
    const rows = Math.ceil(height / gridSize);

    // Initialize grid
    for (let i = 0; i < rows; i++) {
      grid[i] = new Array(cols).fill(0);
    }

    // Add user positions to grid
    users.forEach(user => {
      const gridX = Math.floor(user.x / gridSize);
      const gridY = Math.floor(user.y / gridSize);
      
      if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
        // Weight based on user status
        const weight = user.status === 'active' ? 2 : user.status === 'reading' ? 1.5 : 1;
        grid[gridY][gridX] += weight;
      }
    });

    // Convert grid to heat points
    const heatPoints: HeatPoint[] = [];
    const maxIntensity = Math.max(...grid.flat());

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (grid[row][col] > 0) {
          heatPoints.push({
            x: col * gridSize + gridSize / 2,
            y: row * gridSize + gridSize / 2,
            intensity: grid[row][col] / maxIntensity
          });
        }
      }
    }

    return heatPoints;
  }, [users, width, height, gridSize]);

  const getHeatColor = (intensity: number) => {
    // Create a heat gradient from blue (cold) to red (hot)
    const colors = [
      { r: 0, g: 0, b: 255, threshold: 0 },     // Blue
      { r: 0, g: 255, b: 255, threshold: 0.25 }, // Cyan
      { r: 0, g: 255, b: 0, threshold: 0.5 },   // Green
      { r: 255, g: 255, b: 0, threshold: 0.75 }, // Yellow
      { r: 255, g: 0, b: 0, threshold: 1 }      // Red
    ];

    for (let i = 0; i < colors.length - 1; i++) {
      if (intensity >= colors[i].threshold && intensity <= colors[i + 1].threshold) {
        const t = (intensity - colors[i].threshold) / (colors[i + 1].threshold - colors[i].threshold);
        const r = Math.round(colors[i].r + t * (colors[i + 1].r - colors[i].r));
        const g = Math.round(colors[i].g + t * (colors[i + 1].g - colors[i].g));
        const b = Math.round(colors[i].b + t * (colors[i + 1].b - colors[i].b));
        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    return 'rgb(255, 0, 0)'; // Fallback to red
  };

  return (
    <g className="heat-map-overlay" style={{ opacity }}>
      <defs>
        {heatData.map((point, index) => (
          <radialGradient key={index} id={`heat-gradient-${index}`}>
            <stop offset="0%" stopColor={getHeatColor(point.intensity)} stopOpacity={point.intensity} />
            <stop offset="100%" stopColor={getHeatColor(point.intensity)} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      
      {heatData.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={gridSize / 2}
          fill={`url(#heat-gradient-${index})`}
          className="pointer-events-none"
        />
      ))}
    </g>
  );
};

export default HeatMapOverlay;
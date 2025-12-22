import * as THREE from 'three';

// Random float between min and max
export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate a random position inside a sphere (Galaxy effect)
export const getRandomGalaxyPosition = (radius: number = 15): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius; // Cubic root for uniform distribution
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Generate points on a conical spiral
export const generateTreePositions = (count: number, radiusBottom: number, height: number): { pos: THREE.Vector3, rot: THREE.Euler }[] => {
  const positions: { pos: THREE.Vector3, rot: THREE.Euler }[] = [];
  
  for (let i = 0; i < count; i++) {
    // Normalized height (0 at bottom, 1 at top)
    const t = i / count; 
    
    // Conical Spiral Math
    const angle = t * Math.PI * 12; // How many turns the spiral makes
    const currentRadius = radiusBottom * (1 - t);
    const y = (t * height) - (height / 2); // Center vertically
    const x = Math.cos(angle) * currentRadius;
    const z = Math.sin(angle) * currentRadius;

    const pos = new THREE.Vector3(x, y, z);
    
    // Calculate rotation to face outwards/slightly up
    const rot = new THREE.Euler(
      0, 
      -angle, // Rotate to follow the spiral curve
      0 // Slight tilt handled in component if needed
    );

    positions.push({ pos, rot });
  }

  return positions;
};
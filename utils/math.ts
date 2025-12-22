import * as THREE from 'three';

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Volumetric Cone Distribution (Dense Center)
export const getVolumetricTreePos = (height: number, maxRadius: number) => {
  const h = Math.random() * height;
  const ratio = (height - h) / height;
  const radius = ratio * maxRadius * Math.sqrt(Math.random()); // sqrt for uniform volume
  const angle = Math.random() * Math.PI * 2;
  
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    h - height / 2,
    Math.sin(angle) * radius
  );
};

export const getGalaxyPos = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

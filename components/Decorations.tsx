import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { DecorationData } from '../types';

const Decoration: React.FC<{ data: DecorationData; isExploded: boolean }> = ({ data, isExploded }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    const targetPos = isExploded ? data.galaxyPos : data.treePos;
    const targetRot = isExploded ? data.galaxyRot : data.treeRot;

    gsap.to(meshRef.current.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.5,
      ease: "back.out(1.2)",
      delay: Math.random() * 0.3
    });
    
    gsap.to(meshRef.current.rotation, {
      x: targetRot.x,
      y: targetRot.y,
      z: targetRot.z,
      duration: 1.5,
      ease: "power2.inOut"
    });
  }, [isExploded, data]);

  // Increased size for fuller tree
  return (
    <mesh ref={meshRef}>
      {data.type === 'sphere' ? (
        <sphereGeometry args={[0.35, 24, 24]} />
      ) : (
        <octahedronGeometry args={[0.35, 0]} />
      )}
      <meshStandardMaterial 
        color={data.color} 
        metalness={0.95} 
        roughness={0.15} 
        envMapIntensity={1.5}
        emissive={data.color}
        emissiveIntensity={isExploded ? 0.05 : 0.2}
      />
    </mesh>
  );
};

export default Decoration;
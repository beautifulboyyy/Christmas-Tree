import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { DecorationData } from '../types';

interface DecorationsProps {
  data: DecorationData;
  isExploded: boolean;
}

const Decoration: React.FC<DecorationsProps> = ({ data, isExploded }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    const targetPos = isExploded ? data.galaxyPos : data.treePos;
    const targetRot = isExploded ? data.galaxyRot : data.treeRot;

    gsap.to(meshRef.current.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.8,
      ease: "power2.inOut",
      delay: Math.random() * 0.2 // Random delay for organic feel
    });
    
    gsap.to(meshRef.current.rotation, {
      x: targetRot.x,
      y: targetRot.y,
      z: targetRot.z,
      duration: 1.8,
      ease: "power2.inOut"
    });

  }, [isExploded, data]);

  return (
    <mesh ref={meshRef} position={data.treePos} rotation={data.treeRot}>
      {data.type === 'sphere' ? (
        <sphereGeometry args={[0.2, 16, 16]} />
      ) : (
        <boxGeometry args={[0.3, 0.3, 0.3]} />
      )}
      <meshStandardMaterial 
        color={data.color} 
        metalness={0.6} 
        roughness={0.2} 
        emissive={data.color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

export default Decoration;
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { PhotoData } from '../types';

interface PhotoProps {
  data: PhotoData;
  isExploded: boolean;
  isFocused: boolean;
  onSelect: (id: string) => void;
}

const PhotoFrame: React.FC<PhotoProps> = ({ data, isExploded, isFocused, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const photoTexture = useTexture(data.url);
  
  // Set correct color space for newer Three.js versions
  useEffect(() => {
    if (photoTexture) {
      photoTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [photoTexture]);

  useEffect(() => {
    if (!groupRef.current) return;

    const targetPos = (isFocused && isExploded) 
      ? new THREE.Vector3(0, 0, 8) // Moved slightly further back for better view
      : isExploded ? data.galaxyPos : data.treePos;

    const targetRot = (isFocused && isExploded)
      ? new THREE.Euler(0, 0, 0)
      : isExploded ? data.galaxyRot : data.treeRot;

    const targetScale = isFocused ? 1.8 : 1;

    gsap.to(groupRef.current.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.2,
      ease: "back.out(1.4)"
    });

    gsap.to(groupRef.current.rotation, {
      x: targetRot.x,
      y: targetRot.y,
      z: targetRot.z,
      duration: 1.2,
      ease: "power3.inOut"
    });

    gsap.to(groupRef.current.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)"
    });
  }, [isExploded, isFocused, data]);

  useFrame((state) => {
    if (isFocused && isExploded && groupRef.current) {
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.005;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group 
      ref={groupRef} 
      onClick={(e) => { e.stopPropagation(); onSelect(data.id); }}
    >
      <mesh>
        <boxGeometry args={[2.5, 3.2, 0.08]} />
        <meshStandardMaterial attach="material-0" color="#ffffff" roughness={0.5} />
        <meshStandardMaterial attach="material-1" color="#ffffff" roughness={0.5} />
        <meshStandardMaterial attach="material-2" color="#ffffff" roughness={0.5} />
        <meshStandardMaterial attach="material-3" color="#ffffff" roughness={0.5} />
        <meshStandardMaterial 
          attach="material-4" 
          map={photoTexture} 
          color="#fff4e0"
          roughness={0.2}
        />
        <meshStandardMaterial attach="material-5" color="#eeeeee" roughness={0.8} />
      </mesh>
    </group>
  );
};

export default PhotoFrame;
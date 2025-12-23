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
  
  useEffect(() => {
    if (photoTexture) {
      photoTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [photoTexture]);

  useEffect(() => {
    if (!groupRef.current) return;

    // Focused State: Center of screen, very close
    // Exploded State: Galaxy Position
    // Tree State: Tree Position
    const targetPos = (isFocused && isExploded) 
      ? new THREE.Vector3(0, 0, 5) 
      : isExploded ? data.galaxyPos : data.treePos;

    const targetRot = (isFocused && isExploded)
      ? new THREE.Euler(0, 0, 0)
      : isExploded ? data.galaxyRot : data.treeRot;

    // Scale Logic: 
    // Tree: Small (0.6) to fit in tree.
    // Focused: Large (3.5) to fill screen.
    const targetScale = isFocused ? 3.5 : 0.6;

    // Silky smooth movement
    gsap.to(groupRef.current.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 2,
      ease: "expo.inOut"
    });

    gsap.to(groupRef.current.rotation, {
      x: targetRot.x,
      y: targetRot.y,
      z: targetRot.z,
      duration: 2,
      ease: "expo.inOut"
    });

    gsap.to(groupRef.current.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 1.8,
      ease: "expo.inOut"
    });
  }, [isExploded, isFocused, data]);

  // Floating effect when focused
  useFrame((state) => {
    if (isFocused && isExploded && groupRef.current) {
      const time = state.clock.elapsedTime;
      // Gentle floating bob
      groupRef.current.position.y += Math.sin(time) * 0.003;
      // Gentle rotation sway
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.03;
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.03;
    }
  });

  return (
    <group 
      ref={groupRef} 
      onClick={(e) => { e.stopPropagation(); onSelect(data.id); }}
    >
      {/* Instax Mini Style Frame */}
      {/* Outer White Paper: ~54mm x 86mm ratio */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.54, 0.86, 0.02]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Inner Photo Area: ~46mm x 62mm ratio */}
      {/* Positioned slightly upwards to create the 'chin' */}
      <mesh position={[0, 0.06, 0.011]}>
        <planeGeometry args={[0.46, 0.62]} />
        <meshBasicMaterial map={photoTexture} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export default PhotoFrame;
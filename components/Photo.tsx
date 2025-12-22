import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { PhotoData } from '../types';

interface PhotoProps {
  data: PhotoData;
  isExploded: boolean;
  isFocused: boolean;
  onSelect: (id: string, e: any) => void;
}

const Photo: React.FC<PhotoProps> = ({ data, isExploded, isFocused, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture(data.url);
  
  // Clone initial positions to avoid mutating original data during animation calculations
  const targetPos = useRef(new THREE.Vector3());
  const targetRot = useRef(new THREE.Euler());

  // Handle Animation Logic
  useEffect(() => {
    if (!groupRef.current) return;

    let pos: THREE.Vector3;
    let rot: THREE.Euler;

    if (isFocused && isExploded) {
      // Focus Mode: Center screen, closer to camera
      pos = new THREE.Vector3(0, 0, 4);
      rot = new THREE.Euler(0, 0, 0);
    } else if (isExploded) {
      // Galaxy Mode: Random position
      pos = data.galaxyPos;
      rot = data.galaxyRot;
    } else {
      // Tree Mode: Spiral position
      pos = data.treePos;
      rot = data.treeRot;
    }

    // Animate Position
    gsap.to(groupRef.current.position, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      duration: 1.5,
      ease: "power3.inOut"
    });

    // Animate Rotation
    gsap.to(groupRef.current.rotation, {
      x: rot.x,
      y: rot.y,
      z: rot.z,
      duration: 1.5,
      ease: "power3.inOut"
    });

    // Animate Scale (Scale up slightly when focused)
    gsap.to(groupRef.current.scale, {
      x: isFocused ? 1.5 : 1,
      y: isFocused ? 1.5 : 1,
      z: isFocused ? 1.5 : 1,
      duration: 1,
      ease: "elastic.out(1, 0.5)"
    });

  }, [isExploded, isFocused, data]);

  // Make the photo look at the camera ONLY when in tree mode (optional stylistic choice)
  // or add floating effect
  useFrame((state) => {
    if (!groupRef.current) return;
    if (isExploded && !isFocused) {
      // Gentle floating in galaxy mode
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime + data.galaxyPos.x) * 0.002;
    }
  });

  return (
    <group 
      ref={groupRef} 
      onClick={(e) => {
        if (isExploded) {
          e.stopPropagation(); // Only stop propagation if we are interacting with photos
          onSelect(data.id, e);
        }
      }}
      // Initial position (Tree)
      position={data.treePos}
      rotation={data.treeRot}
    >
      {/* Polaroid Frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
      </mesh>

      {/* Photo Image */}
      <mesh position={[0, 0.1, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export default Photo;
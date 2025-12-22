import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Sparkles } from '@react-three/drei';
import Photo from './Photo';
import Decoration from './Decorations';
import { generateTreePositions, getRandomGalaxyPosition, randomRange } from '../utils/math';
import { PhotoData, DecorationData } from '../types';
import gsap from 'gsap';

// --- CONFIGURATION ---
// Replace these URLs with your local paths if needed
const PHOTO_URLS = [
  "https://picsum.photos/id/1015/300/300",
  "https://picsum.photos/id/1018/300/300",
  "https://picsum.photos/id/1025/300/300",
  "https://picsum.photos/id/1036/300/300",
  "https://picsum.photos/id/1040/300/300",
  "https://picsum.photos/id/1050/300/300",
  "https://picsum.photos/id/1060/300/300",
  "https://picsum.photos/id/1070/300/300",
  "https://picsum.photos/id/1080/300/300",
  "https://picsum.photos/id/110/300/300",
  "https://picsum.photos/id/120/300/300",
  "https://picsum.photos/id/130/300/300",
];

const TREE_HEIGHT = 12;
const TREE_RADIUS = 3.5;
const DECORATION_COUNT = 40;

const ExperienceContent: React.FC = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [focusedPhotoId, setFocusedPhotoId] = useState<string | null>(null);

  // Generate Data for Photos
  const photosData = useMemo<PhotoData[]>(() => {
    const spiralPos = generateTreePositions(PHOTO_URLS.length, TREE_RADIUS, TREE_HEIGHT);
    return PHOTO_URLS.map((url, i) => ({
      id: `photo-${i}`,
      url: url,
      treePos: spiralPos[i].pos,
      treeRot: spiralPos[i].rot,
      galaxyPos: getRandomGalaxyPosition(10),
      galaxyRot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0)
    }));
  }, []);

  // Generate Data for Decorations
  const decorationsData = useMemo<DecorationData[]>(() => {
    // Offset spiral for decorations so they don't overlap perfectly with photos
    // We add a random start index to mix them in
    const spiralPos = generateTreePositions(DECORATION_COUNT, TREE_RADIUS * 1.2, TREE_HEIGHT);
    
    return Array.from({ length: DECORATION_COUNT }).map((_, i) => ({
      id: `deco-${i}`,
      type: Math.random() > 0.5 ? 'sphere' : 'box',
      color: ['#ff0000', '#d4af37', '#silver', '#00ff00'][Math.floor(Math.random() * 4)],
      treePos: spiralPos[i].pos,
      treeRot: spiralPos[i].rot,
      galaxyPos: getRandomGalaxyPosition(15),
      galaxyRot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0)
    }));
  }, []);

  // Top Star Ref
  const starRef = useRef<THREE.Group>(null);

  // Animate Top Star
  useEffect(() => {
    if(!starRef.current) return;
    const targetY = isExploded ? 10 : (TREE_HEIGHT / 2) + 0.5;
    const targetScale = isExploded ? 0 : 1; // Hide star in galaxy mode or explode it away

    gsap.to(starRef.current.position, {
        y: targetY,
        x: isExploded ? 0 : 0,
        z: isExploded ? 0 : 0,
        duration: 2,
        ease: "power2.inOut"
    });
    
    // Spin the star if exploded, stable if tree
    if(isExploded) {
       gsap.to(starRef.current.scale, { x: 0, y: 0, z: 0, duration: 1 });
    } else {
       gsap.to(starRef.current.scale, { x: 1, y: 1, z: 1, duration: 1, delay: 1 });
    }

  }, [isExploded]);


  // Handlers
  const handleTreeDoubleClick = (e: any) => {
    e.stopPropagation();
    if (!isExploded) {
      setIsExploded(true);
    }
  };

  const handleBackgroundDoubleClick = () => {
    if (isExploded) {
      setFocusedPhotoId(null); // Clear focus
      setIsExploded(false); // Reset to tree
    }
  };

  const handlePhotoSelect = (id: string, e: any) => {
    // Only allow selection in Galaxy mode
    if (isExploded) {
      if (focusedPhotoId === id) {
        setFocusedPhotoId(null); // Unfocus
      } else {
        setFocusedPhotoId(id); // Focus
      }
    }
  };

  return (
    <>
      <color attach="background" args={['#050505']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="blue" />

      {/* Background / Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={100} scale={12} size={4} speed={0.4} opacity={0.5} color="#fff3b0" />
      
      {/* Interaction Plane for Background Reset */}
      {/* Only visible to raycaster, acts as background trigger */}
      <mesh 
        visible={false} 
        onDoubleClick={handleBackgroundDoubleClick}
        position={[0, 0, 0]}
      >
        <sphereGeometry args={[50, 16, 16]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>

      {/* TREE GROUP */}
      <group 
        onDoubleClick={handleTreeDoubleClick}
        rotation={[0, 0, 0]} // Initial rotation
      >
        {/* Top Star */}
        <group ref={starRef} position={[0, TREE_HEIGHT / 2 + 0.5, 0]}>
           <mesh>
              <dodecahedronGeometry args={[0.5, 0]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} toneMapped={false} />
           </mesh>
           <pointLight intensity={2} distance={5} color="#ffd700" />
        </group>

        {/* Photos */}
        {photosData.map((data) => (
          <Photo 
            key={data.id} 
            data={data} 
            isExploded={isExploded}
            isFocused={focusedPhotoId === data.id}
            onSelect={handlePhotoSelect}
          />
        ))}

        {/* Decorations */}
        {decorationsData.map((data) => (
          <Decoration 
            key={data.id} 
            data={data} 
            isExploded={isExploded}
          />
        ))}
      </group>

      <OrbitControls 
        enablePan={false}
        enableZoom={!isExploded} // Disable zoom in galaxy mode to prevent clipping through items easily
        minPolarAngle={Math.PI / 3} // Prevent looking from top down (too much)
        maxPolarAngle={Math.PI / 1.8} // Prevent looking from under
        autoRotate={!isExploded && !focusedPhotoId} // Rotate when in tree mode
        autoRotateSpeed={0.5}
      />
    </>
  );
};

const Experience: React.FC = () => {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        camera={{ position: [0, 2, 14], fov: 45 }}
        dpr={[1, 2]} // Quality scaling
      >
         <React.Suspense fallback={null}>
            <ExperienceContent />
         </React.Suspense>
      </Canvas>
      
      {/* Simple Instruction Overlay */}
      <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none text-white/50 text-sm font-light select-none">
        <p>Double Click Tree to Explode • Double Click Void to Reset</p>
        <p className="text-xs mt-1">Click photos in Galaxy mode to focus</p>
      </div>
    </div>
  );
};

export default Experience;
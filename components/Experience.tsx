import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Float, Sparkles, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import PhotoFrame from './PhotoFrame';
import Decoration from './Decorations';
import { getVolumetricTreePos, getGalaxyPos } from '../utils/math';
import { PhotoData, DecorationData } from '../types';
import gsap from 'gsap';

// Use seed-based URLs
const PHOTO_URLS = Array.from({ length: 15 }).map((_, i) => `https://picsum.photos/seed/christmas${i}/600/800`);

const TREE_HEIGHT = 14;
const TREE_RADIUS = 5.5; // Slightly wider to accommodate larger ornaments
const DECO_COUNT = 800; // Increased density significantly

const StarGeometry = () => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.8;
    const innerRadius = 0.35;
    
    // Rotate -PI/2 to make the top point point upwards
    const offsetAngle = -Math.PI / 2;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points + offsetAngle;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  return (
    <extrudeGeometry 
      args={[
        shape, 
        { 
          depth: 0.2, 
          bevelEnabled: true, 
          bevelThickness: 0.1, 
          bevelSize: 0.05, 
          bevelSegments: 2 
        }
      ]} 
    />
  );
};

const Scene = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const starRef = useRef<THREE.Group>(null);

  // Generate Data
  const photos = useMemo<PhotoData[]>(() => {
    return PHOTO_URLS.map((url, i) => {
      const treeData = getVolumetricTreePos(TREE_HEIGHT, TREE_RADIUS);
      return {
        id: `p-${i}`,
        url,
        treePos: treeData,
        treeRot: new THREE.Euler(0, Math.random() * Math.PI, Math.random() * 0.5),
        galaxyPos: getGalaxyPos(12),
        galaxyRot: new THREE.Euler(0, 0, 0),
      };
    });
  }, []);

  const decos = useMemo<DecorationData[]>(() => {
    const colors = ['#D4AF37', '#B22222', '#C0C0C0', '#FFD700']; // Gold, Crimson, Silver, Bright Gold
    return Array.from({ length: DECO_COUNT }).map((_, i) => ({
      id: `d-${i}`,
      type: Math.random() > 0.3 ? 'sphere' : 'box',
      color: colors[Math.floor(Math.random() * colors.length)],
      treePos: getVolumetricTreePos(TREE_HEIGHT, TREE_RADIUS),
      treeRot: new THREE.Euler(Math.random() * Math.PI, 0, 0),
      galaxyPos: getGalaxyPos(20),
      galaxyRot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
    }));
  }, []);

  // Star Animation
  useEffect(() => {
    if (!starRef.current) return;
    gsap.to(starRef.current.position, {
      y: isExploded ? 25 : TREE_HEIGHT / 2 + 1,
      duration: 2,
      ease: "power2.inOut"
    });
    gsap.to(starRef.current.scale, {
      x: isExploded ? 0 : 1.5,
      y: isExploded ? 0 : 1.5,
      z: isExploded ? 0 : 1.5,
      duration: 1
    });
  }, [isExploded]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 24]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        enableZoom={isExploded}
        maxPolarAngle={Math.PI / 1.8} 
        autoRotate={!isExploded && !focusedId} 
        autoRotateSpeed={0.5}
      />
      
      {/* Lighting: Dark atmosphere, light primarily from Star */}
      <color attach="background" args={['#010101']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={300} scale={20} size={3} speed={0.3} color="#FFD700" />
      
      {/* Dim environment to let the Star shine */}
      <Environment preset="night" environmentIntensity={0.2} /> 
      <ambientLight intensity={0.1} />

      {/* Explosion Trigger */}
      <mesh 
        visible={false} 
        onDoubleClick={() => { setIsExploded(!isExploded); setFocusedId(null); }}
      >
        <sphereGeometry args={[50, 16, 16]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>

      <group>
        {/* Top Star */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <group ref={starRef}>
            <mesh>
              <StarGeometry />
              <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFD700" 
                emissiveIntensity={4} 
                toneMapped={false} 
                metalness={1}
                roughness={0}
              />
            </mesh>
            {/* The main light source coming from the star */}
            <pointLight intensity={25} color="#FFD700" distance={40} decay={2} position={[0, 0, 1]} />
            <pointLight intensity={10} color="#FFFAEE" distance={20} decay={2} position={[0, 0, -1]} />
          </group>
        </Float>

        {/* Dense Ornaments */}
        {decos.map(d => <Decoration key={d.id} data={d} isExploded={isExploded} />)}

        {/* Polaroids */}
        {photos.map(p => (
          <PhotoFrame 
            key={p.id} 
            data={p} 
            isExploded={isExploded} 
            isFocused={focusedId === p.id} 
            onSelect={(id) => setFocusedId(focusedId === id ? null : id)} 
          />
        ))}
      </group>

      {/* Cinematic Effects */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={1.2} 
          intensity={0.8} 
          levels={9} 
          mipmapBlur 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

const Experience: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <Canvas gl={{ antialias: false, stencil: false, depth: true }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="absolute top-8 left-0 w-full text-center pointer-events-none select-none">
        <h1 className="text-white text-3xl font-serif tracking-widest opacity-80 uppercase">The Eternal Gallery</h1>
        <p className="text-gold-400 text-xs mt-2 text-[#D4AF37] tracking-[0.3em]">DOUBLE CLICK TO REVEAL MEMORIES</p>
      </div>
    </div>
  );
};

export default Experience;
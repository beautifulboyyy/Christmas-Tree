import * as THREE from 'three';

export interface PositionData {
  id: string;
  treePos: THREE.Vector3;
  treeRot: THREE.Euler;
  galaxyPos: THREE.Vector3;
  galaxyRot: THREE.Euler;
}

export interface PhotoData extends PositionData {
  url: string;
}

export interface DecorationData extends PositionData {
  type: 'sphere' | 'box';
  color: string;
}

export type SceneState = {
  isExploded: boolean;
  setIsExploded: (v: boolean) => void;
  focusedPhotoId: string | null;
  setFocusedPhotoId: (id: string | null) => void;
};
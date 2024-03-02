/* eslint-disable @typescript-eslint/no-explicit-any */

import { Ref, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function Model({ onClick }: { onClick: () => void }) {
  const { nodes, materials } = useGLTF("/Poimandres-transformed.glb");
  const ref = useRef<THREE.Group<THREE.Object3DEventMap>>();

  return (
    <group
      dispose={null}
      position={[0, -0.5, 0]}
      ref={ref as Ref<THREE.Group<THREE.Object3DEventMap>>}
    >
      <mesh
        onClick={onClick}
        castShadow
        receiveShadow
        geometry={(nodes.Curve007_1 as any).geometry}
        material={materials["Material.001"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Curve007_2 as any).geometry}
        material={materials["Material.002"]}
      />
    </group>
  );
}

useGLTF.preload("/Poimandres-transformed.glb");

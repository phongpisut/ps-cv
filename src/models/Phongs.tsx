/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function Model(props: any) {
  const ref = useRef<THREE.Group<THREE.Object3DEventMap>>();
  const { nodes, materials } = useGLTF("/ps-cv/Phongs.gltf");
  return (
    <group {...props} dispose={null} ref={ref}>
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        geometry={(nodes.Layer1 as any).geometry}
        material={materials["Material.1"]}
      />
    </group>
  );
}

useGLTF.preload("/ps-cv/Phongs.gltf");

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  PerspectiveCamera,
  PresentationControls,
} from "@react-three/drei";
import { Model } from "@/models/Poimandres";

export default function MyCanvas() {
  return (
    <Canvas style={{ maxWidth: "100%", maxHeight: "100%" }}>
      <Suspense fallback={null}>
        <PresentationControls
          snap
          global
          zoom={0.8}
          rotation={[0, -Math.PI / 6, 0]}
          polar={[0, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <Model onClick={() => {}} />
        </PresentationControls>
        <Environment files={"/sky.hdr"} />
        <PerspectiveCamera makeDefault position={[0, 1, 10]} zoom={0.7} />
      </Suspense>
    </Canvas>
  );
}

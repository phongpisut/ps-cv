import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  PerspectiveCamera,
  OrbitControls,
} from "@react-three/drei";
import { Model } from "@/models/Phongs";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function MyCanvas() {
  const md = useMediaQuery("(min-width: 640px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  return (
    <Canvas
      className="absolute"
      style={{ height: lg ? "26rem" : md ? "24em" : "19.5em", top: -30 }}
    >
      <Suspense fallback={null}>
        {/* <PresentationControls
          snap
          global
          zoom={0.9}
          rotation={[0, 0, 0]}
          polar={[0, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        > */}
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.5}
          enableZoom={false}
          enablePan={false}
        />
        <Model onClick={() => {}} />
        {/* </PresentationControls> */}
        <Environment files={"/sky.hdr"} />
        <PerspectiveCamera makeDefault position={[0, 10, 40]} zoom={0.38} />
      </Suspense>
    </Canvas>
  );
}

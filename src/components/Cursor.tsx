import * as React from "react";
import { PerfectCursor } from "perfect-cursors";
import { useIsPresent, motion } from "framer-motion";
import popSmoke from "@/assets/popSmoke.png";

export function Cursor({
  point,
  username,
  color,
}: {
  point: number[];
  username: string;
  color?: string;
}) {
  const rCursor = React.useRef(null);
  const isPresent = useIsPresent();

  const animateCursor = React.useCallback((point: number[]) => {
    const elm = rCursor.current;
    if (!elm) return;
    (elm as HTMLElement).style.setProperty(
      "transform",
      `translate(${point[0]}px, ${point[1]}px)`
    );
  }, []);

  const [pc] = React.useState(() => new PerfectCursor(animateCursor));

  React.useLayoutEffect(() => {
    if (point) pc.addPoint(point);
    return () => pc.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pc]);

  const onPointChange = React.useCallback(
    (point: number[]) => pc.addPoint(point),
    [pc]
  );

  React.useLayoutEffect(() => onPointChange(point), [onPointChange, point]);

  return (
    <motion.div
      ref={rCursor}
      style={{
        position: "absolute",
        top: -35,
        left: 30,
        width: 35,
        height: 35,
        zIndex: 100,
      }}
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 35 35"
          fill="none"
          fillRule="evenodd"
        >
          <g fill="rgba(0,0,0,.2)" transform="translate(1,1)">
            <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
            <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
          </g>
          <g fill="white">
            <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
            <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
          </g>
          <g fill={color || "#3b82f6"}>
            <path d="m19.751 24.4155-1.844.774-3.1-7.374 1.841-.775z" />
            <path d="m13 10.814v11.188l2.969-2.866.428-.139h4.768z" />
          </g>
        </svg>
        <div>{username}</div>
      </motion.div>

      {!isPresent && (
        <img
          src={popSmoke}
          className="absolute top-0 left-0 h-auto w-64 animate-pop"
        />
      )}
    </motion.div>
  );
}

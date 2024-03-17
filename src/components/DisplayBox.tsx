import { PointerEvent } from "react";
import type { UserInZone } from "@/types/user";
import { AnimatePresence, motion } from "framer-motion";

type DisplayBoxProps = {
  isConnected?: boolean;
  userInZone: UserInZone;
  zone: number;
  onMouseMove: (e: PointerEvent | null, zone: number) => void;
};

export default function DisplayBox({
  isConnected,
  onMouseMove,
  userInZone,
  zone,
}: DisplayBoxProps) {
  return (
    <div
      id={`zone${zone}`}
      onPointerMove={(e) => onMouseMove(e, zone)}
      onMouseLeave={() => onMouseMove(null, 0)}
      className="min-w-28 min-h-48 bg-slate-900 rounded-md shadow-slate-600 shadow-md hover:translate-y-2 transition-all duration-300 relative"
    >
      <div className="w-full absolute bottom-0 flex gap-4 place-content-end">
        <AnimatePresence>
          {isConnected &&
            userInZone?.[`${zone}`]?.length &&
            userInZone[`${zone}`].map((x, i) => (
              <motion.div
                key={`user-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{ y: 10, scale: 0, opacity: 0 }}
                className="relative w-12 top-1"
              >
                <motion.div
                  animate={{
                    rotate: x.position - 28,
                  }}
                  className="w-6 h-8 bg-gradient-to-b from-white to-slate-300 rounded-full "
                >
                  <div className="w-1/2 h-3 border-r-2 border-slate-300  rounded-tl-full" />
                </motion.div>
                <p
                  style={{ backgroundColor: x.color }}
                  className="text-white mt-1 w-14 whitespace-nowrap overflow-hidden text-ellipsis h-6 px-1 rounded-lg -left-4 absolute"
                >
                  {x.nickname}
                </p>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { PointerEvent } from "react";
import type { UserInZone } from "@/types/user";
import { AnimatePresence, motion } from "framer-motion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type DisplayBoxProps = {
  isConnected?: boolean;
  userInZone: UserInZone;
  zone: number;
  onMouseMove: (e: PointerEvent | null, zone: number) => void;
  work?: Work;
};

type Work = {
  title: string;
  sub: string;
  text: string;
  img: string;
  items: Items[];
};

type Items = {
  img: string;
  name: string;
  description: string;
};

export default function DisplayBox({
  isConnected,
  onMouseMove,
  userInZone,
  zone,
  work,
}: DisplayBoxProps) {
  return (
    <motion.div
      id={`zone${zone}`}
      onPointerMove={(e) => onMouseMove(e, zone)}
      onMouseLeave={() => onMouseMove(null, 0)}
      className="min-w-28 min-h-48 bg-slate-900 rounded-md shadow-slate-600 shadow-md transition-all hover:bg-slate-950 duration-500 relative p-5"
    >
      {work && (
        <div>
          <div className="flex gap-3">
            <img
              src={work?.img}
              alt="work"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h1 className="text-zinc-300 font-bold">{work?.title}</h1>
              <h3 className="text-gray-500">{work?.sub}</h3>
            </div>
          </div>
          <p className="mt-4 text-zinc-200">{work?.text}</p>
          <div className="flex gap-2 mt-3">
            {work?.items &&
              work?.items.map((x, i) => (
                <HoverCard key={`work-${i}`}>
                  <HoverCardTrigger>
                    <img
                      src={x.img}
                      alt=""
                      className="w-8 h-8 rounded-full hover:opacity-70 hover:-translate-y-1 transition-all duration-300"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <img src={x.img} alt="" className="w-8 h-8 rounded-full" />
                    <p>{x.name}</p>
                    <p> {x.description}</p>
                  </HoverCardContent>
                </HoverCard>
              ))}
          </div>
        </div>
      )}
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
    </motion.div>
  );
}

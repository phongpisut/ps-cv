import Particles from "@tsparticles/react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

const Star = React.memo(({ init, theme }: { init: boolean; theme: string }) => (
  <AnimatePresence>
    {init && theme == "dark" && (
      <motion.div
        className="absolute left-0 right-0 h-full w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Particles
          className="h-full w-full "
          id="tsparticles"
          options={{
            background: {
              color: "transparent",
            },
            fullScreen: {
              enable: false,
              zIndex: 1,
            },
            preset: "stars",
          }}
        />
      </motion.div>
    )}
  </AnimatePresence>
));

export default Star;

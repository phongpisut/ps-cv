import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  Suspense,
} from "react";
import { socket } from "./socket";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import throttle from "lodash.throttle";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { initParticlesEngine } from "@tsparticles/react";
import { loadStarsPreset } from "@tsparticles/preset-stars";

import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MyCanvas from "@/components/MyCanvas";
import { Cursor } from "@/components/Cursor";
import LoginOverlay from "@/components/LoginOverlay";
import { getColor } from "@/lib/random";
import profilePic from "@/assets/profile.jpg";
import { useTheme } from "@/components/ThemeProvider";
import Star from "@/components/Star";
import pot from "@/assets/pot.png";
import dirt from "@/assets/dirt.png";
import branch from "@/assets/branch.png";

type User = {
  user: string;
  point: number[];
  nickname: string;
  color?: string;
};

type EventUser = {
  user: string;
  data: string;
}[];

type ItemState = {
  [key: string]: {
    status: boolean;
    update_by: string;
  };
};

type UserInZone = {
  zone1: User[] | [];
  zone2: User[] | [];
};

function Page() {
  const [isConnected, setIsConnected] = useState<boolean>();
  const [userInZone, setUserInZone] = useState<UserInZone>({
    zone1: [],
    zone2: [],
  });
  const [nickname, setNickname] = useState("");
  const [allState, setAllState] = useState<ItemState>({});
  const point = useRef("");
  const colors = useRef("");

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    function onConnect() {
      colors.current = getColor() as string;
      setIsConnected(true);
    }

    function onConsumeState(value: string | ItemState) {
      if (typeof value === "string") {
        //emoji@[nickname]@[emoji]@[socketId]
        const emoji = value?.split("@");
        const nickname = emoji?.[1];
        const emojiName = emoji?.[2] || "like";
        const socketId = emoji?.[3];
        console.log(`${nickname} [${socketId}] - just ${emojiName}!`);
      } else {
        setAllState(value);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onConsume(value: any) {
      if (value?.messages) {
        const zone1: User[] = [];
        const zone2: User[] = [];
        (value?.messages as EventUser)
          ?.filter((x) => x.user !== socket.id)
          ?.forEach((y) => {
            const userData = y.data.split("@");
            const p = userData?.[1].split(",");
            const data = {
              user: y?.user,
              point: [+p[0], +p[1]],
              nickname: userData?.[0],
              color: userData?.[3],
            } as User;
            if (userData[2] === "1") {
              zone1.push(data);
            } else if (userData[2] === "2") {
              zone2.push(data);
            }
            console.log(zone1, zone2);
            setUserInZone({ zone1, zone2 });
          });
        if (value?.items) {
          setAllState(value?.items);
        }
      }
      if (value?.description) {
        const description = value?.description;
        const desc = description?.split("@");
        const title =
          desc?.[0] === "join"
            ? `😁 ${desc[1]} Join!`
            : desc?.[0] === "disconnect"
            ? `🚪 ${desc[1]} Leave!`
            : null;
        if (desc[1] && title) {
          toast(title, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
        }
      }
    }

    socket.on("connect", onConnect);
    socket.on("consume", onConsume);
    socket.on("consumeState", onConsumeState);
    return () => {
      socket.off("connect", onConnect);
      socket.off("consume", onConsume);
      socket.off("consumeState", onConsumeState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onMouseMove = useCallback(
    throttle((e: React.PointerEvent | null, zone: number) => {
      if (e) {
        point.current = `${e.pageX},${e.pageY}`;
      }
      if (nickname) {
        socket.emit(
          "move",
          `${nickname}@${e ? `${e.pageX},${e.pageY}` : point.current}@${zone}@${
            colors.current
          }`
        );
      }
    }, 200),
    [nickname]
  );

  const onJoin = useCallback((name: string) => {
    setNickname(name);
    socket.emit("join", `${name}@0,0@0@${colors.current}`);
  }, []);

  const onChangeState = useCallback(
    (name: string) => {
      const newState = {
        ...allState,
        [name]: {
          status: !allState[name]?.status,
          update_by: nickname,
        },
      };
      setAllState(newState);
      socket.emit("setState", newState);
    },
    [allState, nickname]
  );

  useEffect(() => {
    if (allState["theme"]) {
      setTheme(allState["theme"].status ? "dark" : "light");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allState["theme"]]);

  const [init, setInit] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadStarsPreset(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <div
      className={`bg-zinc-200 flex flex-col items-center dark:bg-slate-900 transition-colors relative overflow-x-hidden  ${
        !nickname && "overflow-y-hidden h-[100vh] "
      }`}
    >
      <ToastContainer />
      <AnimatePresence>
        {!nickname && <LoginOverlay setNickname={onJoin} />}
      </AnimatePresence>
      <AnimatePresence>
        {isConnected &&
          userInZone.zone1.length > 0 &&
          userInZone.zone1.map((x, i) => (
            <Cursor
              point={x.point}
              username={x.nickname}
              color={x.color}
              key={`${i}-cursor`}
            />
          ))}
      </AnimatePresence>
      <motion.div
        className="progress-bar bg-gradient-to-r from-cyan-500 to-blue-500 "
        style={{ scaleX }}
      />
      <motion.div
        animate={
          theme == "dark"
            ? {
                width: "100vw",
                clipPath: "circle(100% at 100px 100px)",
                transition: {
                  duration: "0.5",
                },
              }
            : {
                width: "100vw",

                clipPath: "circle(10px at 10px 10px)",
                transition: {
                  duration: "0.5",
                },
              }
        }
        exit={{ left: "-10px" }}
        className="absolute bg-slate-900 -top-10 left-0 bottom-0 right-0"
      />
      <TooltipProvider>
        <section className="max-w-screen-2xl">
          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 ">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 relative">
              <div className="dark:shadow-lg dark:shadow-blue-500/50 z-10 relative h-64 overflow-visible rounded-lg sm:h-80 lg:order-last lg:h-full shadow-md max-h-[340px] bg-gradient-to-b from-sky-500 to-indigo-500">
                <MyCanvas />
              </div>

              <div className="lg:py-24 flex flex-col sm:flex-row items-center justify-center">
                <div className="rounded-full w-64 h-auto relative z-10 min-w-[180px] dark:shadow-lg dark:shadow-indigo-500/50">
                  <div className=" w-full h-full absolute rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10 hover:opacity-15 duration-300 ease-out transition" />
                  <img
                    src={profilePic}
                    className="rounded-full shadow-md z-[5]"
                  />
                </div>

                <div className="p-5 ">
                  <h2
                    className="dark:shadow-lg dark:shadow-blue-500/50 z-[5]
                sm:pl-[5rem] sm:pr-[2rem] sm:-left-16 relative
                text-3xl font-bold sm:text-4xl rounded-md md:rounded-r-md md:rounded-l-none md:-left-20 bg-gradient-to-r from-cyan-500 to-blue-500 py-2 px-3 text-white"
                  >
                    Phongpisut Meemuk
                  </h2>
                  <p className="mt-4 text-gray-600 text-xl font-bold text-center sm:text-left dark:text-white transition-colors">
                    Web Front-end Developer
                  </p>
                  <p className="text-gray-600 text-xl  text-center sm:text-left dark:text-white transition-colors">
                    (Proficient in{" "}
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 ">
                      ReactJS
                    </span>{" "}
                    )
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="zone1"
          className="bg-slate-800 max-w-screen-2xl w-full relative rounded-t-md dark:rounded-b-md z-20"
          onPointerMove={(e) => onMouseMove(e, 1)}
          onMouseLeave={() => onMouseMove(null, 0)}
        >
          <div className="absolute right-1 rounded-bl-md rounded-tr-md sm:right-0 text-white bg-gradient-to-b from-blue-500 bg-blue-600  shadow-md py-2 px-5 font-bold">
            Cursor Zone 😁
          </div>

          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-8 lg:px-8">
            <div className="w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 text-center mt-5 ">
                WORK EXPERIENCE
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 my-5">
                <div className="min-w-28 min-h-48 bg-slate-900 rounded-md shadow-slate-600 shadow-md hover:translate-y-2 transition-all duration-300" />
                <div className="min-w-28 min-h-48 bg-slate-900 rounded-md shadow-slate-600 shadow-md hover:translate-y-2 transition-all duration-300" />
                <div className="min-w-28 min-h-48 bg-slate-900 rounded-md shadow-slate-600 shadow-md hover:translate-y-2 transition-all duration-300" />
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className="h-full w-full relative flex items-end content-end"
                    onClick={() => onChangeState("box")}
                  >
                    <div className="relative">
                      <motion.img
                        src={branch}
                        draggable={false}
                        animate={
                          allState["box"]?.status
                            ? { rotate: 45, x: 70, y: 65 }
                            : {}
                        }
                        className="relative top-3 left-6 z-[4] "
                      />
                      <motion.img
                        src={pot}
                        draggable={false}
                        animate={
                          allState["box"]?.status
                            ? { rotate: 90, x: 10, y: -15 }
                            : {}
                        }
                        className="z-[5] relative"
                      />
                    </div>
                    <AnimatePresence>
                      {allState["box"]?.status && (
                        <motion.img
                          src={dirt}
                          draggable={false}
                          initial={{ scaleX: 0.2, x: 2 }}
                          animate={{ scaleX: 1, x: 60, y: 0 }}
                          exit={{ opacity: 0, x: 2, scaleX: 0 }}
                          className="absolute bottom-0 z-[3] "
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </TooltipTrigger>
                {allState["box"]?.update_by && (
                  <TooltipContent>
                    <p>{allState["box"]?.update_by}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </section>

        <section className="bg-zinc-300 dark:bg-slate-900 transition-colors max-w-screen-2xl w-full ">
          <div className="mx-auto min-h-[300px] max-w-screen-xl px-4 py-5 sm:px-6 lg:px-8 z-10 relative">
            <div
              className="max-w-3xl w-24 relative bg-blend-difference"
              onClick={() => onChangeState("theme")}
            >
              Hobby
            </div>
            <div>A</div>
            <div className="w-56 h-64"></div>
          </div>
        </section>
        <Suspense>
          <Star init={init} theme={theme} />
        </Suspense>
      </TooltipProvider>
    </div>
  );
}

export default Page;

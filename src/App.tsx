import React, { useCallback, useState, useEffect, useRef } from "react";
import { socket } from "./socket";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import throttle from "lodash.throttle";
import { ToastContainer, toast, Bounce } from "react-toastify";

import MyCanvas from "@/components/MyCanvas";
import { Cursor } from "@/components/Cursor";
import LoginOverlay from "@/components/LoginOverlay";
import { getColor } from "@/utils/random";
import profilePic from "@/assets/profile.jpg";

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

function App() {
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
        console.log(value);
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
        point.current = `${e?.pageX},${e?.pageY}`;
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

  return (
    <div
      className={`relative overflow-x-hidden ${
        !nickname && "overflow-y-hidden h-[100vh]"
      }`}
    >
      <ToastContainer />
      <AnimatePresence>
        {!nickname && <LoginOverlay setNickname={onJoin} />}
      </AnimatePresence>
      <motion.div
        className="progress-bar bg-gradient-to-r from-cyan-500 to-blue-500 "
        style={{ scaleX }}
      />
      <section>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 ">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 relative">
            <div className="z-10 relative h-64 overflow-visible rounded-lg sm:h-80 lg:order-last lg:h-full shadow-md max-h-[340px] ">
              <MyCanvas />
            </div>

            <div className="lg:py-24 flex flex-col sm:flex-row items-center justify-center">
              <div className="rounded-full w-64 h-auto relative z-10 min-w-[180px]">
                <div className="w-full h-full absolute rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10 hover:opacity-15 duration-300 ease-out transition" />
                <img
                  src={profilePic}
                  className="rounded-full shadow-md z-[5]"
                />
              </div>

              <div className="p-5">
                <h2
                  className=" z-[5]
                sm:pl-[5rem] sm:pr-[2rem] sm:-left-16 relative
                text-3xl font-bold sm:text-4xl rounded-md md:rounded-r-md md:rounded-l-none bg-gradient-to-r from-cyan-500 to-blue-500 py-2 px-3 text-white"
                >
                  Phongpisut Meemuk
                </h2>
                <input
                  type="checkbox"
                  checked={allState?.["checkbox"]?.status || false}
                  onChange={() => onChangeState("checkbox")}
                />

                <p className="mt-4 text-gray-600">
                  newformat data: [zone]-[x,y]
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        className="bg-slate-800"
        onPointerMove={(e) => onMouseMove(e, 1)}
        onMouseLeave={() => onMouseMove(null, 0)}
      >
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

        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quod
              alias doloribus impedit.
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="relative h-64 overflow-hidden sm:h-80 lg:h-full">
              <img
                alt=""
                src=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <div className="lg:py-16">
              <article className="space-y-4 text-gray-600">
                <p>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aut
                  qui hic atque tenetur quis eius quos ea neque sunt,
                  accusantium soluta minus veniam tempora deserunt? Molestiae
                  eius quidem quam repellat.
                </p>

                <p>
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                  Dolorum explicabo quidem voluptatum voluptas illo accusantium
                  ipsam quis, vel mollitia? Vel provident culpa dignissimos
                  possimus, perferendis consectetur odit accusantium dolorem
                  amet voluptates aliquid, ducimus tempore incidunt quas.
                  Veritatis molestias tempora distinctio voluptates sint! Itaque
                  quasi corrupti, sequi quo odit illum impedit!
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;

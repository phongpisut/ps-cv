import React, { useCallback, useState, useEffect } from "react";
import "./App.css";

import throttle from "lodash.throttle";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";

import MyCanvas from "@/components/MyCanvas";
import { Cursor } from "@/components/Cursor";
import { socket } from "./socket";
import LoginOverlay from "./components/LoginOverlay";

type User = {
  user: string;
  point: number[];
  nickname: string;
}[];

type EventUser = {
  user: string;
  data: string;
}[];

function App() {
  const [isConnected, setIsConnected] = useState<boolean>();
  const [users, setUsers] = useState<User>([]);
  const [toggle, setToggle] = useState(false);
  const [nickname, setNickname] = useState("");
  const [allState, setAllState] = useState("");

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onConsumeState(value: string) {
      if (value.includes("emoji@")) {
        //emoji@[nickname]@[emoji]@[socketId]
        const emoji = value?.split("@");
        const nickname = emoji?.[1];
        const emojiName = emoji?.[2] || "like";
        const socketId = emoji?.[3];
        console.log(`${nickname} [${socketId}] - just ${emojiName}!`);
      } else {
        const itemState = value?.split("|");
        setToggle(itemState[2] == "true");
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onConsume(value: any) {
      console.log(value);
      if (value?.messages) {
        console.log(value);
        setUsers(
          (value?.messages as EventUser)
            ?.filter((x) => x.user !== socket.id)
            ?.map((y) => {
              const userData = y.data.split("@");
              const p = userData?.[1].split(",");
              return {
                user: y.user,
                point: [+p[0], +p[1]],
                nickname: userData?.[0],
              };
            })
        );
        if (value?.items) {
          console.log(value?.items);
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

  useEffect(() => {
    socket.emit("setState", `${nickname}|toggle|${toggle}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onMouseMove = useCallback(
    throttle((e: React.PointerEvent | null, zone: number) => {
      if (nickname) {
        socket.emit(
          "move",
          `${nickname}@${(e as React.PointerEvent)?.pageX || 0},${
            (e as React.PointerEvent)?.pageY || 0
          }@${zone}`
        );
      }
    }, 200),
    [nickname]
  );

  const onJoin = useCallback((name: string) => {
    setNickname(name);
  }, []);

  return (
    <div
      className={`relative overflow-x-hidden ${
        !nickname && "overflow-y-hidden h-[100vh]"
      }`}
    >
      <AnimatePresence>
        {!nickname && <LoginOverlay setNickname={onJoin} />}
      </AnimatePresence>
      <motion.div className="progress-bar" style={{ scaleX }} />
      <section>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:order-last lg:h-full">
              <MyCanvas />
            </div>

            <div className="lg:py-24">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Grow your audience
              </h2>
              <input
                type="checkbox"
                checked={toggle}
                onChange={() => setToggle((e) => !e)}
              />

              <p className="mt-4 text-gray-600">newformat data: [zone]-[x,y]</p>

              <a
                href="#"
                className="mt-8 inline-block rounded bg-indigo-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-yellow-400"
              >
                Get Started Today
              </a>
            </div>
          </div>
        </div>
      </section>
      <section
        className="bg-slate-800"
        onPointerMove={(e) => onMouseMove(e, 1)}
        onMouseLeave={() => onMouseMove(null, 0)}
      >
        {isConnected &&
          users?.length > 0 &&
          users.map((x, i) => (
            <Cursor point={x.point} username={x.nickname} key={`${i}-cursor`} />
          ))}
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
                src="https://images.unsplash.com/photo-1496843916299-590492c751f4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80"
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

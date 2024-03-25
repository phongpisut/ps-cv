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
import { useContextMenu } from "react-contexify";
import { Helmet } from "react-helmet-async";

import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import MyCanvas from "@/components/MyCanvas";
import LoginOverlay from "@/components/LoginOverlay";
import { getColor } from "@/lib/random";
import profilePic from "@/assets/profile.jpg";
import { useTheme } from "@/components/ThemeProvider";
import DisplayBox from "@/components/DisplayBox";
import Star from "@/components/Star";
import ContextMenu from "@/components/Menu";
import Projects from "@/components/Projects";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { plantPot, jobs, skill } from "@/assets";

import type { User, UserInZone } from "@/types/user";

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

const MENU_ID = "menu-id";

let time: ReturnType<typeof setTimeout>;
function Page() {
  const [isConnected, setIsConnected] = useState<boolean>();
  const [userInZone, setUserInZone] = useState<UserInZone>({
    "1": [],
    "2": [],
    "3": [],
    "4": [],
  });
  const [nickname, setNickname] = useState("");
  const [allState, setAllState] = useState<ItemState>({});
  const colors = useRef("");
  const golangRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef(0);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const { setTheme, theme } = useTheme();

  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const [init, setInit] = useState(false);
  const [title, setTitle] = useState("Phongpisut Meemuk");

  useEffect(() => {
    time = setTimeout(() => setTitle("Phongpisut Meemuk"), 4000);

    return () => clearTimeout(time);
  }, [title]);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadStarsPreset(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  useEffect(() => {
    const state = allState?.["theme"];
    if (state) {
      setTheme(state?.status ? "dark" : "light");
      if (renderRef.current)
        setTitle(state?.status ? "ในนี้มืดจังเลยนะฮะ 🌚" : "Light is back! 💡");
      renderRef.current += 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allState["theme"]]);

  const toastEmoji = useCallback(
    (emojiName: string, name = "") => {
      const display =
        emojiName == "like" ? "👍" : emojiName == "love" ? "🥰" : "😁";
      toast(`${name || nickname} Send ${display}`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    },
    [nickname]
  );

  useEffect(() => {
    function onConnect() {
      colors.current = getColor() as string;
      setIsConnected(true);
    }

    function onConsumeState(value: string | ItemState) {
      if (typeof value === "string") {
        //emoji@[nickname]@[emoji]
        console.log(value);
        const emoji = value?.split("@");
        const nickname = emoji?.[1];
        const emojiName = emoji?.[2] || "like";
        toastEmoji(emojiName, nickname);
      } else {
        setAllState(value);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onConsume(value: any) {
      let tempZone: UserInZone = {};
      if (value?.messages) {
        (value?.messages as EventUser)
          ?.filter((x) => x.user !== socket.id)
          ?.forEach((y) => {
            const userData = y.data.split("@");
            const data = {
              user: y?.user,
              nickname: userData?.[0],
              color: userData?.[2],
              position: +userData?.[3],
            } as User;

            if (userData[1] !== "0") {
              if (!tempZone[userData[1]]) {
                tempZone = { ...tempZone, [userData[1]]: [data] };
              } else {
                (tempZone[userData[1]] as User[]).push(data);
              }
            }
          });
        setUserInZone(tempZone);
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
      if (nickname) {
        let rect = { left: 0, top: 0 };
        const elem = document.getElementById(`zone${zone}`);
        if (elem) {
          const scale = elem.offsetWidth / 4;
          const bound = elem.getBoundingClientRect();
          rect = { left: bound.left + Math.floor(scale), top: bound.top };
        }

        const rad = e ? Math.atan2(e?.pageX - rect.left, e.pageY) : 0;
        const rot = rad * (180 / Math.PI) * 3;
        socket.emit("move", `${nickname}@${zone}@${colors.current}@${rot}`);
      }
    }, 300),
    [nickname]
  );

  const onJoin = useCallback((name: string) => {
    setNickname(name);
    setTitle(`Welcome ${name} 🥰`);
    socket.emit("join", `${name}@0@${colors.current}`);
  }, []);

  const onChangeState = useCallback(
    (name: string) => {
      const newState = {
        ...allState,
        [name]: {
          status: !allState[name]?.status,
          update_by: `${nickname}👆`,
        },
      };
      setAllState(newState);
      socket.emit("setState", newState);
    },
    [allState, nickname]
  );

  const onSelectMenu = useCallback(
    (menu: string) => {
      toastEmoji(menu, "[You]");
      socket.emit("emoji", `${nickname}@${menu}`);
    },
    [nickname, toastEmoji]
  );

  function displayMenu(e: React.MouseEvent) {
    show({
      event: e,
    });
  }

  return (
    <div
      className={`bg-zinc-200 flex flex-col items-center dark:bg-slate-900 transition-colors relative overflow-x-hidden  ${
        !nickname && "overflow-y-hidden h-[100vh] "
      }`}
    >
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <ToastContainer />
      <AnimatePresence>
        {!nickname && <LoginOverlay setNickname={onJoin} />}
      </AnimatePresence>

      <ContextMenu handleItemClick={onSelectMenu} id={MENU_ID} />

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
                  <div className=" w-full h-full absolute rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-15 hover:opacity-30 duration-1000 ease-out transition" />
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
          onContextMenu={displayMenu}
          id="zone1"
          className="bg-slate-800 max-w-screen-2xl w-full relative rounded-t-md 2xl:rounded-b-md z-20"
        >
          <div className="absolute right-1 rounded-bl-md rounded-tr-md sm:right-0 text-white bg-gradient-to-b from-blue-500 bg-blue-600  shadow-md py-2 px-5 font-bold">
            Cursor Zone 😁
          </div>

          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-8 lg:px-8 ">
            <div className="w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 text-center mt-5 ">
                WORK EXPERIENCE
              </h2>
              <div className="grid grid-cols-1 gap-10 sm:gap-y-8 sm:gap-4 sm:grid-cols-2  my-5">
                <DisplayBox
                  isConnected={isConnected}
                  userInZone={userInZone}
                  zone={1}
                  onMouseMove={onMouseMove}
                  work={{
                    img: jobs.scb,
                    items: [
                      {
                        description: `I used the LINE Message API for the first time. 
                        I learned about sending different types of messages and how Chatbot agents work.`,
                        name: "Line Message API",
                        img: skill.line,
                      },
                      {
                        description: `I lead the development of a static website using 
                        React.js (Typescript), with a focus on performance and constraints.`,
                        name: "React.JS",
                        img: skill.react,
                      },
                    ],
                    title: "SCB | Connect , Service Portal",
                    sub: "Front-End Developer (Contract)",
                    text: `I leverage React.js to build high-performance static LIFF web apps
                     for the SCB Connect and guide the team by explaining the core of LINE LIFF and how it works.
                     This knowledge helps them build the front-end effectively`,
                  }}
                />
                <DisplayBox
                  isConnected={isConnected}
                  userInZone={userInZone}
                  zone={2}
                  onMouseMove={onMouseMove}
                  work={{
                    img: jobs.pttd,
                    items: [
                      {
                        description: `I used ArcGIS to create 
                        geofence markers and display map layers for the first time.`,
                        name: "Arcgis.JS",
                        img: skill.arcgis,
                        className: "bg-white",
                      },
                      {
                        description: `This is my first time transitioning from a 
                        React Native developer to a web developer.`,
                        name: "React.JS",
                        img: skill.react,
                      },
                      {
                        description: `I used Kubernetes to deploy a microservice for the first time.`,
                        name: "Kubernetes",
                        img: skill.k8s,
                      },
                    ],
                    title: "PTT DIGITAL | ATA/A",
                    sub: "Web Developer (Contract)",
                    text: `Develop a dashboard and website that utilize custom markers 
                    and geofences on a map using ArcGIS and React.js, 
                    along with a static site project built with Vite.`,
                  }}
                />
                <DisplayBox
                  isConnected={isConnected}
                  userInZone={userInZone}
                  zone={3}
                  onMouseMove={onMouseMove}
                  work={{
                    img: jobs.tcrb,
                    items: [
                      {
                        description: `I gained the most knowledge about React Native from this place.`,
                        name: "React Native",
                        img: skill.rn,
                        className: "bg-white",
                      },
                      {
                        description: `Here, I started using TypeScript in production for the first time.`,
                        name: "TypeScript",
                        img: skill.ts,
                      },
                      {
                        description: `I learned about AWS Pub/Sub service and Lambda.`,
                        name: "Kubernetes",
                        img: skill.aws,
                      },
                    ],
                    title: "TCRB | Mobile Team",
                    sub: "React Native Developer (Contract)",
                    text: `Develop a mobile app using React Native with TypeScript.
                     Validate data at runtime using io-ts and implement a native module for MLKit.`,
                  }}
                />
                <DisplayBox
                  isConnected={isConnected}
                  userInZone={userInZone}
                  zone={4}
                  onMouseMove={onMouseMove}
                  work={{
                    img: jobs.fin,
                    items: [
                      {
                        description: `I used React Native (Javascript) to develop a production app for the first time here.`,
                        name: "React Native",
                        img: skill.rn,
                        className: "bg-white",
                      },
                      {
                        description: `I used React.JS to develop a production static website for the first time here.`,
                        name: "React.JS",
                        img: skill.react,
                      },
                    ],
                    title: "Fin Insurance",
                    sub: "Front-end Developer (Full-time)",
                    text: `This is the first place I worked after graduating. I develop a mobile app using React Native. Integrate a custom graph built
                     with react-native-svg. Additionally, create a real-time website using Socket.IO.`,
                  }}
                />
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className="h-full w-full relative flex items-end content-end"
                    onClick={() => onChangeState("box")}
                  >
                    <div className="relative hover:translate-x-1 transition-all ">
                      <motion.img
                        src={plantPot.plant}
                        draggable={false}
                        animate={
                          allState["box"]?.status
                            ? { rotate: 45, x: 70, y: 65 }
                            : {}
                        }
                        className="relative top-3 left-6 z-[4] "
                      />
                      <motion.img
                        src={plantPot.pot}
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
                          src={plantPot.dirt}
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

        <section className="bg-zinc-200 dark:bg-slate-900 transition-colors max-w-screen-2xl w-full min-h-[450px]">
          <div className="mx-auto min-h-[300px] max-w-screen-xl px-4 py-5 sm:px-6 lg:px-8 z-10 relative">
            <div
              onClick={() => onChangeState("theme")}
              className="hover:opacity-80 transition-all cursor-pointer w-24 h-10 rounded-full bg-gradient-to-r dark:bg-gradient-to-l dark:from-blue-950 dark:to-slate-900 from-sky-500 to-zinc-200  flex items-center px-2"
            >
              <motion.div
                animate={{ x: theme === "dark" ? "3rem" : 0 }}
                className=" w-7 h-7 rounded-full dark:from-yellow-400 dark:to-yellow-100 bg-gradient-to-t from-orange-500 to-red-500 shadow-sm shadow-white"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start mb-10">
              <Tooltip>
                <TooltipTrigger>
                  <motion.div
                    className="cursor-pointer text-left"
                    onClick={() => onChangeState("hobby")}
                    animate={
                      allState?.["hobby"]?.status
                        ? {
                            rotate: -3,
                          }
                        : {}
                    }
                  >
                    <Card className="w-full pb-4">
                      <CardHeader>
                        <CardTitle>About Me</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <b>Personality 😶</b>
                        <p>
                          My personality can be described as INFJ or INFP
                          according to the MBTI, mostly because I am introverted
                          but I have a highly adaptable ability.
                        </p>
                        <br />
                        <b>Hobby 🎮</b>
                        <p>
                          Mostly, I play PC games, but sometimes I find myself
                          immersed in new frameworks or programming language
                          videos.
                        </p>
                        <br />
                        <b>Why 🤔</b>
                        <p>
                          You might ask why I change jobs so often. It's mainly
                          because I prioritize avoiding long commutes 🚋 or
                          gaining new experiences.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TooltipTrigger>
                {allState["hobby"]?.update_by && (
                  <TooltipContent>
                    <p>{allState["hobby"]?.update_by}</p>
                  </TooltipContent>
                )}
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <motion.div
                    className="cursor-pointer text-left"
                    onClick={() => onChangeState("learn")}
                    animate={
                      allState?.["learn"]?.status
                        ? {
                            rotate: 3,
                          }
                        : {}
                    }
                  >
                    <Card className="w-full">
                      <CardHeader>
                        <CardTitle>Learning 📖</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>
                          For complex front-end websites, I think
                          <span className="font-bold text-blue-500">
                            {" React.js "}
                          </span>
                          remains unbeatable due to its rich ecosystem. While
                          I've tried frameworks like
                          <span className="font-bold text-slate-700 dark:text-zinc-300">
                            {" Svelte "}
                          </span>
                          and
                          <span className="font-bold text-slate-700 dark:text-zinc-300">
                            {" Vue "}
                          </span>
                          to confirm their performance claims (and yes, they
                          really are fast), they lack the comprehensive support
                          <span className="font-bold text-blue-500">
                            {" React "}
                          </span>
                          offers.
                        </p>
                        <br />
                        <p>
                          For high-performance back-end development, Rust and Go
                          are certainly top contenders. While I haven't enjoyed
                          learning
                          <span className="font-bold text-stone-600 dark:text-stone-400">
                            {" Rust "}
                          </span>
                          as much, I find myself drawn to{" "}
                          <span className="font-bold text-cyan-500">
                            {" Go "}
                          </span>
                          . I often watch Golang videos and code simple projects
                          for fun, and I'm quite fond of it,
                        </p>
                        <br />
                        <div
                          className="flex items-center relative"
                          ref={golangRef}
                        >
                          <p>So, I'm on track to learn more</p>
                          <motion.img
                            animate={
                              allState["learn"]?.status
                                ? {
                                    x: golangRef?.current?.clientWidth
                                      ? golangRef?.current?.clientWidth - 228
                                      : 0,
                                  }
                                : { x: 0 }
                            }
                            transition={
                              allState["learn"]?.status
                                ? {
                                    ease: "easeOut",
                                    duration: 2,
                                  }
                                : {
                                    ease: "easeOut",
                                    duration: 0.5,
                                  }
                            }
                            className="w-[2rem] h-[0.76rem] ml-1 mt-1"
                            src={skill.go}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TooltipTrigger>
                {allState["learn"]?.update_by && (
                  <TooltipContent>
                    <p>{allState["learn"]?.update_by}</p>
                  </TooltipContent>
                )}
              </Tooltip>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <Projects />
                </CardContent>
              </Card>
            </div>
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

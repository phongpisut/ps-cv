import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginOverlay({
  setNickname,
}: {
  setNickname: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <motion.div
      key={"loginModal"}
      onClick={() => text && setNickname(text)}
      initial={{ scale: 1, opacity: 0.2 }}
      animate={{ scale: 1, opacity: 0.75 }}
      exit={{ opacity: 0 }}
      className="absolute bg-black w-screen h-full z-[100] opacity-75 place-content-center flex overflow-y-hidden"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setNickname(text);
        }}
        className="top-[40vh] absolute flex flex-col max-w-[80%]"
      >
        <input
          autoFocus
          className="text-white bg-transparent text-center text-5xl md:text-8xl outline-none border-b-2 md:border-b-4"
          onChange={(e) => {
            if (
              /^[a-zA-Z]*$/.test(e.target.value) &&
              e.target.value?.length < 10
            )
              setText(e.target.value);
          }}
          value={text}
        />
        <label className="text-white text-center text-1xl md:text-3xl">
          Nickname [A-Z]
        </label>
      </form>
    </motion.div>
  );
}

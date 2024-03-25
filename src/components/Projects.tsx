import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import github from "@/assets/github.png";

const ImgStyle =
  "w-8 h-8 bg-white dark:rounded-full dark:border-2 dark:border-white";
const LinkStyle =
  "font-bold underline text-slate-600 text-lg dark:text-slate-200";

export default function Projects() {
  return (
    <Carousel className="w-[90%] mx-auto">
      <CarouselContent>
        <CarouselItem>
          <div className="flex gap-2">
            <img src={github} className={ImgStyle} />
            <a
              target="_blank"
              href="https://github.com/phongpisut/rustio"
              className={LinkStyle}
            >
              rustio
            </a>
          </div>
          <p className="mt-4">
            This is a simple Rust project built to run a high-performance
            Socket.IO server on a small free instance.
          </p>
        </CarouselItem>
        <CarouselItem>
          <div className="flex gap-2">
            <img src={github} className={ImgStyle} />
            <a
              target="_blank"
              href="https://github.com/phongpisut/rust-grpc"
              className={LinkStyle}
            >
              rust-grpc
            </a>
          </div>
          <p className="mt-4">
            This is a simple gRPC Rust project that demonstrates how Rust
            simplifies building Protobuf files.
          </p>
        </CarouselItem>
        <CarouselItem>
          <div className="flex gap-2">
            <img src={github} className={ImgStyle} />
            <a
              target="_blank"
              href="https://github.com/phongpisut/go-fiber-htmx-tailwindcss"
              className={LinkStyle}
            >
              go-fiber-htmx-tailwindcss
            </a>
          </div>
          <p className="mt-4">
            A simple Go project to test Htmx functionality using HTML templates,
            minified Tailwind CSS, and hot reloading with Air.
          </p>
        </CarouselItem>
        <CarouselItem>
          <div className="flex gap-2">
            <img src={github} className={ImgStyle} />
            <a
              target="_blank"
              href="https://github.com/phongpisut/fiber-air-docker-mongo"
              className={LinkStyle}
            >
              fiber-air-docker-mongo
            </a>
          </div>
          <p className="mt-4">
            A simple GoLang project utilizing Fiber to test interactions with
            MongoDB.
          </p>
        </CarouselItem>
        <CarouselItem>
          <div className="flex gap-2">
            <img src={github} className={ImgStyle} />
            <a
              target="_blank"
              href="https://github.com/phongpisut/backend-master-class-course-win11"
              className={LinkStyle}
            >
              backend-master-class-course-win11
            </a>
          </div>
          <p className="mt-4">
            A repository to store what I learn from the Golang course.
          </p>
        </CarouselItem>
        <CarouselItem>
          <div className="flex gap-2">
            <img src={github} className={ImgStyle} />
            <a
              target="_blank"
              href="https://github.com/phongpisut/react-interview"
              className={LinkStyle}
            >
              react-interview
            </a>
          </div>
          <p className="mt-4">Website for DriveHub Technical Interview</p>
        </CarouselItem>
        <CarouselItem>
          <div className="flex gap-2">
            <img src={github} className={ImgStyle} />
            <a
              target="_blank"
              href="https://github.com/phongpisut/phongs"
              className={LinkStyle}
            >
              phongs
            </a>
          </div>
          <p className="mt-4">
            A Next.js project to display a congratulatory message for my
            graduation from university during the COVID-19 pandemic.
          </p>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

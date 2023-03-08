import { IconExternalLink } from "@tabler/icons-react";
import Image from "next/image";
import { FC } from "react";
import cover from "../public/cover.jpeg";

export const Navbar: FC = () => {
  return (
    <div className="flex h-[60px] border-b border-gray-300 py-2 px-8 items-center justify-between">
      <div className="font-bold text-2xl flex items-center">
        <Image
          className="hidden sm:flex"
          src={cover}
          alt="The Mahabharata GPT"
          width={30}
          height={30}
        />
        <div className="ml-2">The Mahabharata GPT</div>
      </div>
      {/* <div>
        <a
          className="flex items-center hover:opacity-50"
          href="https://en.wikipedia.org/wiki/C._Rajagopalachari"
          target="_blank"
          rel="noreferrer"
        >
          <div className="hidden sm:flex">C. Rajagopalachari</div>

          <IconExternalLink
            className="ml-1"
            size={20}
          />
        </a>
      </div> */}
    </div>
  );
};

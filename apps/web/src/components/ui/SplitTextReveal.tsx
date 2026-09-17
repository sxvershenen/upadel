import { motion } from "framer-motion";
import React, { type CSSProperties } from "react";
import { cn } from "../../utils/cn";
import { springSoft } from "../../lib/motion";

const shortWord = /^(в|во|и|к|ко|с|со|у|о|об|от|до|за|на|по|из|без|для|при|под|над|через|после|между)$/i;

function joinWords(text: string) {
  const source = text.trim().split(/\s+/);
  const words: string[] = [];

  for (let i = 0; i < source.length; i += 1) {
    if (shortWord.test(source[i]) && source[i + 1]) {
      words.push(`${source[i]}\u00a0${source[i + 1]}`);
      i += 1;
    } else {
      words.push(source[i]);
    }
  }

  return words;
}

export function SplitTextReveal({
  text,
  className,
  animateOnMount = false,
  delay = 0,
}: {
  text: string;
  className?: string;
  animateOnMount?: boolean;
  delay?: number;
}) {
  const words = joinWords(text);
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.045, delayChildren: delay } },
  };
  const word = {
    hidden: { opacity: 0, y: "0.7em", filter: "blur(5px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { ...springSoft, duration: 0.7 } },
  };

  return (
    <motion.span
      className={cn("inline", className)}
      variants={container}
      {...(animateOnMount ? {} : { initial: false, whileInView: "show", viewport: { once: true, margin: "-80px" } })}
    >
      {words.map((item, index) => (
        <motion.span key={`${item}-${index}`} data-hero-word={animateOnMount ? "" : undefined} style={animateOnMount ? { "--hero-word-index": index } as CSSProperties : undefined} className="mr-[0.25em] inline-block last:mr-0" variants={word}>
          {item}
        </motion.span>
      ))}
    </motion.span>
  );
}

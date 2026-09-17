import { motion } from "framer-motion";
import React from "react";
import { cn } from "../../utils/cn";
import { springSoft } from "../../lib/motion";
import { useSsrReveal } from "./useSsrReveal";

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
  const { ref, controls } = useSsrReveal<HTMLSpanElement>("-80px", animateOnMount);
  const word = {
    hidden: { opacity: 0, y: "0.7em", filter: "blur(5px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { ...springSoft, duration: 0.7 } },
  };

  return (
    <motion.span
      ref={ref}
      className={cn("inline", className)}
      initial="show"
      animate={controls}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: delay } } }}
    >
      {joinWords(text).map((item, index) => (
        <motion.span key={`${item}-${index}`} className="mr-[0.25em] inline-block last:mr-0" variants={word}>
          {item}
        </motion.span>
      ))}
    </motion.span>
  );
}

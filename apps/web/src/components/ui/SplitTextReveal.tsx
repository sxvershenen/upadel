import React, { type CSSProperties } from "react";
import { cn } from "../../utils/cn";

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
  reveal = true,
}: {
  text: string;
  className?: string;
  animateOnMount?: boolean;
  delay?: number;
  reveal?: boolean;
}) {
  const words = joinWords(text);
  const revealStyle = { "--reveal-delay": `${delay}s` } as CSSProperties;
  return <span data-reveal-text={reveal && !animateOnMount ? true : undefined} className={cn("inline", className)} style={reveal && !animateOnMount ? revealStyle : undefined}>
      {words.map((item, index) => (
        <span key={`${item}-${index}`} data-hero-word={animateOnMount && reveal ? "" : undefined} data-reveal-word={reveal && !animateOnMount ? true : undefined} style={animateOnMount && reveal ? { "--hero-word-index": index } as CSSProperties : undefined} className="mr-[0.25em] inline-block last:mr-0">
          {item}
        </span>
      ))}
    </span>;
}

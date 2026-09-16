import { useRef } from "react";
import { motion } from "framer-motion";
import { blogMain } from "../../data/content";
import { springSoft } from "../../lib/motion";
import { useImageParallax } from "../../lib/useImageParallax";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";

export type Article = (typeof blogMain)[number];
export type ArticleSummary = Pick<Article, "title" | "description">;

export function ArticleCard({ post, mobilePlain = false }: { post: Article; mobilePlain?: boolean }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const imageY = useImageParallax(imageRef);
  return <motion.a href="#" initial="rest" whileHover="hover" variants={{ rest: { y: 0 }, hover: { y: -5 } }} transition={springSoft} className="card-spring group group/card flex cursor-pointer flex-col">
    <div ref={imageRef} data-parallax-viewport className="parallax-viewport se-3 relative aspect-[4/3] w-full">
      <motion.div data-parallax-layer style={{ y: imageY }} className="parallax-layer overflow-hidden"><motion.img src={post.image} alt={post.title} loading="lazy" className="h-full w-full object-cover" variants={{ rest: { scale: 1.04 }, hover: { scale: 1.095 } }} transition={springSoft} /></motion.div>
      <div className={`absolute left-3 top-3 items-center gap-2 ${mobilePlain ? "hidden md:flex" : "flex"}`}><Badge tone="light">{post.category}</Badge></div>
      <div className="absolute right-3 top-3"><ArrowAction tone="light" size="sm" cardHover className="!bg-control !text-ink" /></div>
    </div>
    <div className={mobilePlain ? "py-5" : ""}><h3 className={mobilePlain ? "type-title-compact text-ink" : "type-title-compact mt-4 text-ink"}>{post.title}</h3><p className="type-body-sm mt-1.5 text-ink-soft">{post.description}</p></div>
  </motion.a>;
}

export function ArticleRow({ post, delay = 0 }: { post: ArticleSummary; delay?: number }) {
  return <motion.a href="#" initial="hidden" whileInView="visible" whileHover="hover" viewport={{ once: true, margin: "-50px" }} variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 }, hover: { x: 4 } }} transition={{ ...springSoft, delay }} className="card-spring group group/card flex cursor-pointer items-center justify-between gap-4 border-b border-ink/10 py-5 first:pt-0">
    <div><h4 className="type-body text-ink">{post.title}</h4><p className="type-body-sm mt-1 text-ink-soft">{post.description}</p></div>
    <ArrowAction tone="light" size="sm" cardHover className="shrink-0 !bg-control !text-ink shadow-none transition-colors group-hover/card:!bg-lime group-hover/card:!text-ink" />
  </motion.a>;
}

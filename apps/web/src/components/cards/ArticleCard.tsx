import { useRef, type CSSProperties } from "react";
import { motion } from "framer-motion";
import type { ArticleCatalogItem, HomepageDTO } from "@unlim/content-contract";
import { springSoft } from "../../lib/motion";
import { useImageParallax } from "../../lib/useImageParallax";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";

export type Article = HomepageDTO["entities"]["articles"][number] | ArticleCatalogItem;
export type ArticleSummary = Pick<Article, "title" | "excerpt" | "slug">;

export function ArticleCard({ post, mobilePlain = false }: { post: Article; mobilePlain?: boolean }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const imageY = useImageParallax(imageRef);
  return <motion.a href={`/blog/${post.slug}`} initial="rest" whileHover="hover" variants={{ rest: { y: 0, scale: 1 }, hover: { y: -5, scale: 1.012 } }} transition={springSoft} className="card-spring group group/card flex cursor-pointer flex-col">
    <div ref={imageRef} data-parallax-viewport className="parallax-viewport se-3 relative aspect-[4/3] w-full">
      <motion.div data-parallax-layer style={{ y: imageY }} className="parallax-layer overflow-hidden"><motion.img src={post.image.url} alt={post.image.alt} loading="lazy" className="h-full w-full object-cover" variants={{ rest: { scale: 1.04 }, hover: { scale: 1.095 } }} transition={springSoft} /></motion.div>
      <div className={`absolute left-3 top-3 items-center gap-2 ${mobilePlain ? "hidden md:flex" : "flex"}`}><Badge tone="glass">{typeof post.category === "string" ? post.category : post.category.title}</Badge></div>
      <div className="absolute right-3 top-3"><ArrowAction tone="glass" size="sm" cardHover /></div>
    </div>
    <div className={mobilePlain ? "py-5" : ""}><h3 className={mobilePlain ? "type-title-compact text-ink" : "type-title-compact mt-4 text-ink"}>{post.title}</h3><p className="type-body-sm mt-1 text-ink-soft">{post.excerpt}</p></div>
  </motion.a>;
}

export function ArticleRow({ post, delay = 0 }: { post: ArticleSummary; delay?: number }) {
  const style = { "--reveal-delay": `${delay}s`, "--reveal-y": "14px" } as CSSProperties;
  return <motion.a href={`/blog/${post.slug}`} data-reveal style={style} initial={false} whileHover="hover" variants={{ hover: { x: 4 } }} transition={springSoft} className="card-spring group group/card flex cursor-pointer items-center justify-between gap-4 border-b border-ink/10 py-5 first:pt-0">
    <div><h4 className="type-body text-ink">{post.title}</h4><p className="type-body-sm mt-1 text-ink-soft">{post.excerpt}</p></div>
    <ArrowAction tone="light" size="sm" cardHover className="shrink-0 !bg-control !text-ink transition-colors group-hover/card:!bg-lime group-hover/card:!text-ink" />
  </motion.a>;
}

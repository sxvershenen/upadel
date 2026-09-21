import { useRef } from "react";
import { motion } from "framer-motion";
import type { ArticleCatalogItem, HomepageDTO } from "@unlim/content-contract";
import { springSoft } from "../../lib/motion";
import { useImageParallax } from "../../lib/useImageParallax";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";
import { revealAttributes, type RevealConfig } from "../ui/revealAttributes";
import { ProgressiveImage } from "../ui/ProgressiveImage";

export type Article = HomepageDTO["entities"]["articles"][number] | ArticleCatalogItem;
export type ArticleSummary = Pick<Article, "title" | "excerpt" | "slug">;

export function ArticleCard({ post, mobilePlain = false, loading = "eager", reveal = true }: { post: Article; mobilePlain?: boolean; loading?: "eager" | "lazy"; reveal?: RevealConfig }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const imageY = useImageParallax(imageRef);
  return <motion.a {...revealAttributes(reveal, undefined, true)} href={`/blog/${post.slug}`} initial="rest" whileHover="hover" variants={{ rest: { y: 0, scale: 1 }, hover: { y: -5, scale: 1.012 } }} transition={springSoft} className={`card-spring group group/card flex cursor-pointer flex-col ${mobilePlain ? 'border-b border-ink/10 pb-5' : ''}`}>
    <div ref={imageRef} data-parallax-viewport className="parallax-viewport se-3 relative aspect-[4/3] w-full">
      <motion.div data-parallax-layer style={{ y: imageY }} className="parallax-layer overflow-hidden"><ProgressiveImage src={post.image.url} alt={post.image.alt} loading={loading} className="h-full w-full object-cover" variants={{ rest: { scale: 1.04 }, hover: { scale: 1.095 } }} transition={springSoft} /></motion.div>
      <div className={`absolute left-3 top-3 items-center gap-2 ${mobilePlain ? "hidden md:flex" : "flex"}`}><Badge tone="glass">{typeof post.category === "string" ? post.category : post.category.title}</Badge></div>
      <div className="absolute right-3 top-3"><ArrowAction tone="glass" size="sm" cardHover /></div>
    </div>
    <div className={mobilePlain ? "pt-5" : ""}><h3 className={mobilePlain ? "type-title-compact text-ink" : "type-title-compact mt-4 text-ink"}>{post.title}</h3><p className={`type-body-sm text-ink-soft ${mobilePlain ? 'mt-2' : 'mt-1'}`}>{post.excerpt}</p></div>
  </motion.a>;
}

export function ArticleRow({ post, delay = 0 }: { post: ArticleSummary; delay?: number }) {
  return <motion.a {...revealAttributes({ delay, y: 14 }, undefined, true)} href={`/blog/${post.slug}`} initial={false} whileHover="hover" variants={{ hover: { x: 4 } }} transition={springSoft} className="card-spring group group/card flex cursor-pointer items-start justify-between gap-3 border-b border-ink/10 px-0 py-5 first:pt-0">
    <div><h4 className="type-title-compact font-semibold text-ink transition-colors group-hover/card:text-ink-hover md:type-body md:font-medium">{post.title}</h4><p className="type-body-sm mt-2 text-ink-soft">{post.excerpt}</p></div>
    <ArrowAction tone="light" size="sm" cardHover className="shrink-0 !bg-control !text-ink transition-colors group-hover/card:!bg-lime group-hover/card:!text-ink" />
  </motion.a>;
}

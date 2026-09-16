import { blogMain, blogSecondary } from "../data/content";
import { ArticleCard, ArticleRow } from "../components/cards/ArticleCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";

export function Blog() {
  return <section className="container-page py-20 md:py-28">
    <Reveal><SectionHeader eyebrow="Медиа" title="Блог и статьи" action={<Button variant="neutral" size="sm">Ещё →</Button>} className="mb-10" /></Reveal>
    <Reveal className="hidden gap-8 md:grid md:grid-cols-3">{blogMain.map((post, index) => <Reveal key={post.id} delay={index * 0.08}><ArticleCard post={post} /></Reveal>)}</Reveal>
    <Reveal className="md:hidden"><div className="max-w-[760px]"><ArticleCard post={blogMain[0]} mobilePlain /></div><div className="mt-4">{blogMain.slice(1).map((post, index) => <ArticleRow key={post.id} post={post} delay={index * 0.06} />)}{blogSecondary.flat().map((post, index) => <ArticleRow key={post.title} post={post} delay={(index + 2) * 0.06} />)}</div></Reveal>
    <div className="mt-16 hidden gap-x-10 gap-y-2 md:grid md:grid-cols-2">{blogSecondary.map((column, columnIndex) => <div key={columnIndex} className="flex flex-col">{column.map((post, index) => <ArticleRow key={post.title} post={post} delay={index * 0.06} />)}</div>)}</div>
  </section>;
}

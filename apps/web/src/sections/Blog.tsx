import { useContent } from "../content/ContentContext";
import { ArticleCard, ArticleRow } from "../components/cards/ArticleCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Reveal } from "../components/ui/Reveal";
import { ContentAction } from "../components/ContentAction";
import { ArrowRight } from "lucide-react";

export function Blog() {
  const { home, entities } = useContent();
  const blogMain = entities.articles;
  const blogSecondary = entities.articleRows;
  return <section className="container-page py-20 md:py-28">
    <Reveal><SectionHeader eyebrow={home.blogSection.eyebrow} title={home.blogSection.title} action={<ContentAction action={home.blogSection.action} variant="neutral" size="sm" icon={<ArrowRight size={15} />}>{home.blogSection.action.label?.replace(/\s*[→↗]+$/, '') || 'Все'}</ContentAction>} className="mb-10" /></Reveal>
    <Reveal className="hidden gap-x-8 gap-y-12 md:grid md:grid-cols-3">{blogMain.map((post, index) => <Reveal key={post.id} delay={index * 0.08}><ArticleCard post={post} loading="lazy" /></Reveal>)}</Reveal>
    {blogMain[0] && <Reveal className="md:hidden"><div className="max-w-[760px]"><ArticleCard post={blogMain[0]} mobilePlain loading="lazy" /></div><div className="mt-4">{blogMain.slice(1).map((post, index) => <ArticleRow key={post.id} post={post} delay={index * 0.06} />)}{blogSecondary.map((post, index) => <ArticleRow key={post.id} post={post} delay={(index + 2) * 0.06} />)}</div></Reveal>}
    <div className="mt-16 hidden gap-x-10 gap-y-12 md:grid md:grid-cols-2">{[blogSecondary.slice(0, 3), blogSecondary.slice(3)].map((column, columnIndex) => <div key={columnIndex} className="flex flex-col">{column.map((post, index) => <ArticleRow key={post.id} post={post} delay={index * 0.06} />)}</div>)}</div>
  </section>;
}

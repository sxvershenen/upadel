import type { MediaDTO } from '@unlim/content-contract'

export function BrandWordmark({ media, name, className = '' }: { media?: Pick<MediaDTO, 'url'> | null; name: string; className?: string }) {
  return media ? <img src={media.url} width="1066" height="71" alt={name} className={`object-contain ${className}`} /> : <span className="text-[14px] font-semibold text-white">{name}</span>
}

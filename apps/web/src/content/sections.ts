import type { HomepageDTO, HomeSectionKey } from '@unlim/content-contract'

export function visibleHomepageSections(sections: HomepageDTO['sections']): HomeSectionKey[] {
  return sections.filter(({ visible }) => visible).map(({ key }) => key)
}

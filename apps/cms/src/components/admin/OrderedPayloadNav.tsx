import { DefaultNav } from '@payloadcms/next/rsc'
import { DefaultNavClient } from '@payloadcms/next/client'
import type { ReactElement, ReactNode } from 'react'
import React, { Children, cloneElement, isValidElement } from 'react'

import { orderPayloadNavGroups } from './orderedNavGroups'

function replaceNavGroups(node: ReactNode): ReactNode {
  if (!isValidElement(node)) return node
  const element = node as ReactElement<{ children?: ReactNode; groups?: unknown; navPreferences?: unknown }>
  const children = Children.map(element.props.children, replaceNavGroups)
  const groups = element.props.groups
  const isNavClient = Array.isArray(groups) && 'navPreferences' in element.props && groups.every((group) => Boolean(group && typeof group === 'object' && 'label' in group && 'entities' in group))
  const props = { ...element.props, ...(isNavClient ? { groups: orderPayloadNavGroups(groups as React.ComponentProps<typeof DefaultNavClient>['groups']) } : {}) }
  return cloneElement(element, { ...props, children })
}

/** Keep Payload's native navigation behavior while putting its native groups in the accepted order. */
export async function OrderedPayloadNav(props: Parameters<typeof DefaultNav>[0]) {
  return replaceNavGroups(await DefaultNav(props))
}

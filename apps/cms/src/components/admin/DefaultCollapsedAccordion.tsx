'use client'

import { FieldLabel, useCollapsible, useDocumentInfo, useRowLabel } from '@payloadcms/ui'
import type { CollapsibleFieldClient, FieldLabelClientProps } from 'payload'
import { useLayoutEffect, useRef } from 'react'
import { homepageSectionRowTitle } from '../../fields/homepageSections'

function CloseExpandedOnEditorOpen() {
  const { isCollapsed, toggle } = useCollapsible()
  const { preferencesKey } = useDocumentInfo()
  const resetKey = useRef('')

  useLayoutEffect(() => {
    const key = preferencesKey ?? ''
    if (!key || resetKey.current === key) return
    resetKey.current = key
    if (!isCollapsed) toggle()
  }, [isCollapsed, preferencesKey, toggle])

  return null
}

export function DefaultCollapsedFieldLabel(props: FieldLabelClientProps<CollapsibleFieldClient>) {
  return <><FieldLabel {...props} label={props.field?.label} /><CloseExpandedOnEditorOpen /></>
}

export function DefaultCollapsedArrayRowLabel() {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const title = [data?.title, data?.name, data?.label, data?.question, data?.key].find((value) => typeof value === 'string' && value.trim())
  return <><span>{typeof title === 'string' ? title : `Элемент ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</span><CloseExpandedOnEditorOpen /></>
}

export function HomepageSectionRowLabel() {
  const { data, rowNumber } = useRowLabel<{ section?: unknown; visible?: unknown }>()
  return <><span>{homepageSectionRowTitle(data, rowNumber)}</span><CloseExpandedOnEditorOpen /></>
}

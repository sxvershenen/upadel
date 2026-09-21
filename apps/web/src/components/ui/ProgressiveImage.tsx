import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, useLayoutEffect, useRef } from 'react'

type ProgressiveImageProps = HTMLMotionProps<'img'> & { skeleton?: boolean }

/**
 * Shared image loading treatment. Remove this component (or the CSS rules for
 * data-progressive-image) to roll the visual enhancement back independently.
 */
export const ProgressiveImage = forwardRef<HTMLImageElement, ProgressiveImageProps>(
  ({ onLoad, onError, skeleton = true, ...props }, forwardedRef) => {
    const localRef = useRef<HTMLImageElement | null>(null)
    const loadingState = skeleton ? 'loading' : 'fade-loading'
    const loadedState = skeleton ? 'loaded' : 'fade-loaded'
    const settle = (image: HTMLImageElement) => { image.dataset.progressiveImage = loadedState }
    const setRef = (node: HTMLImageElement | null) => {
      localRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
      if (node?.complete && node.naturalWidth > 0) settle(node)
    }

    useLayoutEffect(() => {
      const image = localRef.current
      if (!image) return
      image.dataset.progressiveImage = loadingState
      if (image.complete && image.naturalWidth > 0) settle(image)
    }, [loadingState, loadedState, props.src])

    return <motion.img
      {...props}
      ref={setRef}
      data-progressive-image={loadingState}
      onLoad={(event) => { settle(event.currentTarget); onLoad?.(event) }}
      onError={(event) => { settle(event.currentTarget); onError?.(event) }}
    />
  },
)

ProgressiveImage.displayName = 'ProgressiveImage'

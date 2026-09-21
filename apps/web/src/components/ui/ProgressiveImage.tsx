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
    const settle = (image: HTMLImageElement) => {
      if (image.dataset.progressiveImage === loadedState) return
      image.dataset.progressiveImage = loadedState
      if (image.hasAttribute('data-hero-parallax-media')) performance.mark('unlim-hero-image-decoded')
    }
    const revealDecoded = (image: HTMLImageElement) => {
      const source = image.currentSrc || image.src
      if (typeof image.decode !== 'function') {
        settle(image)
        return
      }
      void image.decode().catch(() => undefined).then(() => {
        if ((image.currentSrc || image.src) === source) settle(image)
      })
    }
    const setRef = (node: HTMLImageElement | null) => {
      localRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
      if (node?.complete && node.naturalWidth > 0) revealDecoded(node)
    }

    useLayoutEffect(() => {
      const image = localRef.current
      if (!image) return
      image.dataset.progressiveImage = loadingState
      if (image.complete && image.naturalWidth > 0) revealDecoded(image)
    }, [loadingState, loadedState, props.src])

    return <motion.img
      {...props}
      fetchPriority={props.fetchPriority ?? (props.loading === 'lazy' ? 'low' : undefined)}
      ref={setRef}
      data-progressive-image={loadingState}
      onLoad={(event) => { revealDecoded(event.currentTarget); onLoad?.(event) }}
      onError={(event) => { settle(event.currentTarget); onError?.(event) }}
    />
  },
)

ProgressiveImage.displayName = 'ProgressiveImage'

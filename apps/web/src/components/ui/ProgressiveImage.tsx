import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, useLayoutEffect, useRef, useState } from 'react'

/**
 * Shared image loading treatment. Remove this component (or the CSS rules for
 * data-progressive-image) to roll the visual enhancement back independently.
 */
export const ProgressiveImage = forwardRef<HTMLImageElement, HTMLMotionProps<'img'>>(
  ({ onLoad, onError, ...props }, forwardedRef) => {
    const localRef = useRef<HTMLImageElement | null>(null)
    const [loaded, setLoaded] = useState(false)
    const setRef = (node: HTMLImageElement | null) => {
      localRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }

    useLayoutEffect(() => {
      const image = localRef.current
      if (image?.complete && image.naturalWidth > 0) setLoaded(true)
    }, [props.src])

    return <motion.img
      {...props}
      ref={setRef}
      data-progressive-image={loaded ? 'loaded' : 'loading'}
      onLoad={(event) => { setLoaded(true); onLoad?.(event) }}
      onError={(event) => { setLoaded(true); onError?.(event) }}
    />
  },
)

ProgressiveImage.displayName = 'ProgressiveImage'

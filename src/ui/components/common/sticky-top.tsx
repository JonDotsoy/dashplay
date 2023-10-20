import { FC, useEffect, useRef } from "react"

const StickyTop: FC<{ setVisible: (b: boolean) => void }> = ({ setVisible }) => {
  const ref = useRef<null | HTMLSpanElement>(null)

  useEffect(() => {
    if (ref.current) {
      const obs = new IntersectionObserver(([entry]) => {
        if (entry) {
          setVisible(entry.isIntersecting)
        }
      })

      obs.observe(ref.current)

      return () => obs.disconnect()
    }
  }, [ref.current])

  return <span ref={ref}></span>
}

export default StickyTop

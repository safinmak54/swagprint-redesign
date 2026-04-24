import { useEffect, useState, type ReactNode } from 'react'

export function MinViewportGate({ minWidth, children }: { minWidth: number; children: ReactNode }) {
  const [isTooSmall, setIsTooSmall] = useState(false)

  useEffect(() => {
    const check = () => setIsTooSmall(window.innerWidth < minWidth)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [minWidth])

  if (isTooSmall) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface px-8">
        <div className="text-center max-w-md">
          <h1 className="font-display text-2xl font-bold text-on-surface mb-3">
            Please use a larger screen
          </h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            The SwagPrint Design Lab requires a screen width of at least {minWidth}px
            for the best experience. Please switch to a desktop or laptop.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

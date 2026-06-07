"use client"

import { useRef, useState, useCallback, type ReactNode } from "react"

interface SwipeableRowProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: ReactNode
  rightAction?: ReactNode
}

const SWIPE_THRESHOLD = 80

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
}: SwipeableRowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    currentX.current = 0
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    const dx = e.touches[0].clientX - startX.current
    currentX.current = dx
    setTranslateX(dx)
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    const dx = currentX.current

    if (dx > SWIPE_THRESHOLD && leftAction && onSwipeRight) {
      onSwipeRight()
      setTranslateX(0)
      return
    }

    if (dx < -SWIPE_THRESHOLD && rightAction && onSwipeLeft) {
      onSwipeLeft()
      setTranslateX(0)
      return
    }

    setTranslateX(0)
  }, [leftAction, rightAction, onSwipeLeft, onSwipeRight])

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-y-0 left-0 flex items-center">
        {leftAction}
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        {rightAction}
      </div>
      <div
        className="relative bg-card z-10"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

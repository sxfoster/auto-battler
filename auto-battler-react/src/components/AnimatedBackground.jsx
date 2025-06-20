import React, { useEffect, useRef } from 'react'

export default function AnimatedBackground({ isSpeedActive }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let stars = []
    const numStars = 200
    const velocity = 0.05

    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const generateStars = () => {
      stars = []
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          vx: Math.random() * velocity * 2 - velocity,
          vy: Math.random() * velocity * 2 - velocity
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.beginPath()
      stars.forEach(star => {
        ctx.moveTo(star.x, star.y)
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      })
      ctx.fill()
    }

    const update = () => {
      stars.forEach(star => {
        if (isSpeedActive) {
          star.x -= star.radius * 5
        } else {
          star.x += star.vx
          star.y += star.vy
        }

        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width && !isSpeedActive) star.x = 0
        if (star.y < 0) star.y = canvas.height
        if (star.y > canvas.height) star.y = 0
      })
    }

    const animate = () => {
      draw()
      update()
      animationFrameId = requestAnimationFrame(animate)
    }

    setCanvasSize()
    generateStars()
    animate()
    window.addEventListener('resize', setCanvasSize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', setCanvasSize)
    }
  }, [isSpeedActive])

  return <canvas ref={canvasRef} id="background-canvas" />
}

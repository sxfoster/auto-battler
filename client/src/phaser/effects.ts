import Phaser from 'phaser'

/** Simple floating text animation */
export function floatingText(
  scene: Phaser.Scene,
  text: string,
  x: number,
  y: number,
  color = '#ffffff',
  duration = 800,
) {
  const txt = scene.add.text(x, y, text, { fontSize: '16px', color })
  scene.tweens.add({
    targets: txt,
    y: y - 30,
    alpha: 0,
    duration,
    ease: 'Cubic.easeOut',
    onComplete: () => txt.destroy(),
  })
}

import { Link } from 'react-router-dom'
import styles from './MainMenu.module.css'

function MainMenu() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Survival Dungeon</h1>
      <nav className={styles.menu}>
        <Link className={styles.button} to="/new-game">Start New Game</Link>
        <Link className={styles.button} to="/load-game">Load Game</Link>
        <Link className={styles.button} to="/settings">Settings</Link>
        <Link className={styles.button} to="/pouch">Magical Pouch</Link>
      </nav>
    </main>
  )
}

export default MainMenu

import { useNavigate } from 'react-router-dom'
import { useModal } from './ModalManager.jsx'
import styles from './MainMenu.module.css'

function MainMenu() {
  const navigate = useNavigate()
  const { open, close } = useModal()

  const showPlaceholder = (message) => {
    const id = open(
      <div>
        <p>{message}</p>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className={styles.button} onClick={() => close(id)}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Survival Dungeon</h1>
      <nav className={styles.menu}>
        <button
          className={styles.button}
          onClick={() => navigate('/town')}
        >
          New Game
        </button>
        <button
          className={styles.button}
          onClick={() => navigate('/town')}
        >
          Continue
        </button>
        <button
          className={styles.button}
          onClick={() => showPlaceholder('Settings are not available yet.')}
        >
          Settings
        </button>
        <button
          className={styles.button}
          onClick={() => navigate('/decks')}
        >
          Deck Manager
        </button>
        {import.meta.env.DEV && (
          <button
            className={styles.button}
            onClick={() => navigate('/town')}
          >
            Town
          </button>
        )}
      </nav>
    </main>
  )
}

export default MainMenu

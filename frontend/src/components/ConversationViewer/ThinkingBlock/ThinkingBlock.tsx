import { useState } from 'react'
import styles from './ThinkingBlock.module.css'

interface ThinkingBlockProps {
  content: string
}

export const ThinkingBlock = ({ content }: ThinkingBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content?.trim()) {
    return null
  }

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className={styles.icon}>💭</span>
        <span className={styles.title}>Thinking...</span>
        <svg
          className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Toggle thinking"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        className={`${styles.contentWrapper} ${isExpanded ? styles.expanded : ''}`}
      >
        <div className={styles.content}>
          {content.split('\n').map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: order is stable
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

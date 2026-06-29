import hljs from 'highlight.js'
import { useState } from 'react'
import 'highlight.js/styles/github-dark.css' // Import a nice dark theme
import styles from './CodeBlock.module.css'

interface CodeBlockProps {
  language?: string
  value: string
}

export const CodeBlock = ({ language, value }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Determine actual language or fallback
  const lang = language && hljs.getLanguage(language) ? language : 'plaintext'

  // Highlight code
  const highlighted = hljs.highlight(value, { language: lang }).value

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.language}>{language || 'text'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={styles.copyButton}
          aria-label="Copy code"
        >
          {copied ? (
            <span className={styles.copiedText}>Copied!</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
      <div className={styles.codeWrapper}>
        <pre className={styles.pre}>
          <code
            className={`hljs language-${lang} ${styles.code}`}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: highlighted by trusted hljs
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  )
}

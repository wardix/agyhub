import styles from './LoadingSpinner.module.css'

interface LoadingSpinnerProps {
  fullPage?: boolean
  message?: string
}

export const LoadingSpinner = ({
  fullPage = false,
  message = 'Loading...',
}: LoadingSpinnerProps) => {
  const containerClass = fullPage
    ? `${styles.container} ${styles.fullPage}`
    : styles.container

  return (
    <div className={containerClass}>
      <div className={styles.spinnerWrapper}>
        <div className={styles.spinner} />
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  )
}

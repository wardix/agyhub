import styles from './Skeleton.module.css'

export const TranscriptSkeleton = () => {
  return (
    <div className={styles.transcript} data-testid="transcript-skeleton">
      <div className={styles.messageRight}>
        <div className={`${styles.bubbleSmall} ${styles.shimmer}`} />
      </div>
      <div className={styles.messageLeft}>
        <div className={`${styles.bubble} ${styles.shimmer}`} />
      </div>
      <div className={styles.messageRight}>
        <div className={`${styles.bubbleSmall} ${styles.shimmer}`} />
      </div>
      <div className={styles.messageLeft}>
        <div className={`${styles.bubble} ${styles.shimmer}`} />
      </div>
    </div>
  )
}

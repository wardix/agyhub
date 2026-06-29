import styles from './Skeleton.module.css'

export const ConversationCardSkeleton = () => {
  return (
    <div className={styles.card} data-testid="conversation-card-skeleton">
      <div className={`${styles.title} ${styles.shimmer}`} />
      <div>
        <div className={`${styles.description} ${styles.shimmer}`} />
        <div className={`${styles.descriptionShort} ${styles.shimmer}`} />
      </div>
      <div className={styles.footer}>
        <div className={`${styles.meta} ${styles.shimmer}`} />
        <div className={`${styles.stats} ${styles.shimmer}`} />
      </div>
    </div>
  )
}

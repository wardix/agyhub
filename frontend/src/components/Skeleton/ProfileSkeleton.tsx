import styles from './Skeleton.module.css'

export const ProfileSkeleton = () => {
  return (
    <div className={styles.profileHeader} data-testid="profile-skeleton">
      <div className={`${styles.avatar} ${styles.shimmer}`} />
      <div className={styles.profileInfo}>
        <div className={`${styles.profileName} ${styles.shimmer}`} />
        <div className={`${styles.profileBio} ${styles.shimmer}`} />
        <div className={styles.profileStats}>
          <div className={`${styles.statItem} ${styles.shimmer}`} />
          <div className={`${styles.statItem} ${styles.shimmer}`} />
          <div className={`${styles.statItem} ${styles.shimmer}`} />
        </div>
      </div>
    </div>
  )
}

import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found — ConvHub</title>
      </Helmet>
      <div className={styles.container}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Page Not Found</h2>
        <p className={styles.description}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className={styles.linkBtn}>
          Go Home
        </Link>
      </div>
    </>
  )
}

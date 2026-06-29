import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import styles from './Navbar.module.css'

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">ConvHub</Link>
        </div>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </form>

        <nav className={styles.nav}>
          <Link to="/explore" className={styles.navLink}>
            Explore
          </Link>
          {isAuthenticated && (
            <Link to="/upload" className={styles.navLink}>
              Upload
            </Link>
          )}

          <div className={styles.actions}>
            <ThemeToggle />

            {isAuthenticated ? (
              <div className={styles.userMenu}>
                <Link
                  to={`/profile/${user?.username}`}
                  className={styles.avatar}
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className={styles.logoutBtn}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className={styles.authLinks}>
                <Link to="/login" className={styles.loginBtn}>
                  Log in
                </Link>
                <Link to="/register" className={styles.registerBtn}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

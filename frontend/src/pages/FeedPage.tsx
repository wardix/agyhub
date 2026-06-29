import { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { ConversationCard } from '../components/ConversationCard/ConversationCard'
import { ConversationCardSkeleton } from '../components/Skeleton'
import { useToast } from '../hooks/useToast'
import type { Conversation, PaginatedResponse } from '../types'
import { mapConversation } from '../utils/mappers'
import styles from './FeedPage.module.css'

export const FeedPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { showToast } = useToast()

  const fetchFeed = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        if (reset) {
          setIsLoading(true)
          setError(null)
        } else {
          setIsLoadingMore(true)
        }

        const response = await api.get<PaginatedResponse<Conversation>>(
          `/feed?page=${pageNum}&limit=12`,
        )
        const mappedData = response.data.map(mapConversation)

        setConversations((prev) =>
          reset ? mappedData : [...prev, ...mappedData],
        )
        setHasMore(pageNum < response.pagination.pages)
      } catch (err) {
        if (reset) {
          setError(err instanceof Error ? err.message : 'Failed to load feed')
        } else {
          showToast('Failed to load more conversations', 'error')
        }
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [showToast],
  )

  useEffect(() => {
    fetchFeed(1, true)
  }, [fetchFeed])

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchFeed(nextPage, false)
  }

  return (
    <>
      <Helmet>
        <title>Your Feed — ConvHub</title>
        <meta
          name="description"
          content="Latest conversations from users you follow on ConvHub."
        />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.layout}>
          <main className={styles.mainContent} style={{ width: '100%' }}>
            <h1 style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>
              Your Feed
            </h1>

            {isLoading && page === 1 ? (
              <div className={styles.grid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
                  <ConversationCardSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            ) : error && page === 1 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>⚠️</div>
                <h3 className={styles.emptyTitle}>Error loading feed</h3>
                <p className={styles.emptyDesc}>{error}</p>
                <button
                  type="button"
                  onClick={() => fetchFeed(1, true)}
                  className={styles.retryBtn}
                >
                  Retry
                </button>
              </div>
            ) : conversations.length > 0 ? (
              <>
                <div className={styles.grid}>
                  {conversations.map((conv) => (
                    <ConversationCard key={conv.id} conversation={conv} />
                  ))}
                </div>

                {hasMore && (
                  <div className={styles.loadMoreContainer}>
                    <button
                      type="button"
                      className={styles.loadMoreBtn}
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👥</div>
                <h3 className={styles.emptyTitle}>Your feed is empty</h3>
                <p className={styles.emptyDesc}>
                  You aren't following anyone yet, or the people you follow
                  haven't posted any conversations.
                </p>
                <Link
                  to="/explore"
                  className={styles.retryBtn}
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  Explore Conversations
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

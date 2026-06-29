import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api/client'
import { ToastProvider } from '../context/ToastContext'
import { useAuth } from '../hooks/useAuth'
import { FeedPage } from './FeedPage'

// Mock dependencies
vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
  },
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="helmet">{children}</div>
  ),
}))

const mockConversations = [
  {
    id: '1',
    title: 'Test Conversation 1',
    description: 'A test description 1',
    message_count: 5,
    like_count: 10,
    comment_count: 2,
    view_count: 100,
    created_at: '2023-01-01T00:00:00Z',
    has_liked: false,
    author: {
      id: 'author1',
      username: 'testuser1',
      avatar_url: null,
    },
    tags: [{ id: 't1', name: 'react', color: '#61dafb' }],
  },
]

describe('FeedPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
    } as any)
  })

  const renderWithProviders = () => {
    return render(
      <MemoryRouter>
        <ToastProvider>
          <FeedPage />
        </ToastProvider>
      </MemoryRouter>,
    )
  }

  it('renders loading state initially', () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}))
    renderWithProviders()
    expect(screen.getByText('Your Feed')).toBeInTheDocument()
    // 6 skeletons should be rendered
    const skeletons = screen.getAllByTestId('conversation-card-skeleton')
    expect(skeletons).toHaveLength(6)
  })

  it('renders empty state when no conversations are returned', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: [],
      pagination: { pages: 1 },
    })

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('Your feed is empty')).toBeInTheDocument()
    })
    expect(screen.getByText('Explore Conversations')).toBeInTheDocument()
  })

  it('renders conversations from feed', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: mockConversations,
      pagination: { pages: 1 },
    })

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('Test Conversation 1')).toBeInTheDocument()
    })
    expect(
      screen.queryByTestId('conversation-card-skeleton'),
    ).not.toBeInTheDocument()
  })

  it('handles load more functionality', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: mockConversations,
      pagination: { pages: 2 },
    })

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('Test Conversation 1')).toBeInTheDocument()
    })

    const loadMoreBtn = screen.getByText('Load More')
    expect(loadMoreBtn).toBeInTheDocument()

    vi.mocked(api.get).mockResolvedValueOnce({
      data: [
        {
          ...mockConversations[0],
          id: '2',
          title: 'Test Conversation 2',
        },
      ],
      pagination: { pages: 2 },
    })

    fireEvent.click(loadMoreBtn)

    await waitFor(() => {
      expect(screen.getByText('Test Conversation 2')).toBeInTheDocument()
    })

    // Both should be in the document
    expect(screen.getByText('Test Conversation 1')).toBeInTheDocument()
  })
})

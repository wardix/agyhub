import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { TranscriptEntry } from '../../../types'
import { ConversationViewer } from './ConversationViewer'

describe('ConversationViewer', () => {
  it('renders user and AI messages', () => {
    const transcript: TranscriptEntry[] = [
      {
        stepIndex: 1,
        source: 'USER_EXPLICIT',
        type: 'USER_INPUT',
        status: 'DONE',
        createdAt: new Date().toISOString(),
        content: '<USER_REQUEST>Hello</USER_REQUEST>',
      },
      {
        stepIndex: 2,
        source: 'MODEL',
        type: 'PLANNER_RESPONSE',
        status: 'DONE',
        createdAt: new Date().toISOString(),
        content: 'Hi there! **Bold**',
      },
      {
        stepIndex: 3,
        source: 'SYSTEM',
        type: 'CHECKPOINT',
        status: 'DONE',
        createdAt: new Date().toISOString(),
      },
    ]

    render(<ConversationViewer transcript={transcript} />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(
      screen.queryByText('<USER_REQUEST>Hello</USER_REQUEST>'),
    ).not.toBeInTheDocument()

    expect(screen.getByText('Hi there!')).toBeInTheDocument()
    expect(screen.getByText('System Checkpoint')).toBeInTheDocument()
  })
})

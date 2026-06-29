export interface ToolCall {
  name: string
  arguments?: Record<string, unknown>
  response?: string
}

export interface TranscriptEntry {
  step_index: number
  source: 'USER_EXPLICIT' | 'MODEL' | 'SYSTEM'
  type:
    | 'USER_INPUT'
    | 'PLANNER_RESPONSE'
    | 'CONVERSATION_HISTORY'
    | 'CHECKPOINT'
    | string
  status: string
  created_at: string
  content?: string
  thinking?: string
  tool_calls?: ToolCall[]
}

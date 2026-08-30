export interface ProblemContextDTO {
  title?: string;
  category?: 'LOGIC' | 'DSA' | string;
  topic?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | string;
  language?: string;
  problemUrl?: string;
  userCode?: string;
  problemStatement?: string;
}

export interface CodeCatChatRequestDTO {
  message: string;
  conversationId?: number | null;
  problemContext?: ProblemContextDTO;
}

export interface CodeCatChatResponseDTO {
  conversationId: number;
  message: string;
  role: 'ASSISTANT';
  timestamp: string;
  provider: string;
  problemContext?: ProblemContextDTO;
}

export interface ConversationRecord {
  id: number;
  userId: number;
  title: string;
  category: 'LOGIC' | 'DSA' | 'GENERAL';
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: number;
  conversationId: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  problemContext?: ProblemContextDTO;
  createdAt: string;
}

export interface ConversationSummaryDTO {
  id: number;
  userId: number;
  title: string;
  category: 'LOGIC' | 'DSA' | 'GENERAL';
  messageCount: number;
  lastMessageSnippet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetailDTO {
  id: number;
  userId: number;
  title: string;
  category: 'LOGIC' | 'DSA' | 'GENERAL';
  messages: MessageRecord[];
  createdAt: string;
  updatedAt: string;
}

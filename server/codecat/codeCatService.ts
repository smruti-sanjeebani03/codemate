import {
  CodeCatChatRequestDTO,
  CodeCatChatResponseDTO,
  ConversationDetailDTO,
  ConversationRecord,
  ConversationSummaryDTO,
  MessageRecord,
  ProblemContextDTO
} from './types';
import { CODECAT_SYSTEM_PROMPT } from './systemPrompt';
import { FallbackKnowledgeProvider, GeminiLLMProvider, LLMMessage, LLMProvider } from './llmProvider';

let nextConversationId = 101;
let nextMessageId = 1001;

// Seed conversations for demonstration & security isolation testing
const conversationsDb: ConversationRecord[] = [
  // User 1 (Smruti) Conversation 1
  {
    id: 1,
    userId: 1,
    title: 'Two Sum & Hash Map Pattern',
    category: 'DSA',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  // User 1 Conversation 2
  {
    id: 2,
    userId: 1,
    title: 'Armstrong Number Logic Walkthrough',
    category: 'LOGIC',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  // User 2 (Alex) Conversation 1 (Private to Alex)
  {
    id: 3,
    userId: 2,
    title: 'Codeforces Watermelon Parity Logic',
    category: 'LOGIC',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

const messagesDb: MessageRecord[] = [
  // Conversation 1 (Smruti)
  {
    id: 1,
    conversationId: 1,
    role: 'USER',
    content: 'Can you help me understand why Two Sum with a Hash Map is faster than nested loops?',
    problemContext: {
      title: 'Two Sum',
      category: 'DSA',
      topic: 'Arrays',
      difficulty: 'EASY',
      language: 'Java'
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 2,
    conversationId: 1,
    role: 'ASSISTANT',
    content: `Great question! 🐾 Let's compare both approaches to see why Hash Maps give you that sweet $O(n)$ speed:

### 1. Brute Force (Nested Loops)
- For every element at index \`i\`, you scan all elements after it at index \`j\` looking for \`target - nums[i]\`.
- Checking takes $O(n)$ work per item, leading to $O(n^2)$ total time.

### 2. Hash Map (One-Pass Lookup)
- Instead of repeatedly scanning the array, we remember numbers we have already seen in a Hash Map with their indices.
- For each number $x$, we check if the complement $(\\text{target} - x)$ already exists in our map.
- Hash map lookups operate in **$O(1)$ average time**!

### ⏱️ Complexity Comparison:
- **Brute Force:** Time $O(n^2)$, Space $O(1)$
- **Hash Map:** Time $O(n)$, Space $O(n)$

You trade a little bit of memory for a massive speed improvement! 🐱`,
    createdAt: new Date(Date.now() - 86400000 * 2 + 1500).toISOString()
  },

  // Conversation 2 (Smruti)
  {
    id: 3,
    conversationId: 2,
    role: 'USER',
    content: 'Why did my Armstrong program fail when testing 1634?',
    problemContext: {
      title: 'Armstrong Numbers',
      category: 'LOGIC',
      topic: 'Armstrong Number',
      difficulty: 'EASY',
      language: 'Java'
    },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 4,
    conversationId: 2,
    role: 'ASSISTANT',
    content: `Aha! That is a very classic Armstrong number trap! 🐾

**1634** is a 4-digit Armstrong number because:
$$1^4 + 6^4 + 3^4 + 4^4 = 1 + 1296 + 81 + 256 = 1634$$

If your code used \`Math.pow(digit, 3)\`, it only worked for 3-digit numbers like **153** or **370**.
To fix it, count the total number of digits first ($d = \\text{String.valueOf}(n).\\text{length()}$) and raise each digit to power $d$! 💡`,
    createdAt: new Date(Date.now() - 86400000 * 1 + 1200).toISOString()
  },

  // Conversation 3 (Alex)
  {
    id: 5,
    conversationId: 3,
    role: 'USER',
    content: 'What is the edge case in Watermelon 4A?',
    problemContext: {
      title: 'Watermelon',
      category: 'LOGIC',
      topic: 'Mathematical Logic',
      difficulty: 'EASY',
      language: 'Python'
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 6,
    conversationId: 3,
    role: 'ASSISTANT',
    content: `The sneaky edge case is $w = 2$! 🍉 Even though 2 is an even number, the only two positive integer parts it splits into are $1 + 1$, which are both odd. So for $w = 2$, the answer is **NO**. For any other even $w > 2$, the answer is **YES**!`,
    createdAt: new Date(Date.now() - 86400000 * 3 + 900).toISOString()
  }
];

export class CodeCatService {
  private geminiProvider: GeminiLLMProvider;
  private fallbackProvider: FallbackKnowledgeProvider;

  constructor() {
    this.geminiProvider = new GeminiLLMProvider();
    this.fallbackProvider = new FallbackKnowledgeProvider();
  }

  /**
   * Get all conversations belonging to an authenticated user
   */
  public getUserConversations(userId: number): ConversationSummaryDTO[] {
    const userConvs = conversationsDb.filter(c => c.userId === userId);
    
    // Sort descending by updatedAt
    userConvs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return userConvs.map(c => {
      const convMessages = messagesDb.filter(m => m.conversationId === c.id);
      const lastMsg = convMessages[convMessages.length - 1];
      return {
        id: c.id,
        userId: c.userId,
        title: c.title,
        category: c.category,
        messageCount: convMessages.length,
        lastMessageSnippet: lastMsg ? lastMsg.content.substring(0, 80) : undefined,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      };
    });
  }

  /**
   * Get single conversation with full message history with strict ownership check
   */
  public getConversationDetail(conversationId: number, userId: number): {
    conversation?: ConversationDetailDTO;
    errorStatus?: 403 | 404;
    errorMessage?: string;
  } {
    const conv = conversationsDb.find(c => c.id === conversationId);
    if (!conv) {
      return {
        errorStatus: 404,
        errorMessage: `Conversation #${conversationId} not found`
      };
    }

    if (conv.userId !== userId) {
      return {
        errorStatus: 403,
        errorMessage: `Forbidden: You do not have permission to access conversation #${conversationId}`
      };
    }

    const convMessages = messagesDb.filter(m => m.conversationId === conversationId);
    // Sort chronologically
    convMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return {
      conversation: {
        id: conv.id,
        userId: conv.userId,
        title: conv.title,
        category: conv.category,
        messages: convMessages,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      }
    };
  }

  /**
   * Delete conversation with strict ownership check
   */
  public deleteConversation(conversationId: number, userId: number): {
    success: boolean;
    errorStatus?: 403 | 404;
    errorMessage?: string;
  } {
    const convIndex = conversationsDb.findIndex(c => c.id === conversationId);
    if (convIndex === -1) {
      return {
        success: false,
        errorStatus: 404,
        errorMessage: `Conversation #${conversationId} not found`
      };
    }

    const conv = conversationsDb[convIndex];
    if (conv.userId !== userId) {
      return {
        success: false,
        errorStatus: 403,
        errorMessage: `Forbidden: You do not have permission to delete conversation #${conversationId}`
      };
    }

    // Remove conversation and associated messages
    conversationsDb.splice(convIndex, 1);
    for (let i = messagesDb.length - 1; i >= 0; i--) {
      if (messagesDb[i].conversationId === conversationId) {
        messagesDb.splice(i, 1);
      }
    }

    return { success: true };
  }

  /**
   * Helper: Generate an appropriate title from user's message or problem context
   */
  private generateConversationTitle(message: string, context?: ProblemContextDTO): string {
    if (context && context.title) {
      const topicPart = context.topic ? ` (${context.topic})` : '';
      return `${context.title}${topicPart}`;
    }

    const clean = message.replace(/[^\w\s]/gi, '').trim();
    if (!clean) return 'New Discussion';
    const words = clean.split(/\s+/);
    if (words.length <= 6) return clean;
    return words.slice(0, 6).join(' ') + '...';
  }

  /**
   * Core Chat Execution:
   * 1. Authenticates & validates
   * 2. Retrieves or creates conversation
   * 3. Enriches prompt with problem context & history
   * 4. Calls AI provider
   * 5. Persists messages & returns response
   */
  public async chat(userId: number, request: CodeCatChatRequestDTO): Promise<{
    response?: CodeCatChatResponseDTO;
    errorStatus?: 400 | 403 | 404 | 500;
    errorMessage?: string;
  }> {
    const rawMessage = request.message;
    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return {
        errorStatus: 400,
        errorMessage: 'Message cannot be empty'
      };
    }

    const userMessageText = rawMessage.trim();
    let conversation: ConversationRecord;

    // Check if conversationId is provided
    if (request.conversationId) {
      const existing = conversationsDb.find(c => c.id === request.conversationId);
      if (!existing) {
        return {
          errorStatus: 404,
          errorMessage: `Conversation #${request.conversationId} not found`
        };
      }
      if (existing.userId !== userId) {
        return {
          errorStatus: 403,
          errorMessage: `Forbidden: You do not have permission to access conversation #${request.conversationId}`
        };
      }
      conversation = existing;
    } else {
      // Create a new conversation
      const category = request.problemContext?.category === 'LOGIC' ? 'LOGIC' 
                     : request.problemContext?.category === 'DSA' ? 'DSA' 
                     : 'GENERAL';

      const title = this.generateConversationTitle(userMessageText, request.problemContext);

      conversation = {
        id: nextConversationId++,
        userId,
        title,
        category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      conversationsDb.unshift(conversation);
    }

    // Save User message
    const userMsgRecord: MessageRecord = {
      id: nextMessageId++,
      conversationId: conversation.id,
      role: 'USER',
      content: userMessageText,
      problemContext: request.problemContext,
      createdAt: new Date().toISOString()
    };
    messagesDb.push(userMsgRecord);

    // Fetch conversation history for multi-turn context
    const previousMessages = messagesDb
      .filter(m => m.conversationId === conversation.id)
      .slice(-8); // Include up to last 8 messages for optimal context window

    // Format LLM messages array
    const llmMessages: LLMMessage[] = [];

    // Format problem context if provided
    let contextHeader = '';
    if (request.problemContext) {
      const ctx = request.problemContext;
      contextHeader = `[PROBLEM CONTEXT ATTACHED BY USER]
- Problem Title: ${ctx.title || 'Untitled'}
- Category: ${ctx.category || 'General'}
- Topic: ${ctx.topic || 'N/A'}
- Difficulty: ${ctx.difficulty || 'N/A'}
- Programming Language: ${ctx.language || 'Not specified'}
${ctx.problemUrl ? `- Problem URL: ${ctx.problemUrl}` : ''}
${ctx.problemStatement ? `- Problem Statement: ${ctx.problemStatement}` : ''}
${ctx.userCode ? `- User's Code Snippet:\n\`\`\`${ctx.language ? ctx.language.toLowerCase() : 'text'}\n${ctx.userCode}\n\`\`\`` : ''}
---
`;
    }

    // Build message turns
    for (let i = 0; i < previousMessages.length; i++) {
      const msg = previousMessages[i];
      let content = msg.content;
      // If it's the last message (current turn) and there is problem context, prepend it
      if (i === previousMessages.length - 1 && contextHeader) {
        content = `${contextHeader}\nUser's Question: ${msg.content}`;
      }

      llmMessages.push({
        role: msg.role === 'USER' ? 'user' : 'assistant',
        content
      });
    }

    // Call AI provider (Gemini or Fallback)
    let aiResponseText = '';
    let usedProvider = '';

    try {
      if (this.geminiProvider.isConfigured()) {
        const result = await this.geminiProvider.generateText({
          messages: llmMessages,
          systemInstruction: CODECAT_SYSTEM_PROMPT,
          temperature: 0.7
        });
        aiResponseText = result.text;
        usedProvider = result.provider;
      } else {
        const result = await this.fallbackProvider.generateText({
          messages: llmMessages,
          systemInstruction: CODECAT_SYSTEM_PROMPT
        });
        aiResponseText = result.text;
        usedProvider = result.provider;
      }
    } catch (llmErr: any) {
      console.warn('Primary LLM call encountered error, activating resilient fallback engine:', llmErr.message || llmErr);
      try {
        const fallbackResult = await this.fallbackProvider.generateText({
          messages: llmMessages,
          systemInstruction: CODECAT_SYSTEM_PROMPT
        });
        aiResponseText = fallbackResult.text;
        usedProvider = fallbackResult.provider;
      } catch (fallbackErr: any) {
        return {
          errorStatus: 500,
          errorMessage: 'CodeCat is temporarily unable to generate a response. Please try again in a moment.'
        };
      }
    }

    // Save Assistant response
    const assistantMsgRecord: MessageRecord = {
      id: nextMessageId++,
      conversationId: conversation.id,
      role: 'ASSISTANT',
      content: aiResponseText,
      problemContext: request.problemContext,
      createdAt: new Date().toISOString()
    };
    messagesDb.push(assistantMsgRecord);

    // Update conversation updatedAt
    conversation.updatedAt = new Date().toISOString();

    return {
      response: {
        conversationId: conversation.id,
        message: aiResponseText,
        role: 'ASSISTANT',
        timestamp: assistantMsgRecord.createdAt,
        provider: usedProvider,
        problemContext: request.problemContext
      }
    };
  }
}

export const codeCatService = new CodeCatService();

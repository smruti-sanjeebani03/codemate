import { GoogleGenAI } from '@google/genai';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMGenerateOptions {
  messages: LLMMessage[];
  systemInstruction?: string;
  temperature?: number;
}

export interface LLMProvider {
  name: string;
  generateText(options: LLMGenerateOptions): Promise<{ text: string; provider: string }>;
}

/**
 * Gemini LLM Provider using the modern @google/genai TypeScript SDK
 */
export class GeminiLLMProvider implements LLMProvider {
  public name = 'Google Gemini (gemini-3.7-flash)';
  private client: GoogleGenAI | null = null;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    this.modelName = process.env.AI_MODEL || 'gemini-3.7-flash';

    if (apiKey && apiKey.trim() !== '') {
      this.client = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  public isConfigured(): boolean {
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    return Boolean(apiKey && apiKey.trim() !== '' && !apiKey.includes('your_gemini_api_key'));
  }

  async generateText(options: LLMGenerateOptions): Promise<{ text: string; provider: string }> {
    if (!this.client) {
      const key = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
      if (key && key.trim() !== '') {
        this.client = new GoogleGenAI({
          apiKey: key.trim(),
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } else {
        throw new Error('Gemini API key is not configured in server environment (GEMINI_API_KEY or AI_API_KEY).');
      }
    }

    try {
      // Build conversation contents for generateContent
      // For multi-turn conversations:
      const userAndAssistantMessages = options.messages.filter(m => m.role !== 'system');
      
      // Combine messages into context format or use multi-turn structure
      let fullPrompt = '';
      if (userAndAssistantMessages.length === 1) {
        fullPrompt = userAndAssistantMessages[0].content;
      } else {
        fullPrompt = userAndAssistantMessages
          .map(m => `[${m.role.toUpperCase()}]:\n${m.content}`)
          .join('\n\n');
      }

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: fullPrompt,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? 0.7,
        },
      });

      const text = response.text || '';
      if (!text.trim()) {
        throw new Error('Received empty response from Gemini model');
      }

      return {
        text,
        provider: `Gemini (${this.modelName})`
      };
    } catch (err: any) {
      console.error('Gemini LLM Provider error:', err);
      throw err;
    }
  }
}

/**
 * Intelligent CodeCat Rule & Knowledge Fallback Provider
 * Ensures high-quality pedagogical assistance for testing and offline environments.
 */
export class FallbackKnowledgeProvider implements LLMProvider {
  public name = 'CodeCat Intelligent Knowledge Base (Offline Fallback)';

  async generateText(options: LLMGenerateOptions): Promise<{ text: string; provider: string }> {
    const lastMsg = options.messages[options.messages.length - 1]?.content.toLowerCase() || '';

    // Logic: Armstrong Number
    if (lastMsg.includes('armstrong')) {
      return {
        text: `Hey there! 🐾 Let's look at **Armstrong Numbers** together.

### What is an Armstrong Number?
A number where the sum of its digits raised to the power of the number of digits equals the original number.
For example, for **153** (3 digits):
$$1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153$$

### 💡 Common Mistakes to Watch Out For:
1. **Hardcoding power of 3**: If testing 4-digit numbers like \`1634\` ($1^4 + 6^4 + 3^4 + 4^4$), you must count total digits first!
2. **Modifying the original number**: Save \`originalNum = num\` in a temporary variable before your \`while (temp > 0)\` loop destroys it.
3. **Integer power precision**: Using floating point \`Math.pow()\` can have rounding issues in some languages; integer multiplication or casting to \`long\` is safer.

### Java Solution Pattern:
\`\`\`java
public class ArmstrongNumber {
    public static boolean isArmstrong(int n) {
        int original = n;
        int digits = String.valueOf(n).length();
        int sum = 0;
        
        int temp = n;
        while (temp > 0) {
            int digit = temp % 10;
            sum += Math.pow(digit, digits);
            temp /= 10;
        }
        return sum == original;
    }
}
\`\`\`

### Complexity:
- **Time Complexity:** $O(\\log_{10}(n))$ — we iterate through the number of digits.
- **Space Complexity:** $O(1)$ — constant auxiliary memory.

Does this help clarify the logic? Let me know which test case you're working on! 🐱`,
        provider: 'CodeCat Fallback Engine'
      };
    }

    // Logic: Fibonacci
    if (lastMsg.includes('fibonacci')) {
      return {
        text: `Hello! 🐾 Let's break down **Fibonacci Numbers**.

### 🧩 Understanding the Problem
The sequence starts: $0, 1, 1, 2, 3, 5, 8, 13, 21, 34 \\dots$
Each number is the sum of the preceding two: $F(n) = F(n-1) + F(n-2)$, with base cases $F(0)=0, F(1)=1$.

### 🎯 Identifying Approaches:
1. **Naive Recursion**: $O(2^n)$ time — recalculates overlapping subproblems.
2. **Iterative / Bottom-Up DP**: $O(n)$ time, $O(1)$ space using two rolling variables (\`prev2\`, \`prev1\`).

### ☕ Clean Java Implementation:
\`\`\`java
public int fib(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}
\`\`\`

### ⏱️ Complexity:
- **Time:** $O(n)$ — single pass loop.
- **Space:** $O(1)$ — requires only two integer variables.

Would you like to explore the matrix exponentiation $O(\\log n)$ approach next? 🚀`,
        provider: 'CodeCat Fallback Engine'
      };
    }

    // DSA: Two Pointers / Binary Search / Sliding Window
    if (lastMsg.includes('binary search') || lastMsg.includes('pointer')) {
      return {
        text: `Hey there! 🐾 Let's identify the pattern and master **Binary Search & Two Pointers**.

### 🎯 Pattern Identification
When the input space is **sorted** or possesses **monotonicity** (where a condition is false up to a point, then true afterwards), Binary Search reduces the search space by half in each step!

### 💡 Key Pointer Invariants:
1. **Search Range**: \`int left = 0, right = arr.length - 1;\`
2. **Midpoint Calculation**: Always use \`int mid = left + (right - left) / 2;\` to prevent integer 32-bit overflow.
3. **Loop Condition**: \`while (left <= right)\` for finding exact values, or \`while (left < right)\` for lower/upper bounds.

### Java Solution:
\`\`\`java
public int binarySearch(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
\`\`\`

### Complexity Analysis:
- **Time Complexity:** $O(\\log n)$ because we divide the remaining search range by $2$ at each iteration.
- **Space Complexity:** $O(1)$ auxiliary memory.

How does that feel? Try stepping through with \`nums = [-1,0,3,5,9,12], target = 9\`! 🐱`,
        provider: 'CodeCat Fallback Engine'
      };
    }

    // Generic helpful coding companion response
    return {
      text: `Hello! 🐾 I'm **CodeCat**, your AI coding companion.

I'm here to help you master **Logic building** and **Data Structures & Algorithms (DSA)**.

Here is how we can work together:
- 🧩 **Logic Building**: Share questions about loops, condition flow, prime numbers, palindromes, or mathematical logic.
- 🎯 **DSA Pattern Recognition**: Ask "What pattern should I use for this problem?" and we'll analyze Sliding Window, Two Pointers, Dynamic Programming, Graphs, etc.
- 🔍 **Debugging**: Paste your code and describe what output you're getting vs expecting.
- ⏱️ **Complexity Analysis**: Break down Big-O Time & Space complexity with clear explanations.

Feel free to attach your problem context or ask any question to get started! 🐱`,
      provider: 'CodeCat Companion'
    };
  }
}

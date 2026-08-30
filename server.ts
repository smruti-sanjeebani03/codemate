import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'codemate-jwt-super-secret-key-2026';

// ----------------------------------------------------
// Database Data Structures & Initial Seeding
// ----------------------------------------------------
interface User {
  id: number;
  name: string;
  email: string;
  passwordHash?: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  authProvider: 'LOCAL' | 'GOOGLE';
  dailyTarget: number;
  createdAt: string;
}

interface Problem {
  id: number;
  userId: number;
  title: string;
  problemUrl?: string;
  platform: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  category: 'LOGIC' | 'DSA';
  language: string;
  timeSpentMinutes: number;
  notes?: string;
  solvedAt: string; // YYYY-MM-DD
  isRevisionNeeded: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ConversationMessage {
  id: number;
  conversationId: number;
  role: 'USER' | 'ASSISTANT' | 'MODEL';
  content: string;
  category?: string;
  followUps?: string[];
  problemContext?: any;
  createdAt: string;
}

interface Conversation {
  id: number;
  userId: number;
  title: string;
  problemContext?: any;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

// In-Memory Database with Seed Data
const DB = {
  users: [
    {
      id: 1,
      name: 'Smruti Sanjeebani',
      email: 'smruti@codemate.dev',
      passwordHash: bcrypt.hashSync('password123', 8),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      bio: 'Full Stack Engineer passionate about algorithms, clean code architecture, and AI-assisted learning.',
      authProvider: 'LOCAL',
      dailyTarget: 3,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 2,
      name: 'Alex Chen',
      email: 'alex@codemate.dev',
      passwordHash: bcrypt.hashSync('password123', 8),
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      bio: 'Computer Science student focusing on dynamic programming and graph theory.',
      authProvider: 'LOCAL',
      dailyTarget: 4,
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      id: 3,
      name: 'Demo Developer',
      email: 'demo@codemate.dev',
      passwordHash: bcrypt.hashSync('password123', 8),
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      bio: 'Exploring CodeMate companion features and mastering programming fundamentals.',
      authProvider: 'LOCAL',
      dailyTarget: 2,
      createdAt: new Date().toISOString(),
    }
  ] as User[],

  problems: [] as Problem[],
  conversations: [] as Conversation[],
  messages: [] as ConversationMessage[],
};

// Seed realistic problems for User 1 & 2
const todayStr = new Date().toISOString().split('T')[0];
const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const initialSampleProblems: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // User 1 Problems (Today + Past days)
  {
    userId: 1,
    title: 'Two Sum',
    problemUrl: 'https://leetcode.com/problems/two-sum/',
    platform: 'LEETCODE',
    difficulty: 'EASY',
    topic: 'Arrays',
    category: 'DSA',
    language: 'Java',
    timeSpentMinutes: 15,
    notes: 'Used HashMap for O(n) one-pass lookup. Key insight is checking complement (target - num).',
    solvedAt: todayStr,
    isRevisionNeeded: false,
  },
  {
    userId: 1,
    title: 'Armstrong Number Check',
    problemUrl: 'https://www.geeksforgeeks.org/program-for-armstrong-numbers/',
    platform: 'GEEKSFORGEEKS',
    difficulty: 'EASY',
    topic: 'Armstrong Number',
    category: 'LOGIC',
    language: 'Java',
    timeSpentMinutes: 12,
    notes: 'Count digits first, then calculate sum of power of each digit in a while loop.',
    solvedAt: todayStr,
    isRevisionNeeded: false,
  },
  {
    userId: 1,
    title: 'Longest Substring Without Repeating Characters',
    problemUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    platform: 'LEETCODE',
    difficulty: 'MEDIUM',
    topic: 'Sliding Window',
    category: 'DSA',
    language: 'Java',
    timeSpentMinutes: 30,
    notes: 'Sliding window with two pointers left and right. Stored last seen index of characters in map.',
    solvedAt: getPastDateStr(1),
    isRevisionNeeded: true,
  },
  {
    userId: 1,
    title: 'Fibonacci Series with Memoization',
    problemUrl: 'https://leetcode.com/problems/fibonacci-number/',
    platform: 'LEETCODE',
    difficulty: 'EASY',
    topic: 'Fibonacci',
    category: 'LOGIC',
    language: 'Java',
    timeSpentMinutes: 10,
    notes: 'Compared pure recursive O(2^n) against dynamic space-optimized O(1) space.',
    solvedAt: getPastDateStr(1),
    isRevisionNeeded: false,
  },
  {
    userId: 1,
    title: 'Palindrome Number (No String Conversion)',
    problemUrl: 'https://leetcode.com/problems/palindrome-number/',
    platform: 'LEETCODE',
    difficulty: 'EASY',
    topic: 'Palindrome',
    category: 'LOGIC',
    language: 'Java',
    timeSpentMinutes: 14,
    notes: 'Reversed only the right half of the integer to avoid integer overflow issues.',
    solvedAt: getPastDateStr(2),
    isRevisionNeeded: false,
  },
  {
    userId: 1,
    title: 'Binary Tree Level Order Traversal',
    problemUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    platform: 'LEETCODE',
    difficulty: 'MEDIUM',
    topic: 'Trees',
    category: 'DSA',
    language: 'Java',
    timeSpentMinutes: 25,
    notes: 'Breadth-First Search using Queue. Snapshot queue size at start of each level loop.',
    solvedAt: getPastDateStr(2),
    isRevisionNeeded: false,
  },
  {
    userId: 1,
    title: 'Sieve of Eratosthenes (Prime Numbers)',
    problemUrl: 'https://www.geeksforgeeks.org/sieve-of-eratosthenes/',
    platform: 'GEEKSFORGEEKS',
    difficulty: 'MEDIUM',
    topic: 'Prime Numbers',
    category: 'LOGIC',
    language: 'Java',
    timeSpentMinutes: 22,
    notes: 'Boolean array up to n. Mark multiples of i starting from i*i.',
    solvedAt: getPastDateStr(3),
    isRevisionNeeded: false,
  },
  {
    userId: 1,
    title: 'Valid Parentheses',
    problemUrl: 'https://leetcode.com/problems/valid-parentheses/',
    platform: 'LEETCODE',
    difficulty: 'EASY',
    topic: 'Stacks & Queues',
    category: 'DSA',
    language: 'Java',
    timeSpentMinutes: 12,
    notes: 'Standard Stack usage. Push expected closing bracket on opening match.',
    solvedAt: getPastDateStr(4),
    isRevisionNeeded: false,
  },
  {
    userId: 1,
    title: 'Climbing Stairs',
    problemUrl: 'https://leetcode.com/problems/climbing-stairs/',
    platform: 'LEETCODE',
    difficulty: 'EASY',
    topic: 'Dynamic Programming',
    category: 'DSA',
    language: 'Java',
    timeSpentMinutes: 10,
    notes: 'Identical recurrence to Fibonacci: dp[i] = dp[i-1] + dp[i-2].',
    solvedAt: getPastDateStr(5),
    isRevisionNeeded: false,
  },
  {
    userId: 1,
    title: 'Hollow Square Pattern Printing',
    problemUrl: 'https://www.hackerrank.com/challenges/pattern-printing',
    platform: 'HACKERRANK',
    difficulty: 'EASY',
    topic: 'Pattern Printing',
    category: 'LOGIC',
    language: 'Java',
    timeSpentMinutes: 15,
    notes: 'Nested loops checking boundary conditions (i == 1 || i == n || j == 1 || j == n).',
    solvedAt: getPastDateStr(6),
    isRevisionNeeded: false,
  },
  // User 2 Problem (to test isolation)
  {
    userId: 2,
    title: 'Merge Intervals',
    problemUrl: 'https://leetcode.com/problems/merge-intervals/',
    platform: 'LEETCODE',
    difficulty: 'MEDIUM',
    topic: 'Arrays',
    category: 'DSA',
    language: 'Python',
    timeSpentMinutes: 28,
    notes: 'Sort by start time first, then greedily merge overlapping intervals.',
    solvedAt: todayStr,
    isRevisionNeeded: false,
  }
];

let problemIdCounter = 1;
for (const p of initialSampleProblems) {
  DB.problems.push({
    ...p,
    id: problemIdCounter++,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  });
}

// Seed sample conversation for CodeCat
DB.conversations.push({
  id: 1,
  userId: 1,
  title: 'Armstrong Number Logic in Java',
  problemContext: {
    title: 'Armstrong Number Check',
    category: 'LOGIC',
    topic: 'Armstrong Number',
    difficulty: 'EASY',
    language: 'Java'
  },
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  updatedAt: new Date(Date.now() - 1800000).toISOString(),
  lastMessage: 'Great work! Remember that for an n-digit number, each digit is raised to power n.'
});

DB.messages.push(
  {
    id: 1,
    conversationId: 1,
    role: 'USER',
    content: 'Can you explain the mathematical steps to verify an Armstrong number in Java without using Math.pow() double casting?',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    conversationId: 1,
    role: 'ASSISTANT',
    content: `### 🐾 CodeCat Armstrong Number Guide

To check if an integer $N$ is an **Armstrong Number** (Narcissistic Number):
1. **Count total digits** $k$:
   \`\`\`java
   int temp = n, digits = 0;
   while (temp > 0) {
       digits++;
       temp /= 10;
   }
   \`\`\`
2. **Compute sum of each digit raised to power $k$**:
   Write a small integer power helper to avoid floating point precision inaccuracies:
   \`\`\`java
   int power(int base, int exp) {
       int res = 1;
       for (int i = 0; i < exp; i++) res *= base;
       return res;
   }
   \`\`\`
3. **Compare**: If $\\text{sum} == N$, it is an Armstrong number!

**Time Complexity**: $O(\\log_{10} N)$
**Space Complexity**: $O(1)$`,
    category: 'LOGIC',
    followUps: ['Would you like to see the complete Java solution with edge cases for negative numbers?'],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  }
);

// ----------------------------------------------------
// Helper Functions
// ----------------------------------------------------
function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user: User) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// Authentication Middleware
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Authentication token is required to access this resource.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; name: string };
    const user = DB.users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'User session has expired or is invalid.'
      });
    }
    (req as any).user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token.'
    });
  }
}

// Optional Auth (for endpoints that can behave differently if logged in)
function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const user = DB.users.find(u => u.id === decoded.id);
      if (user) {
        (req as any).user = user;
      }
    } catch {
      // ignore
    }
  }
  next();
}

// Calculate streak stats for a user
function calculateUserStreak(userId: number) {
  const userProblems = DB.problems
    .filter(p => p.userId === userId)
    .sort((a, b) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime());

  if (userProblems.length === 0) {
    return { currentStreak: 0, longestStreak: 0, isActiveToday: false, lastActiveDate: null };
  }

  const uniqueDates = Array.from(new Set(userProblems.map(p => p.solvedAt))).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = getPastDateStr(1);

  const isActiveToday = uniqueDates.includes(today);
  const lastActiveDate = uniqueDates[0] || null;

  let currentStreak = 0;
  let checkDate = new Date();
  if (!isActiveToday) {
    // If not active today, check if active yesterday
    if (uniqueDates.includes(yesterday)) {
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate = null as any;
    }
  }

  if (checkDate) {
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = currentStreak;
  let running = 0;
  // All unique dates in ascending order
  const ascDates = [...uniqueDates].reverse();
  for (let i = 0; i < ascDates.length; i++) {
    if (i === 0) {
      running = 1;
    } else {
      const prev = new Date(ascDates[i - 1]);
      const curr = new Date(ascDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    if (running > longestStreak) {
      longestStreak = running;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    isActiveToday,
    lastActiveDate
  };
}

// ----------------------------------------------------
// Express Server Setup
// ----------------------------------------------------
async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ====================================================
  // API ROUTE 1: Health Diagnostics Endpoint
  // ====================================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'CodeMate Full-Stack Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'Connected (Persistent In-Memory / Node runtime)',
    });
  });

  // ====================================================
  // API ROUTE 2: Authentication Endpoints
  // ====================================================
  
  // Register with Email & Password
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Name, email, and password are required fields.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = DB.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({
        status: 400,
        error: 'Conflict',
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    const newUser: User = {
      id: DB.users.length + 1,
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash: bcrypt.hashSync(password, 8),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      bio: 'Coding enthusiast mastering Logic and Data Structures.',
      authProvider: 'LOCAL',
      dailyTarget: 3,
      createdAt: new Date().toISOString(),
    };

    DB.users.push(newUser);
    const token = generateToken(newUser);

    return res.status(201).json({
      token,
      user: sanitizeUser(newUser),
      message: 'Account registered successfully.'
    });
  });

  // Log in with Email & Password
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = DB.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user || !user.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password. Please verify your credentials.'
      });
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: sanitizeUser(user),
      message: 'Logged in successfully.'
    });
  });

  // Google OAuth Login / Registration
  app.post('/api/auth/google', (req, res) => {
    const { credential, email, name, avatarUrl } = req.body;

    let userEmail = email;
    let userName = name;
    let userAvatar = avatarUrl;

    // Try decoding Google JWT payload if available
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          userEmail = payload.email || userEmail;
          userName = payload.name || userName;
          userAvatar = payload.picture || userAvatar;
        }
      } catch {
        // use hints
      }
    }

    if (!userEmail) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Google credential or verified email is required.'
      });
    }

    const cleanEmail = String(userEmail).trim().toLowerCase();
    let user = DB.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        id: DB.users.length + 1,
        name: userName || 'Google Developer',
        email: cleanEmail,
        avatarUrl: userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
        bio: 'Developer building daily coding habits with CodeMate.',
        authProvider: 'GOOGLE',
        dailyTarget: 3,
        createdAt: new Date().toISOString(),
      };
      DB.users.push(user);
    } else if (userAvatar && !user.avatarUrl.includes('unsplash')) {
      user.avatarUrl = userAvatar;
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: sanitizeUser(user),
      message: 'Google authentication successful.'
    });
  });

  // Get Current Authenticated User Profile
  app.get(['/api/auth/me', '/api/users/me', '/api/users/profile'], authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    return res.json(sanitizeUser(user));
  });

  // Update Profile
  app.put('/api/users/profile', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const { name, bio, avatarUrl, coverUrl } = req.body;

    if (name) user.name = String(name).trim();
    if (bio !== undefined) user.bio = String(bio).trim();
    if (avatarUrl) user.avatarUrl = String(avatarUrl).trim();
    if (coverUrl) user.coverUrl = String(coverUrl).trim();

    return res.json({
      user: sanitizeUser(user),
      message: 'Profile updated successfully.'
    });
  });

  // ====================================================
  // API ROUTE 3: Problems Management (CRUD & Filters)
  // ====================================================

  // GET /api/problems - List & Filter
  app.get('/api/problems', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const {
      search,
      category,
      topic,
      difficulty,
      platform,
      language,
      sortBy = 'solvedAt',
      sortDir = 'DESC'
    } = req.query;

    let list = DB.problems.filter(p => p.userId === user.id);

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'ALL') {
      list = list.filter(p => p.category.toUpperCase() === String(category).toUpperCase());
    }

    if (topic && topic !== 'ALL') {
      list = list.filter(p => p.topic.toLowerCase() === String(topic).toLowerCase());
    }

    if (difficulty && difficulty !== 'ALL') {
      list = list.filter(p => p.difficulty.toUpperCase() === String(difficulty).toUpperCase());
    }

    if (platform && platform !== 'ALL') {
      list = list.filter(p => p.platform.toUpperCase() === String(platform).toUpperCase());
    }

    if (language && language !== 'ALL') {
      list = list.filter(p => p.language.toLowerCase() === String(language).toLowerCase());
    }

    // Sort
    list.sort((a, b) => {
      let valA: any = (a as any)[String(sortBy)] || '';
      let valB: any = (b as any)[String(sortBy)] || '';

      if (sortBy === 'solvedAt' || sortBy === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortDir === 'ASC' ? -1 : 1;
      if (valA > valB) return sortDir === 'ASC' ? 1 : -1;
      return 0;
    });

    return res.json(list);
  });

  // GET /api/problems/:id - Single Problem
  app.get('/api/problems/:id', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const id = Number(req.params.id);
    const problem = DB.problems.find(p => p.id === id);

    if (!problem) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Problem with ID #${id} not found.`
      });
    }

    // Cross-user Data Isolation Check
    if (problem.userId !== user.id) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'You do not have permission to access this problem record.'
      });
    }

    return res.json(problem);
  });

  // POST /api/problems - Create Problem
  app.post('/api/problems', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const {
      title,
      problemUrl,
      platform = 'LEETCODE',
      difficulty = 'EASY',
      topic = 'Arrays',
      category = 'DSA',
      language = 'Java',
      timeSpentMinutes = 15,
      notes,
      solvedAt = new Date().toISOString().split('T')[0],
      isRevisionNeeded = false
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Problem title is required.'
      });
    }

    const newProblem: Problem = {
      id: DB.problems.length + 1,
      userId: user.id,
      title: String(title).trim(),
      problemUrl: problemUrl ? String(problemUrl).trim() : undefined,
      platform: String(platform).toUpperCase(),
      difficulty: (['EASY', 'MEDIUM', 'HARD'].includes(String(difficulty).toUpperCase()) ? String(difficulty).toUpperCase() : 'EASY') as any,
      topic: String(topic).trim(),
      category: (['DSA', 'LOGIC'].includes(String(category).toUpperCase()) ? String(category).toUpperCase() : 'DSA') as any,
      language: String(language).trim(),
      timeSpentMinutes: Number(timeSpentMinutes) || 15,
      notes: notes ? String(notes).trim() : '',
      solvedAt: String(solvedAt),
      isRevisionNeeded: Boolean(isRevisionNeeded),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    DB.problems.push(newProblem);
    return res.status(201).json(newProblem);
  });

  // PUT /api/problems/:id - Update Problem
  app.put('/api/problems/:id', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const id = Number(req.params.id);
    const problemIndex = DB.problems.findIndex(p => p.id === id);

    if (problemIndex === -1) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Problem with ID #${id} not found.`
      });
    }

    if (DB.problems[problemIndex].userId !== user.id) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'You do not have permission to modify this problem record.'
      });
    }

    const existing = DB.problems[problemIndex];
    const updateData = req.body;

    const updated: Problem = {
      ...existing,
      ...updateData,
      id: existing.id,
      userId: existing.userId,
      updatedAt: new Date().toISOString(),
    };

    DB.problems[problemIndex] = updated;
    return res.json(updated);
  });

  // DELETE /api/problems/:id - Delete Problem
  app.delete('/api/problems/:id', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const id = Number(req.params.id);
    const problemIndex = DB.problems.findIndex(p => p.id === id);

    if (problemIndex === -1) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Problem with ID #${id} not found.`
      });
    }

    if (DB.problems[problemIndex].userId !== user.id) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'You do not have permission to delete this problem record.'
      });
    }

    DB.problems.splice(problemIndex, 1);
    return res.json({ success: true, message: `Problem #${id} deleted successfully.` });
  });

  // POST /api/problems/detect-platform - URL detection
  app.post('/api/problems/detect-platform', (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required.' });
    }

    let cleanUrl = url.trim();
    let platform = 'OTHER';
    let title = '';
    let difficulty = 'EASY';

    const urlLower = cleanUrl.toLowerCase();
    if (urlLower.includes('leetcode.com')) {
      platform = 'LEETCODE';
      const match = cleanUrl.match(/\/problems\/([^\/\?#]+)/i);
      if (match && match[1]) {
        title = match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
    } else if (urlLower.includes('hackerrank.com')) {
      platform = 'HACKERRANK';
      const match = cleanUrl.match(/\/challenges\/([^\/\?#]+)/i);
      if (match && match[1]) {
        title = match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
    } else if (urlLower.includes('geeksforgeeks.org')) {
      platform = 'GEEKSFORGEEKS';
      const match = cleanUrl.match(/geeksforgeeks\.org\/([^\/\?#]+)/i);
      if (match && match[1]) {
        title = match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
    } else if (urlLower.includes('codeforces.com')) {
      platform = 'CODEFORCES';
    } else if (urlLower.includes('codechef.com')) {
      platform = 'CODECHEF';
    } else if (urlLower.includes('neetcode.io')) {
      platform = 'NEETCODE';
    }

    return res.json({
      platform,
      title: title || undefined,
      difficulty,
      cleanUrl,
    });
  });

  // ====================================================
  // API ROUTE 4: Dashboard & Analytics Endpoints
  // ====================================================
  
  // GET /api/dashboard
  app.get('/api/dashboard', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const userProblems = DB.problems.filter(p => p.userId === user.id);

    const today = new Date().toISOString().split('T')[0];
    const todaySolvedList = userProblems.filter(p => p.solvedAt === today);
    const todaySolved = todaySolvedList.length;
    const dailyTarget = user.dailyTarget || 3;
    const remaining = Math.max(0, dailyTarget - todaySolved);
    const completionPercentage = Math.min(100, Math.round((todaySolved / dailyTarget) * 100));
    const targetCompleted = todaySolved >= dailyTarget;

    // Week calculations
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const solvedThisWeek = userProblems.filter(p => new Date(p.solvedAt) >= oneWeekAgo).length;

    // Distributions
    const categoryDistribution = {
      DSA: userProblems.filter(p => p.category === 'DSA').length,
      LOGIC: userProblems.filter(p => p.category === 'LOGIC').length,
    };

    const difficultyDistribution = {
      EASY: userProblems.filter(p => p.difficulty === 'EASY').length,
      MEDIUM: userProblems.filter(p => p.difficulty === 'MEDIUM').length,
      HARD: userProblems.filter(p => p.difficulty === 'HARD').length,
    };

    const platformDistribution: Record<string, number> = {};
    const languageDistribution: Record<string, number> = {};
    const topicDistribution: Record<string, number> = {};

    for (const p of userProblems) {
      platformDistribution[p.platform] = (platformDistribution[p.platform] || 0) + 1;
      languageDistribution[p.language] = (languageDistribution[p.language] || 0) + 1;
      topicDistribution[p.topic] = (topicDistribution[p.topic] || 0) + 1;
    }

    // 90-day activity heatmap
    const activity: { date: string; count: number }[] = [];
    const dateCounts: Record<string, number> = {};
    for (const p of userProblems) {
      dateCounts[p.solvedAt] = (dateCounts[p.solvedAt] || 0) + 1;
    }

    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      activity.push({
        date: dateStr,
        count: dateCounts[dateStr] || 0,
      });
    }

    const streak = calculateUserStreak(user.id);
    const recentProblems = [...userProblems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return res.json({
      summary: {
        totalProblems: userProblems.length,
        logicProblems: categoryDistribution.LOGIC,
        dsaProblems: categoryDistribution.DSA,
        solvedThisWeek,
      },
      today: {
        target: dailyTarget,
        solved: todaySolved,
        remaining,
        completionPercentage,
        targetCompleted,
      },
      streak,
      recentProblems,
      activity,
      categoryDistribution,
      difficultyDistribution,
      platformDistribution,
      languageDistribution,
      topicDistribution,
    });
  });

  // GET /api/statistics
  app.get('/api/statistics', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const userProblems = DB.problems.filter(p => p.userId === user.id);
    const streak = calculateUserStreak(user.id);

    return res.json({
      totalSolved: userProblems.length,
      logicCount: userProblems.filter(p => p.category === 'LOGIC').length,
      dsaCount: userProblems.filter(p => p.category === 'DSA').length,
      easyCount: userProblems.filter(p => p.difficulty === 'EASY').length,
      mediumCount: userProblems.filter(p => p.difficulty === 'MEDIUM').length,
      hardCount: userProblems.filter(p => p.difficulty === 'HARD').length,
      streakStats: streak,
    });
  });

  // GET & PUT /api/settings/daily-target
  app.get('/api/settings/daily-target', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    return res.json({ dailyTarget: user.dailyTarget || 3 });
  });

  app.put('/api/settings/daily-target', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const { dailyTarget } = req.body;
    const val = Number(dailyTarget);

    if (isNaN(val) || val < 1 || val > 100) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Daily target must be a positive integer between 1 and 100.'
      });
    }

    user.dailyTarget = val;
    return res.json({
      dailyTarget: val,
      message: `Daily target updated to ${val} problems.`
    });
  });

  // ====================================================
  // API ROUTE 5: CodeCat AI Coding Companion (Gemini 2.5/3.7)
  // ====================================================

  // Service Status
  app.get('/api/codecat/status', (req, res) => {
    res.json({
      status: 'ACTIVE',
      provider: 'Google GenAI',
      model: 'gemini-2.5-flash',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      capabilities: [
        'Pedagogical Socratic Hints',
        'Logic vs DSA Taxonomy Analysis',
        'Time & Space Complexity Breakdown',
        'Edge Case Detection',
        'Java Solution Walkthrough'
      ]
    });
  });

  // Conversations List
  app.get('/api/codecat/conversations', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const userConvs = DB.conversations
      .filter(c => c.userId === user.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return res.json(userConvs);
  });

  // Get Conversation with Messages
  app.get('/api/codecat/conversations/:id', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const id = Number(req.params.id);
    const conv = DB.conversations.find(c => c.id === id);

    if (!conv) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Conversation #${id} not found.`
      });
    }

    if (conv.userId !== user.id) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'Access to this conversation is forbidden.'
      });
    }

    const messages = DB.messages
      .filter(m => m.conversationId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return res.json({
      ...conv,
      messages
    });
  });

  // Delete Conversation
  app.delete('/api/codecat/conversations/:id', authenticateToken, (req, res) => {
    const user = (req as any).user as User;
    const id = Number(req.params.id);
    const convIndex = DB.conversations.findIndex(c => c.id === id);

    if (convIndex === -1) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Conversation #${id} not found.`
      });
    }

    if (DB.conversations[convIndex].userId !== user.id) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'Access to this conversation is forbidden.'
      });
    }

    DB.conversations.splice(convIndex, 1);
    DB.messages = DB.messages.filter(m => m.conversationId !== id);

    return res.json({ success: true, message: `Conversation #${id} deleted.` });
  });

  // POST /api/codecat/chat - Chat with AI
  app.post('/api/codecat/chat', authenticateToken, async (req, res) => {
    const user = (req as any).user as User;
    const { message, conversationId, problemContext, codeSnippet, codeLanguage = 'Java' } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Message text is required.'
      });
    }

    let convId = conversationId ? Number(conversationId) : null;
    let conv: Conversation | undefined;

    if (convId) {
      conv = DB.conversations.find(c => c.id === convId);
      if (conv && conv.userId !== user.id) {
        return res.status(403).json({
          status: 403,
          error: 'Forbidden',
          message: 'Access to foreign conversation is forbidden.'
        });
      }
    }

    if (!conv) {
      const convTitle = problemContext?.title 
        ? `${problemContext.title} Discussion`
        : String(message).slice(0, 35) + '...';

      conv = {
        id: DB.conversations.length + 1,
        userId: user.id,
        title: convTitle,
        problemContext: problemContext || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: String(message).slice(0, 80)
      };
      DB.conversations.push(conv);
      convId = conv.id;
    }

    // Save User message
    const userMsg: ConversationMessage = {
      id: DB.messages.length + 1,
      conversationId: conv.id,
      role: 'USER',
      content: String(message).trim(),
      problemContext,
      createdAt: new Date().toISOString(),
    };
    DB.messages.push(userMsg);

    let replyText = '';
    let replyCategory = problemContext?.category || 'DSA';
    const followUps: string[] = [];

    // System prompt for CodeCat
    const systemInstruction = `You are CodeCat, a warm, pedagogical, and highly encouraging AI coding mentor for students and developers in CodeMate.
Your mission is to guide learners to discover algorithmic and mathematical insights naturally.
- When asked for a hint, never spoil the entire answer immediately. Provide progressive intuition, point out invariant patterns, or ask a guiding Socratic question.
- Always distinguish clearly between foundational LOGIC (e.g. number math, Armstrong, palindromes, recursion, bitwise) and DATA STRUCTURES & ALGORITHMS (arrays, trees, DP, sliding window, graphs).
- Provide clean, readable code with syntax highlighting when requested.
- Explain Time Complexity (Big-O) and Space Complexity with clear reasoning.
- Adopt a supportive, mentor-like tone with feline emojis (🐾, 🐱, ✨).`;

    // Attempt Gemini Generation
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        let promptContent = `User query: ${message}\n`;
        if (problemContext) {
          promptContent += `\nProblem Context:\n- Title: ${problemContext.title}\n- Category: ${problemContext.category} (${problemContext.topic})\n- Difficulty: ${problemContext.difficulty}\n- Language: ${problemContext.language || 'Java'}\n`;
        }
        if (codeSnippet) {
          promptContent += `\nUser Code Snippet (${codeLanguage}):\n\`\`\`${codeLanguage.toLowerCase()}\n${codeSnippet}\n\`\`\`\n`;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptContent,
          config: {
            systemInstruction,
          }
        });

        replyText = response.text || '';
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to pedagogical rule engine:', geminiError.message);
      }
    }

    // Fallback if Gemini key is absent or failed
    if (!replyText) {
      const q = message.toLowerCase();
      const pTitle = problemContext?.title || 'this problem';
      const pTopic = problemContext?.topic || 'Algorithms';

      if (q.includes('hint') || q.includes('approach')) {
        replyText = `### 🐾 CodeCat Progressive Hint for ${pTitle}

1. **Observe the Constraints**: What is the input range? If $N \\le 10^5$, an $O(N)$ or $O(N \\log N)$ solution is required.
2. **Core Pattern**: This challenge relates to **${pTopic}**. Think about what data structure allows you to query previously seen elements or maintain state in $O(1)$ time.
3. **Step 1 Action**: Before jumping straight to code, write down a small 3-element example on paper and trace the state manually.

*Would you like a second hint on optimal data structure selection, or a quick complexity analysis?*`;
        followUps.push('Show me the next progressive hint', 'Explain the optimal Time & Space Complexity');
      } else if (q.includes('complexity') || q.includes('big-o') || q.includes('time')) {
        replyText = `### 🐾 Complexity Analysis for ${pTitle}

- **Time Complexity**: Optimal is typically $O(N)$ for single-pass traversals or $O(N \\log N)$ if sorting is involved.
- **Space Complexity**: Usually $O(N)$ with auxiliary hash tables/arrays, or $O(1)$ if using in-place two-pointer manipulation.

*Key takeaway*: Always identify whether you are trading auxiliary memory for faster lookup speed!`;
        followUps.push('Can we optimize space to O(1)?', 'Show Java implementation');
      } else if (q.includes('debug') || q.includes('error') || codeSnippet) {
        replyText = `### 🐾 CodeCat Debugging Inspection

Let's check the most common pitfalls for **${pTopic}**:
1. **Edge Cases**: Empty input, single element, negative integers, or $N = 0$.
2. **Boundary Indices**: Watch out for off-by-one errors in loop terminations (\`< n\` vs \`<= n\`).
3. **Integer Overflow**: When summing or multiplying numbers, ensure results fit within standard 32-bit signed integers (\`long\` in Java if necessary).

*Share your specific test case input that fails, and we will step through it together!*`;
        followUps.push('Walk through with example test case', 'Show full working solution');
      } else {
        replyText = `### 🐾 CodeCat Guidance on ${pTitle}

Hello! I'm here to help you master **${pTopic}** and sharpen your problem-solving logic.

- **Category**: ${problemContext?.category || 'DSA & Logic'}
- **Focus**: Understanding underlying invariants and edge cases.

Feel free to ask for a hint, debug a tricky failing test case, or explore the optimal time/space trade-offs!`;
        followUps.push('Give me a hint (no spoilers)', 'What is the optimal DSA pattern here?', 'Analyze Time & Space Complexity');
      }
    }

    // Update conversation
    conv.updatedAt = new Date().toISOString();
    conv.lastMessage = replyText.slice(0, 80);

    // Save assistant message
    const botMsg: ConversationMessage = {
      id: DB.messages.length + 1,
      conversationId: conv.id,
      role: 'ASSISTANT',
      content: replyText,
      category: replyCategory,
      followUps,
      createdAt: new Date().toISOString(),
    };
    DB.messages.push(botMsg);

    return res.json({
      conversationId: conv.id,
      reply: replyText,
      message: replyText, // compatible with test assertions
      role: 'ASSISTANT',
      provider: 'Google GenAI',
      category: replyCategory,
      followUps,
      timestamp: new Date().toISOString(),
    });
  });

  // ====================================================
  // VITE DEV SERVER / STATIC ASSETS
  // ====================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeMate full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

import React, { useState } from 'react';
import { Database, Layers, Key, Table2, ArrowRight, Code, ShieldCheck, Check, Copy } from 'lucide-react';

export const EntityArchitectureViewer = () => {
  const [selectedEntity, setSelectedEntity] = useState('User');
  const [copiedDdl, setCopiedDdl] = useState(false);

  const entities = {
    User: {
      name: 'User',
      table: 'users',
      description: 'Core user entity representing registered developers on CodeMate. Designed for Spring Security / JWT in Part 3.',
      fields: [
        { name: 'id', type: 'Long', sql: 'BIGSERIAL PRIMARY KEY', constraint: 'PK / Auto-increment', jpa: '@Id @GeneratedValue(IDENTITY)' },
        { name: 'name', type: 'String', sql: 'VARCHAR(100) NOT NULL', constraint: 'Required, Max 100', jpa: '@NotBlank @Column(nullable=false)' },
        { name: 'email', type: 'String', sql: 'VARCHAR(150) NOT NULL UNIQUE', constraint: 'Required, Unique', jpa: '@NotBlank @Email @Column(unique=true)' },
        { name: 'password', type: 'String', sql: 'VARCHAR(255) NOT NULL', constraint: 'Required (BCrypt ready)', jpa: '@NotBlank @Column(nullable=false)' },
        { name: 'createdAt', type: 'Instant', sql: 'TIMESTAMP NOT NULL', constraint: 'Auto-populated', jpa: '@CreationTimestamp @Column(updatable=false)' },
        { name: 'updatedAt', type: 'Instant', sql: 'TIMESTAMP NOT NULL', constraint: 'Auto-updated', jpa: '@UpdateTimestamp' },
      ],
      relationships: [
        { target: 'Problem', type: '1 → Many', desc: 'One user has many solved problems' },
        { target: 'UserSettings', type: '1 → 1', desc: 'One user has exactly one settings profile' },
        { target: 'Conversation', type: '1 → Many', desc: 'One user has many CodeCat AI conversations' },
      ],
      repository: 'UserRepository',
      queries: ['findByEmail(String email)', 'existsByEmail(String email)'],
    },
    Problem: {
      name: 'Problem',
      table: 'problems',
      description: 'Represents a coding problem solved by a user. Categorized strictly into LOGIC or DSA with granular topics.',
      fields: [
        { name: 'id', type: 'Long', sql: 'BIGSERIAL PRIMARY KEY', constraint: 'PK / Auto-increment', jpa: '@Id @GeneratedValue(IDENTITY)' },
        { name: 'user', type: 'User', sql: 'BIGINT NOT NULL REFERENCES users(id)', constraint: 'FK, Non-null, Lazy', jpa: '@ManyToOne(fetch=LAZY) @JoinColumn' },
        { name: 'title', type: 'String', sql: 'VARCHAR(255) NOT NULL', constraint: 'Required, Max 255', jpa: '@NotBlank @Column(nullable=false)' },
        { name: 'problemUrl', type: 'String', sql: 'VARCHAR(1000)', constraint: 'Optional URL', jpa: '@Column(length=1000)' },
        { name: 'platform', type: 'String', sql: 'VARCHAR(100)', constraint: 'LeetCode, GFG, CodeChef, etc.', jpa: '@Column(length=100)' },
        { name: 'category', type: 'Category', sql: 'VARCHAR(20) NOT NULL', constraint: 'Enum: LOGIC, DSA', jpa: '@Enumerated(STRING) @NotNull' },
        { name: 'topic', type: 'String', sql: 'VARCHAR(100)', constraint: 'Arrays, Binary Search, Prime, etc.', jpa: '@Column(length=100)' },
        { name: 'difficulty', type: 'Difficulty', sql: 'VARCHAR(20) NOT NULL', constraint: 'Enum: EASY, MEDIUM, HARD', jpa: '@Enumerated(STRING) @NotNull' },
        { name: 'programmingLanguage', type: 'String', sql: 'VARCHAR(50)', constraint: 'Java, C++, Python, JS, etc.', jpa: '@Column(length=50)' },
        { name: 'solvedAt', type: 'Instant', sql: 'TIMESTAMP', constraint: 'For streaks & progress', jpa: '@Column(name="solved_at")' },
        { name: 'createdAt', type: 'Instant', sql: 'TIMESTAMP NOT NULL', constraint: 'Auto-populated', jpa: '@CreationTimestamp' },
        { name: 'updatedAt', type: 'Instant', sql: 'TIMESTAMP NOT NULL', constraint: 'Auto-updated', jpa: '@UpdateTimestamp' },
      ],
      relationships: [
        { target: 'User', type: 'Many → 1', desc: 'Each problem belongs to exactly one user' },
      ],
      repository: 'ProblemRepository',
      queries: ['findByUserId(Long userId)', 'findByUserIdAndCategory(Long userId, Category category)', 'findByUserIdOrderBySolvedAtDesc(Long userId)', 'countByUserId(Long userId)'],
    },
    UserSettings: {
      name: 'UserSettings',
      table: 'user_settings',
      description: 'Stores user-specific goals, daily target problem counts for streaks and progress calculations.',
      fields: [
        { name: 'id', type: 'Long', sql: 'BIGSERIAL PRIMARY KEY', constraint: 'PK / Auto-increment', jpa: '@Id @GeneratedValue(IDENTITY)' },
        { name: 'user', type: 'User', sql: 'BIGINT NOT NULL UNIQUE REFERENCES users(id)', constraint: 'FK, Unique, Non-null', jpa: '@OneToOne(fetch=LAZY) @JoinColumn' },
        { name: 'dailyTarget', type: 'Integer', sql: 'INT NOT NULL DEFAULT 3', constraint: 'Min: 1 (Default: 3)', jpa: '@NotNull @Min(1) @Column' },
        { name: 'createdAt', type: 'Instant', sql: 'TIMESTAMP NOT NULL', constraint: 'Auto-populated', jpa: '@CreationTimestamp' },
        { name: 'updatedAt', type: 'Instant', sql: 'TIMESTAMP NOT NULL', constraint: 'Auto-updated', jpa: '@UpdateTimestamp' },
      ],
      relationships: [
        { target: 'User', type: '1 → 1', desc: 'Direct 1-to-1 relationship with User' },
      ],
      repository: 'UserSettingsRepository',
      queries: ['findByUserId(Long userId)', 'existsByUserId(Long userId)'],
    },
    Conversation: {
      name: 'Conversation',
      table: 'conversations',
      description: 'AI coding assistant dialogue session with CodeCat. Holds title and timestamps for user chat history.',
      fields: [
        { name: 'id', type: 'Long', sql: 'BIGSERIAL PRIMARY KEY', constraint: 'PK / Auto-increment', jpa: '@Id @GeneratedValue(IDENTITY)' },
        { name: 'user', type: 'User', sql: 'BIGINT NOT NULL REFERENCES users(id)', constraint: 'FK, Non-null, Lazy', jpa: '@ManyToOne(fetch=LAZY) @JoinColumn' },
        { name: 'title', type: 'String', sql: 'VARCHAR(200) NOT NULL', constraint: 'Required, Max 200', jpa: '@NotBlank @Column(nullable=false)' },
        { name: 'createdAt', type: 'Instant', sql: 'TIMESTAMP NOT NULL', constraint: 'Auto-populated', jpa: '@CreationTimestamp' },
        { name: 'updatedAt', type: 'Instant', sql: 'TIMESTAMP NOT NULL', constraint: 'Auto-updated', jpa: '@UpdateTimestamp' },
      ],
      relationships: [
        { target: 'User', type: 'Many → 1', desc: 'Each conversation belongs to a user' },
        { target: 'Message', type: '1 → Many', desc: 'Contains sequence of AI/User dialogue turns' },
      ],
      repository: 'ConversationRepository',
      queries: ['findByUserIdOrderByUpdatedAtDesc(Long userId)', 'findByIdAndUserId(Long id, Long userId)'],
    },
    Message: {
      name: 'Message',
      table: 'messages',
      description: 'Individual prompt or assistant response in a CodeCat conversation. Stored in PostgreSQL TEXT format.',
      fields: [
        { name: 'id', type: 'Long', sql: 'BIGSERIAL PRIMARY KEY', constraint: 'PK / Auto-increment', jpa: '@Id @GeneratedValue(IDENTITY)' },
        { name: 'conversation', type: 'Conversation', sql: 'BIGINT NOT NULL REFERENCES conversations(id)', constraint: 'FK, Non-null, Lazy', jpa: '@ManyToOne(fetch=LAZY) @JoinColumn' },
        { name: 'role', type: 'MessageRole', sql: 'VARCHAR(20) NOT NULL', constraint: 'Enum: USER, ASSISTANT', jpa: '@Enumerated(STRING) @NotNull' },
        { name: 'content', type: 'String', sql: 'TEXT NOT NULL', constraint: 'Unlimited rich text/code', jpa: '@NotBlank @Column(columnDefinition="TEXT")' },
        { name: 'createdAt', type: 'Instant', sql: 'TIMESTAMP NOT NULL', constraint: 'Auto-populated', jpa: '@CreationTimestamp' },
      ],
      relationships: [
        { target: 'Conversation', type: 'Many → 1', desc: 'Belongs to exactly one conversation' },
      ],
      repository: 'MessageRepository',
      queries: ['findByConversationIdOrderByCreatedAtAsc(Long conversationId)', 'countByConversationId(Long conversationId)'],
    },
  };

  const current = entities[selectedEntity];

  const fullDdlSql = `-- CodeMate PostgreSQL DDL Schema (Part 2)

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    daily_target INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS problems (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    problem_url VARCHAR(1000),
    platform VARCHAR(100),
    category VARCHAR(20) NOT NULL CHECK (category IN ('LOGIC', 'DSA')),
    topic VARCHAR(100),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    programming_language VARCHAR(50),
    solved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

  const copyDdl = () => {
    navigator.clipboard.writeText(fullDdlSql);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Part 2: Database &amp; Entity Architecture
            </h2>
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">
            PostgreSQL Domain Entities &amp; JPA Repositories
          </p>
        </div>

        {/* Entity Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {Object.keys(entities).map((entityKey) => (
            <button
              key={entityKey}
              onClick={() => setSelectedEntity(entityKey)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedEntity === entityKey
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {entityKey}
            </button>
          ))}
        </div>
      </div>

      {/* Conceptual ER Hierarchy Flow */}
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Conceptual Entity Topology</span>
          <span className="font-mono text-blue-600 font-semibold">PostgreSQL Relational Graph</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          {/* User Node */}
          <div className={`p-3 rounded-lg border transition-all ${
            selectedEntity === 'User' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-slate-200'
          }`}>
            <div className="text-xs font-bold text-slate-900">User (Root)</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">users table</div>
          </div>

          {/* Problems Node */}
          <div className={`p-3 rounded-lg border transition-all ${
            selectedEntity === 'Problem' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-slate-200'
          }`}>
            <div className="text-xs font-bold text-slate-900">Problem (1 → N)</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">LOGIC + DSA</div>
          </div>

          {/* UserSettings Node */}
          <div className={`p-3 rounded-lg border transition-all ${
            selectedEntity === 'UserSettings' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-slate-200'
          }`}>
            <div className="text-xs font-bold text-slate-900">UserSettings (1 → 1)</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">dailyTarget goal</div>
          </div>

          {/* CodeCat Hierarchy */}
          <div className={`p-3 rounded-lg border transition-all ${
            selectedEntity === 'Conversation' || selectedEntity === 'Message'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200'
          }`}>
            <div className="text-xs font-bold text-slate-900">CodeCat AI (1 → N → N)</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Conversation → Message</div>
          </div>
        </div>
      </div>

      {/* Selected Entity Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left 2 Cols: Fields & Types */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                {current.name}.java <span className="text-slate-400 font-sans text-xs">({current.table})</span>
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
              Spring Data JPA
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {current.description}
          </p>

          {/* Fields Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Field</th>
                  <th className="py-2.5 px-3">Java Type</th>
                  <th className="py-2.5 px-3">PostgreSQL Column</th>
                  <th className="py-2.5 px-3">Constraint / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {current.fields.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-900">{f.name}</td>
                    <td className="py-2 px-3 text-blue-600">{f.type}</td>
                    <td className="py-2 px-3 text-emerald-700">{f.sql}</td>
                    <td className="py-2 px-3 text-slate-500 font-sans">{f.constraint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Relationships & Repository queries */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              JPA Relationships
            </h4>
            <div className="space-y-2">
              {current.relationships.map((rel, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                    <span>{rel.target}</span>
                    <span className="font-mono text-blue-600 text-[11px]">{rel.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{rel.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Repository: <code className="text-slate-800 font-mono">{current.repository}</code>
            </h4>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-1.5 border border-slate-800">
              {current.queries.map((q, idx) => (
                <div key={idx} className="text-blue-300">
                  <span className="text-slate-500">public</span> {q};
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DDL Schema Preview */}
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Code className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Generated PostgreSQL DDL (<code className="text-blue-600 font-mono">schema.sql</code>)
            </span>
          </div>
          <button
            onClick={copyDdl}
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer font-mono"
          >
            {copiedDdl ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedDdl ? 'Copied DDL' : 'Copy DDL'}</span>
          </button>
        </div>

        <div className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto max-h-48 shadow-inner border border-slate-800 leading-relaxed">
          <pre>{fullDdlSql}</pre>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Folder, FileCode, Server, Laptop, Terminal } from 'lucide-react';

export const FolderStructureViewer = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Codebase Blueprint
          </h2>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            Standard Full-Stack Package &amp; Module Organization (Part 2)
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
          Maven + Vite Layout
        </span>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 shadow-xl text-slate-300 font-mono text-xs leading-relaxed border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 text-slate-400">codemate-project-tree</span>
          </div>
          <span className="text-blue-400">Spring Boot 3 + PostgreSQL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backend Blueprint */}
          <div>
            <div className="text-blue-400 font-bold mb-2 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              <span>backend/ (Spring Boot 3 + JPA)</span>
            </div>
            <div className="space-y-1 text-slate-300 pl-2 text-[11px]">
              <div>├── <span className="text-amber-300">pom.xml</span> <span className="text-slate-500"># Spring Data JPA, Postgres Driver</span></div>
              <div>├── <span className="text-amber-300">.env.example</span> <span className="text-slate-500"># PostgreSQL JDBC settings</span></div>
              <div>└── src/main/</div>
              <div className="pl-4">├── resources/</div>
              <div className="pl-8">└── <span className="text-amber-300">application.properties</span> <span className="text-slate-500"># ddl-auto=update</span></div>
              <div className="pl-4">└── java/com/codemate/</div>
              <div className="pl-8">├── <span className="text-blue-300">CodeMateApplication.java</span></div>
              <div className="pl-8">├── entity/ <span className="text-emerald-400 font-semibold">[Part 2 Domain Models]</span></div>
              <div className="pl-12">├── <span className="text-emerald-300">User.java</span></div>
              <div className="pl-12">├── <span className="text-emerald-300">Problem.java</span></div>
              <div className="pl-12">├── <span className="text-emerald-300">UserSettings.java</span></div>
              <div className="pl-12">├── <span className="text-emerald-300">Conversation.java</span></div>
              <div className="pl-12">├── <span className="text-emerald-300">Message.java</span></div>
              <div className="pl-12">└── enums: <span className="text-amber-300">Category</span>, <span className="text-amber-300">Difficulty</span>, <span className="text-amber-300">MessageRole</span></div>
              <div className="pl-8">├── repository/ <span className="text-blue-400 font-semibold">[Part 2 JPA Repositories]</span></div>
              <div className="pl-12">├── <span className="text-blue-300">UserRepository.java</span></div>
              <div className="pl-12">├── <span className="text-blue-300">ProblemRepository.java</span></div>
              <div className="pl-12">├── <span className="text-blue-300">UserSettingsRepository.java</span></div>
              <div className="pl-12">├── <span className="text-blue-300">ConversationRepository.java</span></div>
              <div className="pl-12">└── <span className="text-blue-300">MessageRepository.java</span></div>
              <div className="pl-8">├── security/ <span className="text-indigo-400 font-semibold">[Part 3 Auth &amp; Security]</span></div>
              <div className="pl-12">├── <span className="text-indigo-300">SecurityConfig.java</span></div>
              <div className="pl-12">├── <span className="text-indigo-300">JwtUtils.java</span></div>
              <div className="pl-12">├── <span className="text-indigo-300">JwtAuthenticationFilter.java</span></div>
              <div className="pl-12">├── <span className="text-indigo-300">CustomUserDetailsService.java</span></div>
              <div className="pl-12">├── <span className="text-indigo-300">UserPrincipal.java</span></div>
              <div className="pl-12">└── <span className="text-indigo-300">JwtAuthenticationEntryPoint.java</span></div>
              <div className="pl-8">├── dto/ <span className="text-amber-400 font-semibold">[Part 3 DTOs]</span></div>
              <div className="pl-12">├── <span className="text-amber-300">RegisterRequest.java</span> &amp; <span className="text-amber-300">LoginRequest.java</span></div>
              <div className="pl-12">├── <span className="text-amber-300">GoogleLoginRequest.java</span> &amp; <span className="text-amber-300">AuthResponse.java</span></div>
              <div className="pl-12">└── <span className="text-amber-300">UserResponse.java</span> &amp; <span className="text-amber-300">ErrorResponse.java</span></div>
              <div className="pl-8">├── service/ <span className="text-emerald-400 font-semibold">[Part 3 Services]</span></div>
              <div className="pl-12">├── <span className="text-emerald-300">AuthService.java</span></div>
              <div className="pl-12">└── <span className="text-emerald-300">UserService.java</span></div>
              <div className="pl-8">├── controller/ <span className="text-blue-400 font-semibold">[REST Endpoints]</span></div>
              <div className="pl-12">├── <span className="text-blue-300">AuthController.java</span> <span className="text-indigo-400">[Part 3]</span></div>
              <div className="pl-12">└── <span className="text-slate-400">HealthController.java</span></div>
            </div>
          </div>

          {/* Frontend Blueprint */}
          <div>
            <div className="text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5" />
              <span>frontend/ (React + Vite)</span>
            </div>
            <div className="space-y-1 text-slate-300 pl-2 text-[11px]">
              <div>├── <span className="text-amber-300">package.json</span> <span className="text-slate-500"># React 19, Tailwind, Lucide</span></div>
              <div>├── <span className="text-amber-300">.env.example</span> <span className="text-slate-500"># VITE_API_BASE_URL</span></div>
              <div>└── src/</div>
              <div className="pl-4">├── <span className="text-blue-300">main.jsx</span> &amp; <span className="text-blue-300">App.jsx</span></div>
              <div className="pl-4">├── config/<span className="text-emerald-400">api.ts</span> <span className="text-slate-500"># Centralized resolver</span></div>
              <div className="pl-4">├── services/</div>
              <div className="pl-8">├── <span className="text-emerald-400">apiClient.ts</span> <span className="text-slate-500"># Fetch wrapper</span></div>
              <div className="pl-8">└── <span className="text-emerald-400">healthService.ts</span> <span className="text-slate-500"># Health check endpoint</span></div>
              <div className="pl-4">├── components/</div>
              <div className="pl-8">├── <span className="text-blue-300">EntityArchitectureViewer.jsx</span> <span className="text-emerald-400">[Part 2]</span></div>
              <div className="pl-8">├── <span className="text-blue-300">CategoryLogicDsaViewer.jsx</span> <span className="text-emerald-400">[Part 2]</span></div>
              <div className="pl-8">├── <span className="text-slate-400">ArchitectureCard.jsx</span></div>
              <div className="pl-8">├── <span className="text-slate-400">HealthChecker.jsx</span></div>
              <div className="pl-8">└── <span className="text-slate-400">EnvConfigViewer.jsx</span></div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Hibernate schema generation ready:</span>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 bg-slate-800 text-blue-300 rounded font-mono">spring.jpa.hibernate.ddl-auto=update</span>
          </div>
        </div>
      </div>
    </div>
  );
};

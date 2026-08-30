import React from 'react';
import { Database, Server, Laptop, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export const ArchitectureCard = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            System Architecture
          </h2>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            3-Tier Deployment Topology &amp; Target Hosts
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
          Vercel → Render → Cloud DB
        </span>
      </div>

      {/* Clean Minimalism 3-Node Architecture Pipeline */}
      <div className="relative flex flex-col sm:flex-row justify-between items-center py-6 sm:py-8 gap-6 sm:gap-2">
        {/* Node 1: Vercel Frontend */}
        <div className="z-10 flex flex-col items-center text-center gap-2 group">
          <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm transition-transform group-hover:scale-105">
            V
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Frontend</p>
            <p className="text-[11px] text-slate-500 font-medium">Vercel (React)</p>
          </div>
        </div>

        {/* Connector 1 */}
        <div className="hidden sm:block flex-1 h-px bg-slate-200 relative mx-4">
          <div className="absolute -top-1 right-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
        </div>

        {/* Node 2: Render Backend */}
        <div className="z-10 flex flex-col items-center text-center gap-2 group">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl italic shadow-sm transition-transform group-hover:scale-105">
            R
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Backend</p>
            <p className="text-[11px] text-slate-500 font-medium">Render (Spring Boot)</p>
          </div>
        </div>

        {/* Connector 2 */}
        <div className="hidden sm:block flex-1 h-px bg-slate-200 relative mx-4">
          <div className="absolute -top-1 right-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>

        {/* Node 3: Cloud PostgreSQL */}
        <div className="z-10 flex flex-col items-center text-center gap-2 group">
          <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
            DB
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Database</p>
            <p className="text-[11px] text-slate-500 font-medium">Postgres (Cloud)</p>
          </div>
        </div>
      </div>

      {/* Architecture Philosophy Quote / Note */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
        <p className="text-xs leading-relaxed text-slate-600 italic">
          Foundation configured with environment-based CORS and centralized API routing. Ready for horizontal scaling and external AI service integration (CodeCat) without exposing secrets to the client.
        </p>
      </div>

      {/* Spring Boot Layer Hierarchy */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Spring Boot Layered Hierarchy
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs font-mono">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="block text-blue-600 font-bold text-xs">1. Controller</span>
            <span className="text-[11px] text-slate-500 font-sans mt-0.5 block">REST &amp; DTO Mapping</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="block text-blue-600 font-bold text-xs">2. Service</span>
            <span className="text-[11px] text-slate-500 font-sans mt-0.5 block">Core Logic Layer</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="block text-blue-600 font-bold text-xs">3. Repository</span>
            <span className="text-[11px] text-slate-500 font-sans mt-0.5 block">Data JPA Queries</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="block text-emerald-600 font-bold text-xs">4. Database</span>
            <span className="text-[11px] text-slate-500 font-sans mt-0.5 block">PostgreSQL Tables</span>
          </div>
        </div>
      </div>
    </div>
  );
};

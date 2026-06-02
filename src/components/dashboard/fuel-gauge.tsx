'use client';

import { Icon } from '@iconify/react';

interface FuelGaugeProps {
  usedTokens: number;
  limitTokens: number;
  usedCost: number;
  limitCost: number;
}

export function FuelGauge({ usedTokens, limitTokens, usedCost, limitCost }: FuelGaugeProps) {
  const tokenPct = Math.min(100, Math.round((usedTokens / limitTokens) * 100)) || 0;

  // Circular gauge config
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (tokenPct / 100) * circumference;

  return (
    <div className="bg-[#161920]/80 backdrop-blur-md rounded-2xl p-5 border border-[#333a47]/30 flex flex-col items-center text-center shadow-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="w-full flex items-center justify-between border-b border-[#333a47]/20 pb-3 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Icon icon="solar:fuel-bold" className="text-orange-500 animate-pulse" />
          LLM Fuel Meter
        </span>
        <span className="text-[9px] font-mono text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
          30d Rolling
        </span>
      </div>

      <div className="relative flex items-center justify-center h-32 w-32">
        {/* Background track circle */}
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-[#1f2633] fill-none"
            strokeWidth="8"
          />
          {/* Fill circle (CSS-animated for the initial draw) */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-orange-500 fill-none drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] fuel-gauge-fill transition-[stroke-dashoffset] duration-1000 ease-out"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>

        {/* Center content */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-black text-white">{tokenPct}%</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Quota Used</span>
        </div>
      </div>

      {/* Quota details */}
      <div className="w-full mt-4 grid grid-cols-2 gap-4 border-t border-[#333a47]/10 pt-4 text-left">
        <div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Token Count</span>
          <p className="text-xs font-black text-slate-200 mt-1 font-mono">{usedTokens.toLocaleString()}</p>
          <span className="text-[9px] text-slate-500 font-mono">Limit: {(limitTokens / 1000000).toFixed(0)}M</span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Cost Limit</span>
          <p className="text-xs font-black text-emerald-400 mt-1 font-mono">${usedCost.toFixed(4)}</p>
          <span className="text-[9px] text-slate-500 font-mono">Max: ${limitCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

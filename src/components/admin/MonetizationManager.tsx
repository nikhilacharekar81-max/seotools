import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  DollarSign, 
  Layers, 
  Check, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ToggleLeft, 
  ToggleRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { AdUnit } from '../../types';

export const MonetizationManager: React.FC = () => {
  const { adUnits, toggleAdUnit, updateAdUnit, plans } = usePlatform();
  const [activeTab, setActiveTab] = useState<'ads' | 'subscriptions' | 'ledger'>('ads');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#046a38] font-mono">
              FinOps & Revenue Architecture
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0c2340]">Monetization & Ad Inventory</h1>
          <p className="text-xs text-slate-500">
            Configure dynamic ad units, subscription plan quotas, and view monthly recurring revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-900">
            <span>Current MRR: </span>
            <strong className="text-sm font-bold text-[#0c2340]">$4,820</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 border-b border-slate-200 flex items-center gap-2 text-xs font-medium bg-slate-50/50">
          <button
            onClick={() => setActiveTab('ads')}
            className={`py-3.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'ads' ? 'border-[#0c2340] text-[#0c2340] font-bold' : 'border-transparent text-slate-500'
            }`}
          >
            AdSense & Display Ad Units
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`py-3.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'subscriptions' ? 'border-[#0c2340] text-[#0c2340] font-bold' : 'border-transparent text-slate-500'
            }`}
          >
            Subscription Tiers & Quotas
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-3.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'ledger' ? 'border-[#0c2340] text-[#0c2340] font-bold' : 'border-transparent text-slate-500'
            }`}
          >
            Transaction Ledger
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: AD PLACEMENTS */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Configured Display Ad Inventory</h3>
                <p className="text-xs text-slate-500">
                  Toggle and customize Google AdSense or custom HTML banner scripts across site slots.
                </p>
              </div>

              <div className="space-y-4">
                {adUnits.map(unit => (
                  <div key={unit.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-slate-900">{unit.name}</strong>
                          <span className="text-[10px] font-mono text-slate-400">({unit.location})</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Impressions: <strong className="font-mono text-slate-700">{unit.impressions.toLocaleString()}</strong> · 
                          Clicks: <strong className="font-mono text-slate-700">{unit.clicks.toLocaleString()}</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => toggleAdUnit(unit.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          unit.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {unit.enabled ? 'Slot ACTIVE' : 'Slot DISABLED'}
                      </button>
                    </div>

                    <div className="text-xs font-mono">
                      <textarea
                        value={unit.codeSnippet}
                        onChange={(e) => updateAdUnit({ ...unit, codeSnippet: e.target.value })}
                        rows={2}
                        className="w-full p-2.5 bg-slate-900 text-emerald-400 rounded-lg border border-slate-800 text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIPTION TIERS */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Subscription Plans & Feature Gates</h3>
                <p className="text-xs text-slate-500">
                  Manage commercial price points and daily execution quotas per user tier.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div key={plan.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-slate-900 text-base">{plan.name}</h4>
                      <span className="font-mono font-bold text-lg text-[#0c2340]">${plan.priceMonthly}/mo</span>
                    </div>

                    <p className="text-xs text-slate-500">{plan.description}</p>

                    <div className="space-y-2 text-xs pt-3 border-t border-slate-200 font-mono text-slate-600">
                      <div className="flex justify-between">
                        <span>Daily Runs:</span>
                        <strong className="text-slate-900">{plan.toolQuotaPerDay.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Payload:</span>
                        <strong className="text-slate-900">{plan.maxFileSize}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>API Access:</span>
                        <strong className={plan.hasApiAccess ? 'text-emerald-700' : 'text-slate-400'}>
                          {plan.hasApiAccess ? 'YES' : 'NO'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Ad-Free:</span>
                        <strong className={plan.hasAdFree ? 'text-emerald-700' : 'text-slate-400'}>
                          {plan.hasAdFree ? 'YES' : 'NO'}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Recent Subscription Invoices</h3>
                <p className="text-slate-500">Real-time ledger of inbound Stripe and PayPal webhooks.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead className="bg-slate-50 text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Transaction ID</th>
                      <th className="py-2.5 px-4">Customer</th>
                      <th className="py-2.5 px-4">Plan</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-slate-600">txn_948201948</td>
                      <td className="py-3 px-4 font-medium text-slate-900">elena.rostova@cloudscale.dev</td>
                      <td className="py-3 px-4">Enterprise Agency</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">$49.00</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">2026-03-20</td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">Paid</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-slate-600">txn_839102847</td>
                      <td className="py-3 px-4 font-medium text-slate-900">marcus@growthrank.org</td>
                      <td className="py-3 px-4">Pro Webmaster</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">$12.00</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">2026-03-14</td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">Paid</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

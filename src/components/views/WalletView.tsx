import React, { useState } from 'react';
import { Coins, ShieldCheck, ArrowDownToLine, ArrowUpFromLine, History, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const WalletView: React.FC = () => {
  const { inkaBalance, ledger, claimFreeInka, addLedgerEntry } = usePlatform();
  const [showSimModal, setShowSimModal] = useState(false);
  const [simAmount, setSimAmount] = useState<number>(10);
  const [simNotice, setSimNotice] = useState<string | null>(null);

  // Future phase preview calculation (100 purchase / 80 redeem spread per Section 6.3)
  const purchasePriceRWF = 100;
  const redeemPriceRWF = 80;
  const spreadPerInka = purchasePriceRWF - redeemPriceRWF; // 20 RWF spread

  const handleSimulateCashout = (e: React.FormEvent) => {
    e.preventDefault();
    if (simAmount > inkaBalance) {
      alert('Redemption amount exceeds available inka balance.');
      return;
    }

    const estimatedRWF = simAmount * redeemPriceRWF;
    addLedgerEntry({
      type: 'cashout_sim',
      amount: -simAmount,
      description: `Future Phase Redemption Simulation: Redeemed ${simAmount} inka for RWF ${estimatedRWF.toLocaleString()} via MTN MoMo / Airtel Money (Fixed rate 80 RWF/inka).`,
    });

    setSimNotice(`Simulated cashout of ${simAmount} inka for RWF ${estimatedRWF.toLocaleString()} successfully recorded to audit ledger.`);
    setShowSimModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Free Launch Notice */}
      <div className="p-6 bg-gradient-to-r from-amber-950/40 via-[#18202b] to-[#12171f] border border-amber-500/30 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Sparkles className="w-3 h-3" />
            <span>Launch Phase: All Inka & Games Free</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Inka Wallet & Audit Ledger</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Inka is the platform’s unit of play for stakes and gradual settlement (meaning small game pieces/seeds, not cattle).
            During launch, users receive inka without charge to enjoy pure skill competition.
          </p>
        </div>

        <div className="p-4 bg-[#0d1218] rounded-xl border border-amber-500/40 text-right min-w-[200px]">
          <span className="text-xs text-slate-400 block">Available Balance:</span>
          <span className="text-3xl font-extrabold font-mono text-amber-400">
            {inkaBalance.toFixed(2)}{' '}
            <span className="text-sm font-sans font-medium text-slate-400">Inka</span>
          </span>
          <div className="pt-2">
            <button
              onClick={() => claimFreeInka(25)}
              className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Claim Free 25 Inka Refill</span>
            </button>
          </div>
        </div>
      </div>

      {simNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <span>{simNotice}</span>
          <button onClick={() => setSimNotice(null)} className="text-emerald-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Two Columns: Future Phase Model Preview & The Audit Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Section 6.3 & 10.1 Future Phase Economics Specification */}
        <div className="p-6 bg-[#131922] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Inka Economics & Safeguards</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform model uses two fixed prices to prevent speculation while funding servers and operations:
          </p>

          <div className="p-4 bg-[#0c1015] rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Platform Sells 1 Inka:</span>
              <strong className="text-white">100 RWF</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Platform Redeems 1 Inka:</span>
              <strong className="text-amber-400">80 RWF</strong>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
              <span>Fixed Gross Spread:</span>
              <span className="text-slate-400">20 RWF per inka</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              <strong>Neutral Revenue:</strong> The platform earns income solely from the buy/redeem
              spread and non-intrusive ads, never from taking a cut of who wins matches.
            </p>
            <p>
              <strong>Anti-Fraud Controls (Section 6.5 & 11):</strong> Real money redemptions require
              national ID verification (KYC), daily redemption caps, and cooperation with MTN MoMo / Airtel Money.
            </p>
          </div>

          <button
            onClick={() => setShowSimModal(true)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            Simulate Future MoMo Cashout
          </button>
        </div>

        {/* Right 2 Columns: Audit Ledger (Doc Section 13.4) */}
        <div className="lg:col-span-2 p-6 bg-[#131922] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Inka Audit Ledger (Section 13.4)</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Immutable entry log · Hundredths precision
            </span>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed">
            Every movement of inka is recorded as a distinct immutable transaction entry. The current
            balance is always derived from verified historical movements.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] font-mono">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Transaction Description</th>
                  <th className="py-2.5 px-3 text-right">Inka Change</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {ledger.map((entry) => {
                  const isPositive = entry.amount >= 0;
                  return (
                    <tr key={entry.id} className="hover:bg-[#18212e]/50 transition-colors">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{entry.timestamp}</td>
                      <td className="py-3 px-3 font-sans text-slate-200 max-w-sm">{entry.description}</td>
                      <td
                        className={`py-3 px-3 text-right font-semibold whitespace-nowrap ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? `+${entry.amount.toFixed(2)}` : entry.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 font-bold whitespace-nowrap">
                        {entry.balanceAfter.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cashout Simulation Modal */}
      {showSimModal && (
        <div
          role="dialog"
          aria-labelledby="sim-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md bg-[#161c24] border border-[#2b3544] rounded-2xl shadow-2xl p-6 text-white space-y-4">
            <h3 id="sim-modal-title" className="text-lg font-bold font-display text-white">
              Simulate Future Mobile Money Cashout
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Demonstrates how the future paid phase will redeem inka via MTN Mobile Money or Airtel Money
              using the concept’s 80 RWF per inka fixed redemption rate (Section 6.3).
            </p>

            <form onSubmit={handleSimulateCashout} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Inka to Redeem:
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.floor(inkaBalance)}
                  value={simAmount}
                  onChange={(e) => setSimAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-[#0c1015] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-[#0c1015] rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Redemption Rate:</span>
                  <span className="font-mono text-slate-200">80 RWF / Inka</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Payout:</span>
                  <span className="font-mono font-bold text-amber-300">
                    RWF {(simAmount * 80).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                  Daily KYC limit: 50 inka. No user-to-user inka trading permitted.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Simulate Cashout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

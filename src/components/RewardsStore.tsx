import React, { useState } from 'react';
import { 
  Sparkles, 
  Gift, 
  Ticket, 
  Check, 
  Copy, 
  ExternalLink, 
  Train, 
  Coffee, 
  ShoppingBag, 
  Store, 
  Building2, 
  Film, 
  Trees, 
  Fuel,
  ArrowRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Voucher, Redemption } from '../types';

export const RewardsStore: React.FC = () => {
  const { 
    user, 
    vouchers, 
    myRedemptions, 
    redeemVoucher, 
    setActiveTab, 
    setIsAuthModalOpen 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedVoucherForDetails, setSelectedVoucherForDetails] = useState<Voucher | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<{ voucher: Voucher; code: string } | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'catalog' | 'my_vouchers'>('catalog');

  const categories = ['all', 'Transit & Travel', 'Food & Dining', 'Shopping', 'Civic Benefit', 'Entertainment'];

  const filteredVouchers = vouchers.filter((v) => {
    if (activeCategory !== 'all' && v.category !== activeCategory) return false;
    return true;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Train': return <Train className="w-6 h-6" />;
      case 'Coffee': return <Coffee className="w-6 h-6" />;
      case 'ShoppingBag': return <ShoppingBag className="w-6 h-6" />;
      case 'Store': return <Store className="w-6 h-6" />;
      case 'Building2': return <Building2 className="w-6 h-6" />;
      case 'Film': return <Film className="w-6 h-6" />;
      case 'Trees': return <Trees className="w-6 h-6" />;
      case 'Fuel': return <Fuel className="w-6 h-6" />;
      default: return <Gift className="w-6 h-6" />;
    }
  };

  const handleRedeem = async (voucher: Voucher) => {
    setRedeemError(null);
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (user.points < voucher.pointsCost) {
      setRedeemError(`You need ${voucher.pointsCost - user.points} more points to redeem this voucher. Report civic issues to earn +50 points each!`);
      return;
    }

    setRedeemingId(voucher.id);
    const res = await redeemVoucher(voucher.id);
    setRedeemingId(null);

    if (res.success && res.code) {
      setRedeemSuccess({ voucher, code: res.code });
    } else {
      setRedeemError(res.error || 'Failed to redeem voucher.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner with User Balance */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Civic Rewards & Voucher Store</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Turn Civic Reports into Real Rewards
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
              Earn <strong>+50 points</strong> for every civic problem you report (potholes, garbage, broken streetlights). Redeem points for free metro cards, shopping vouchers, coffee, and municipal tax discounts!
            </p>
          </div>

          {/* User Points Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shrink-0 min-w-[260px] text-center md:text-left space-y-3">
            <span className="text-xs text-orange-200 font-semibold uppercase tracking-wider block">
              Your Available Balance
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-4xl font-black text-white">
                {user ? user.points : 0}
              </span>
              <span className="text-sm font-bold text-yellow-300">
                Civic Points
              </span>
            </div>

            {user ? (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15 text-xs text-orange-100">
                <span>Reports filed: {user.complaintsCount}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  {user.badge}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-2 bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Sign In to View Points
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Switcher: Catalog vs My Vouchers */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewTab === 'catalog'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Available Rewards ({vouchers.length})</span>
          </button>

          <button
            onClick={() => setViewTab('my_vouchers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewTab === 'my_vouchers'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Ticket className="w-4 h-4 text-blue-500" />
            <span>My Redeemed Vouchers ({myRedemptions.length})</span>
          </button>
        </div>

        <button
          onClick={() => setActiveTab('report')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Earn +50 Points Now</span>
        </button>
      </div>

      {/* Error Alert if points insufficient */}
      {redeemError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{redeemError}</span>
          </div>
          <button
            onClick={() => setActiveTab('report')}
            className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition cursor-pointer shrink-0"
          >
            Report Issue (+50 Pts)
          </button>
        </div>
      )}

      {/* VIEW TAB 1: AVAILABLE REWARDS CATALOG */}
      {viewTab === 'catalog' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? 'All Rewards' : cat}
              </button>
            ))}
          </div>

          {/* Vouchers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredVouchers.map((voucher) => {
              const canAfford = user && user.points >= voucher.pointsCost;
              const isRedeeming = redeemingId === voucher.id;

              return (
                <div
                  key={voucher.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Banner */}
                    <div className={`p-5 bg-gradient-to-br ${voucher.bannerGradient} text-white relative`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
                          {getIcon(voucher.iconName)}
                        </div>
                        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase text-white">
                          {voucher.category}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base leading-snug line-clamp-2">
                        {voucher.title}
                      </h3>
                      <div className="text-xs text-white/80 font-medium mt-1">
                        By {voucher.partner}
                      </div>
                    </div>

                    {/* Voucher Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                          {voucher.originalValue}
                        </span>
                        <p className="text-xs text-slate-700 font-medium mt-0.5 line-clamp-2">
                          {voucher.discountDescription}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Cost:</span>
                        <span className="font-black text-sm text-amber-600 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          {voucher.pointsCost} Points
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Redeem Button Footer */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => handleRedeem(voucher)}
                      disabled={isRedeeming}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                          : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
                      }`}
                    >
                      {isRedeeming ? (
                        <span>Processing...</span>
                      ) : canAfford ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Redeem for {voucher.pointsCost} Pts</span>
                        </>
                      ) : (
                        <span>
                          {user ? `Need ${voucher.pointsCost - user.points} More Pts` : `Redeem (${voucher.pointsCost} Pts)`}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW TAB 2: MY REDEEMED VOUCHERS */}
      {viewTab === 'my_vouchers' && (
        <div className="space-y-4">
          {myRedemptions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                You haven't redeemed any vouchers yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Report road potholes, garbage heaps or water leakages to earn points, then spend them here for discounts!
              </p>
              <button
                onClick={() => setViewTab('catalog')}
                className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 transition cursor-pointer"
              >
                Browse Rewards Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRedemptions.map((red) => (
                <div
                  key={red.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {red.partner}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">
                        {red.voucherTitle}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      -{red.pointsSpent} Pts
                    </span>
                  </div>

                  {/* Coupon Code Box */}
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Voucher Redemption Code
                      </span>
                      <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                        {red.code}
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(red.code)}
                      className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer"
                      title="Copy Voucher Code"
                    >
                      {copiedCode === red.code ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expiration & Timestamp */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Expires: {new Date(red.expiresAt).toLocaleDateString()}
                    </span>
                    <span className="text-emerald-600 font-semibold">Active Voucher</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Redemption Success Modal */}
      {redeemSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 text-center space-y-5 border border-slate-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Gift className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Voucher Successfully Redeemed
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {redeemSuccess.voucher.title}
              </h3>
              <p className="text-xs text-slate-500">
                Partner: {redeemSuccess.voucher.partner}
              </p>
            </div>

            {/* Generated Code Display */}
            <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl space-y-2">
              <span className="text-xs text-slate-500 font-medium block">
                Show this digital voucher code at counter or checkout:
              </span>
              <div className="text-xl font-black font-mono text-slate-900 tracking-widest py-1 bg-white rounded-xl border border-slate-200 shadow-inner">
                {redeemSuccess.code}
              </div>
              <button
                onClick={() => copyToClipboard(redeemSuccess.code)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer pt-1"
              >
                {copiedCode === redeemSuccess.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Voucher Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Terms list */}
            <div className="text-left text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 block">Terms & Validity:</span>
              {redeemSuccess.voucher.terms.map((t, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500">•</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setRedeemSuccess(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition"
            >
              Done / Return to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

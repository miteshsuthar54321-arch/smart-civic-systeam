import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  ChevronRight,
  Send,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CivicNotification } from '../types';

export const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    isNotificationOpen, 
    setIsNotificationOpen, 
    markNotificationAsRead, 
    clearAllNotifications, 
    enableFCMNotifications, 
    fcmEnabled,
    setSelectedComplaintId,
    setActiveTab
  } = useApp();

  const [enablingFCM, setEnablingFCM] = useState(false);
  const [fcmMsg, setFcmMsg] = useState<string | null>(null);

  if (!isNotificationOpen) return null;

  const handleEnableFCM = async () => {
    setEnablingFCM(true);
    setFcmMsg(null);
    const res = await enableFCMNotifications();
    setEnablingFCM(false);
    if (res.success) {
      setFcmMsg('Push alerts enabled! You will now receive alerts even when your browser is in background.');
    } else {
      setFcmMsg(res.error || 'Could not enable browser push notifications.');
    }
  };

  const handleNotificationClick = (notif: CivicNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.complaintId) {
      setSelectedComplaintId(notif.complaintId);
      setActiveTab('map');
      setIsNotificationOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                Civic Status Alerts
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500 text-white text-[11px] font-bold rounded-full">
                    {unreadNotificationsCount} new
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">
                Real-time updates on your reported civic complaints
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNotificationOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FCM Push Notification Permission Card */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Firebase Cloud Messaging (FCM)
              </span>
              <p className="text-[11px] text-blue-700 leading-tight">
                {fcmEnabled 
                  ? 'Active: You will receive real-time push alerts when authorities update your complaint.'
                  : 'Enable browser push notifications to get alerted instantly when complaint status changes.'
                }
              </p>
            </div>

            {!fcmEnabled ? (
              <button
                onClick={handleEnableFCM}
                disabled={enablingFCM}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {enablingFCM ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Turn On'}
              </button>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1 shrink-0">
                <Check className="w-3 h-3" /> Active
              </span>
            )}
          </div>

          {fcmMsg && (
            <div className="mt-2 text-[11px] p-2 rounded-lg bg-white/80 border border-blue-200 text-blue-900">
              {fcmMsg}
            </div>
          )}
        </div>

        {/* Actions bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{notifications.length} Total Notifications</span>
            <button
              onClick={clearAllNotifications}
              className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer text-xs"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">No Notifications Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                When you report an issue and municipal teams verify or resolve it, you will see real-time alerts here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isResolved = notif.newStatus === 'Resolved';
              const isInProgress = notif.newStatus === 'In Progress';

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-2xl transition cursor-pointer flex items-start gap-3 relative ${
                    notif.read ? 'hover:bg-slate-50 opacity-85' : 'bg-blue-50/50 hover:bg-blue-50'
                  }`}
                >
                  {/* Status Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isResolved 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : isInProgress 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-rose-100 text-rose-700'
                  }`}>
                    {isResolved ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isInProgress ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isResolved 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isInProgress 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-rose-100 text-rose-800'
                      }`}>
                        Status: {notif.newStatus}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                      {notif.complaintTitle}
                    </h4>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.resolutionNote && (
                      <div className="text-[11px] p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-medium">
                        Remarks: {notif.resolutionNote}
                      </div>
                    )}
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export const LiveToastAlert: React.FC = () => {
  const { activeToast, setActiveToast, setSelectedComplaintId, setActiveTab } = useApp();

  if (!activeToast) return null;

  const isResolved = activeToast.newStatus === 'Resolved';
  const isInProgress = activeToast.newStatus === 'In Progress';

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isResolved ? 'bg-emerald-500 text-white' : isInProgress ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {isResolved ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Status Alert
            </span>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <h4 className="text-xs font-bold text-white line-clamp-1">
            {activeToast.complaintTitle}
          </h4>

          <p className="text-[11px] text-slate-300 leading-snug">
            {activeToast.message}
          </p>

          <button
            onClick={() => {
              if (activeToast.complaintId) {
                setSelectedComplaintId(activeToast.complaintId);
                setActiveTab('map');
              }
              setActiveToast(null);
            }}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-bold inline-flex items-center gap-1 pt-1 cursor-pointer"
          >
            <span>View on Live Map</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

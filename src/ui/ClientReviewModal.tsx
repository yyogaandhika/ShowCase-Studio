import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  MessageSquare,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const ClientReviewModal: React.FC = () => {
  const {
    project,
    brandKit,
    isClientReviewModalOpen,
    setClientReviewModalOpen,
    setProjectStatus,
    addRevisionNote,
  } = useStore();

  const [copied, setCopied] = useState(false);
  const [reviewerName, setReviewerName] = useState('Client Reviewer');
  const [revisionText, setRevisionText] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [approvalConfirmed, setApprovalConfirmed] = useState(false);

  if (!isClientReviewModalOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?review=${project.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    addRevisionNote(
      reviewerName || 'Client Stakeholder',
      'approval',
      'Showcase approved! Final visual assets accepted for production release.'
    );
    setApprovalConfirmed(true);
    setTimeout(() => setApprovalConfirmed(false), 2500);
  };

  const handleSubmitRevision = () => {
    if (!revisionText.trim()) return;
    addRevisionNote(
      reviewerName || 'Client Stakeholder',
      'revision',
      revisionText.trim()
    );
    setRevisionText('');
    setIsSubmittingRevision(false);
  };

  const getStatusBadge = () => {
    switch (project.status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'revision_requested':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Revision Requested
          </span>
        );
      case 'in_review':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            In Client Review
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            Draft Stage
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Review Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            {brandKit.agencyLogoUrl ? (
              <img
                src={brandKit.agencyLogoUrl}
                alt="Agency"
                className="h-6 object-contain"
              />
            ) : (
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">
                3D
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-100">
                  {project.name}
                </h2>
                {getStatusBadge()}
              </div>
              <p className="text-[11px] text-zinc-400">
                Prepared by {brandKit.agencyName} for {project.clientName || 'Client'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Client Link</span>
                </>
              )}
            </button>
            <button
              onClick={() => setClientReviewModalOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Status banner */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  Client Approval Workflow Mode
                </p>
                <p className="text-[11px] text-zinc-400">
                  Review the 3D device showcase motion. Once approved, the software
                  house will proceed to final 4K video delivery.
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsSubmittingRevision(!isSubmittingRevision)}
                className="px-3 py-2 rounded-xl border border-rose-500/40 hover:bg-rose-950/30 text-rose-300 text-xs font-semibold transition-all"
              >
                Request Revision
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Showcase</span>
              </button>
            </div>
          </div>

          {/* Feedback Form (when requesting revision) */}
          {isSubmittingRevision && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-rose-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Leave Revision Feedback
                </span>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Rani, Client PM)"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-[11px] text-white w-48 focus:outline-none"
                />
              </div>

              <textarea
                rows={3}
                placeholder="Describe changes needed (e.g. Please swap the backdrop to clean minimal gray, and focus on the transfer action button)..."
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsSubmittingRevision(false)}
                  className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRevision}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Revision Request</span>
                </button>
              </div>
            </div>
          )}

          {/* Approval success notification */}
          {approvalConfirmed && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Showcase approved! Status updated to <strong>Approved</strong>.
              </span>
            </div>
          )}

          {/* Revision & Milestone History */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Review & Milestone History</span>
            </h3>

            {project.revisionHistory?.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs bg-zinc-950/50 rounded-xl border border-zinc-800">
                No client feedback logged yet. Click "Approve Showcase" or
                "Request Revision" above to test the approval pipeline.
              </div>
            ) : (
              <div className="space-y-2">
                {project.revisionHistory?.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border text-xs ${
                      item.type === 'approval'
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {item.author}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            item.type === 'approval'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {item.type === 'approval' ? 'Approved' : 'Revision'}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(item.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-[11px]">
                      {item.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-950/60">
          <span className="text-[11px] text-zinc-500">
            Showcase Studio · Client Review Portal
          </span>
          <button
            onClick={() => setClientReviewModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};

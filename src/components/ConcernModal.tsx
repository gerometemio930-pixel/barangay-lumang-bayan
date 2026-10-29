import React, { useState } from 'react';
import { X, MessageSquare, AlertCircle, Send } from 'lucide-react';
import { User, CommunityConcern } from '../types';

interface ConcernModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSubmitConcern: (concern: CommunityConcern) => void;
}

export const ConcernModal: React.FC<ConcernModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitConcern
}) => {
  const [category, setCategory] = useState<'peace_order' | 'infrastructure' | 'sanitation' | 'inquiry'>('infrastructure');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newConcern: CommunityConcern = {
      id: `con-${Date.now()}`,
      referenceNumber: `CON-2026-${randomSuffix}`,
      residentId: currentUser.id,
      residentName: currentUser.fullName,
      residentPhone: currentUser.phone,
      purok: currentUser.purok,
      category,
      subject: subject.trim(),
      description: description.trim(),
      isUrgent,
      status: 'Under Review',
      createdAt: new Date().toISOString()
    };

    onSubmitConcern(newConcern);
    onClose();
    setSubject('');
    setDescription('');
    setIsUrgent(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ulat sa Barangay / Community Concern</h3>
              <p className="text-xs text-slate-500">Report an issue or submit an inquiry to the Barangay Council</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'infrastructure', label: 'Public Works / Streetlight' },
                { id: 'sanitation', label: 'Sanitation / Garbage' },
                { id: 'peace_order', label: 'Peace & Order / Noise' },
                { id: 'inquiry', label: 'General Inquiry / LGU' }
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id as any)}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                    category === cat.id
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Subject / Topic <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Broken streetlight near Purok 3 waiting shed"
              maxLength={150}
              required
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Detailed Description & Exact Location <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details, landmark, or specific concerns to help the barangay team respond swiftly."
              rows={4}
              maxLength={1000}
              required
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Mark as Urgent?</span>
              <span className="text-slate-500 text-[11px]">For safety hazards or time-critical matters</span>
            </div>
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Check, FileCheck, Upload, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { User, ServiceCatalogItem, ServiceRequest } from '../types';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  services: ServiceCatalogItem[];
  onSubmitRequest: (newRequest: ServiceRequest) => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  services,
  onSubmitRequest
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [purpose, setPurpose] = useState<string>('');
  const [customDetails, setCustomDetails] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({
    'req-1': 'Valid_Government_ID.pdf',
    'req-2': 'Proof_of_Residency.jpg'
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  if (!isOpen) return null;

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleNextStep1 = () => {
    if (!selectedService) return;
    if (!purpose && selectedService.validPurposes.length > 0) {
      setPurpose(selectedService.validPurposes[0]);
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!purpose) return;
    setStep(3);
  };

  const handleSimulateUpload = (reqId: string, reqName: string) => {
    const fakeFileName = `${reqName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_document.pdf`;
    setUploadedFiles((prev) => ({
      ...prev,
      [reqId]: fakeFileName
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !agreeTerms) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refNumber = `LB-2026-${randomSuffix}`;

    const submittedDocs = selectedService.requirements.map((req) => ({
      requirementId: req.id,
      name: req.name,
      fileName: uploadedFiles[req.id] || `${req.name.replace(/\s+/g, '_')}.pdf`,
      status: 'submitted' as const,
      submittedAt: new Date().toISOString()
    }));

    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      referenceNumber: refNumber,
      residentId: currentUser.id,
      residentName: currentUser.fullName,
      residentEmail: currentUser.email,
      residentPhone: currentUser.phone,
      residentAddress: currentUser.address,
      residentPurok: currentUser.purok,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      purpose: purpose || 'Official Civic Requirement',
      customDetails: customDetails.trim() || undefined,
      status: 'Pending',
      fee: selectedService.fee,
      submittedDocuments: submittedDocs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          title: 'Application Submitted Online',
          description: 'Request successfully submitted. Awaiting initial document screening by Barangay Staff.',
          timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          actor: currentUser.fullName
        }
      ]
    };

    onSubmitRequest(newReq);
    onClose();
    // Reset state
    setStep(1);
    setPurpose('');
    setCustomDetails('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Request a Barangay Service</h3>
            <p className="text-xs text-slate-500">Step {step} of 3: {step === 1 ? 'Choose Service' : step === 2 ? 'Applicant Details & Purpose' : 'Attach Requirements'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-blue-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Modal Form Content */}
        <div className="p-6">
          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Select Service
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {services.map((item) => {
                  const isSelected = selectedServiceId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedServiceId(item.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-blue-700">{item.code}</span>
                        <span className="text-xs font-semibold text-slate-500">{item.category}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                      <div className="mt-2 text-[10px] text-slate-400 font-medium">
                        Turnaround: {item.processingDays} {item.processingDays === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedService && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800 mb-1">Requirements for {selectedService.name}:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {selectedService.requirements.map((req) => (
                      <li key={req.id}>
                        {req.name} {req.isMandatory ? <span className="text-rose-500 font-bold">*</span> : '(Optional)'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  Proceed to Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: APPLICANT DETAILS & PURPOSE */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Applying for:</span>
                  <p className="font-bold text-blue-900 text-sm">{selectedService?.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Processing Time:</span>
                  <p className="font-bold text-slate-800">{selectedService?.processingDays} {selectedService?.processingDays === 1 ? 'business day' : 'business days'}</p>
                </div>
              </div>

              {/* Pre-filled Resident Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Resident Profile (Auto-filled)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">Full Name:</span>
                    <span className="font-semibold text-slate-800">{currentUser.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Registered Address:</span>
                    <span className="font-semibold text-slate-800">{currentUser.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Contact Mobile:</span>
                    <span className="font-semibold text-slate-800 font-mono">{currentUser.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Voter Status:</span>
                    <span className="font-semibold text-emerald-700">{currentUser.voterStatus}</span>
                  </div>
                </div>
              </div>

              {/* Purpose Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Specific Purpose of Request <span className="text-rose-500">*</span>
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                >
                  <option value="">Select a purpose...</option>
                  {selectedService?.validPurposes.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))}
                  <option value="Other Official Purpose">Other Official Purpose (specify below)</option>
                </select>
              </div>

              {/* Custom Details / Additional Information */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Additional Notes or Employer/Institution Details (Optional)
                </label>
                <textarea
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  placeholder="e.g. For employment at San Jose Mega Mart, or for Landbank scholarship grant requirement."
                  rows={3}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep2}
                  disabled={!purpose}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  Proceed to Requirements
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ATTACH REQUIREMENTS */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                Please attach or verify the required supporting documents for faster processing by the Barangay Secretary.
              </p>

              <div className="space-y-3">
                {selectedService?.requirements.map((req) => {
                  const hasFile = Boolean(uploadedFiles[req.id]);
                  return (
                    <div
                      key={req.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{req.name}</span>
                          {req.isMandatory && (
                            <span className="text-[10px] text-rose-600 font-semibold">(Mandatory)</span>
                          )}
                        </div>
                        {req.notes && <p className="text-[11px] text-slate-500 mt-0.5">{req.notes}</p>}
                        {hasFile && (
                          <p className="text-[10px] text-emerald-700 font-mono mt-1 flex items-center gap-1">
                            <FileCheck className="w-3 h-3" /> Attached: {uploadedFiles[req.id]}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSimulateUpload(req.id, req.name)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1 transition-colors shrink-0 ${
                          hasFile
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {hasFile ? 'Replace File' : 'Attach File'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Undertaking Checkbox */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span>
                    I hereby declare that all information provided is true and correct, and I am aware that any false representation is punishable by law and grounds for document revocation.
                  </span>
                </label>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!agreeTerms}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Submit Official Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, Download } from 'lucide-react';
import { ServiceRequest } from '../types';
import { BARANGAY_SEAL_URL, OFFICIAL_INFO } from '../data/mockData';

interface CertificateModalProps {
  request: ServiceRequest | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ request, onClose }) => {
  if (!request) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const certNumber = request.certificateNumber || `CERT-${request.referenceNumber.replace('LB-', '')}`;
  const orNumber = request.orNumber || 'EXEMPTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Action Header - Hidden during print */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-600 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base">Official Barangay Document Preview</h3>
              <p className="text-xs text-slate-300">
                Ref: <span className="font-mono text-amber-400">{request.referenceNumber}</span> · Ready for official printing and release
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Certificate
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Surface */}
        <div id="printable-certificate" className="p-8 md:p-12 bg-white text-slate-900 relative">
          {/* Subtle Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <img
              src={BARANGAY_SEAL_URL}
              alt="Barangay Seal Watermark"
              className="w-[500px] h-[500px] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Official Document Header */}
          <div className="relative flex items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
            <div className="w-24 h-24 shrink-0 flex items-center justify-center">
              <img
                src={BARANGAY_SEAL_URL}
                alt="Official Seal of Barangay Lumang Bayan"
                className="w-24 h-24 object-contain rounded-full shadow-sm"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="text-center flex-1">
              <p className="text-xs font-semibold tracking-wider text-slate-600 uppercase">Republic of the Philippines</p>
              <p className="text-xs font-semibold tracking-wider text-slate-600 uppercase">{OFFICIAL_INFO.province}</p>
              <p className="text-xs font-semibold tracking-wider text-slate-600 uppercase">{OFFICIAL_INFO.municipality}</p>
              <h2 className="text-xl font-extrabold text-blue-900 uppercase tracking-wide mt-1">
                {OFFICIAL_INFO.barangay}
              </h2>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mt-0.5">
                Tanggapan ng Punong Barangay / Office of the Barangay Captain
              </p>
            </div>

            <div className="w-24 h-24 shrink-0 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded p-1 text-center bg-slate-50">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Doc Stamp</span>
              <span className="text-[10px] font-mono font-bold text-slate-700">OFFICIAL</span>
              <span className="text-[8px] text-slate-400">LGU Series</span>
            </div>
          </div>

          {/* Document Content Split: Sidebar with Officials + Main Body */}
          <div className="grid grid-cols-12 gap-8 mt-8">
            {/* Left Column: Sangguniang Barangay Roster */}
            <div className="col-span-4 border-r border-slate-200 pr-6 text-xs space-y-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">Sangguniang Barangay</p>
                <p className="text-[10px] text-slate-500">2023–2028 Officials</p>
              </div>

              <div>
                <p className="font-bold text-slate-900 uppercase">{OFFICIAL_INFO.captain}</p>
                <p className="text-[10px] text-blue-800 font-semibold">Punong Barangay</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider border-b border-slate-100 pb-1">
                  Barangay Kagawad
                </p>
                {OFFICIAL_INFO.kagawadList.map((official, idx) => (
                  <div key={idx} className="leading-tight">
                    <p className="text-[11px] font-medium text-slate-800">{official.split(' (')[0]}</p>
                    <p className="text-[9px] text-slate-500">{official.split(' (')[1]?.replace(')', '')}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div>
                  <p className="font-bold text-slate-900 uppercase text-[11px]">{OFFICIAL_INFO.secretary}</p>
                  <p className="text-[10px] text-slate-600">Barangay Secretary</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 uppercase text-[11px]">{OFFICIAL_INFO.treasurer}</p>
                  <p className="text-[10px] text-slate-600">Barangay Treasurer</p>
                </div>
              </div>

              {/* QR Verification Badge */}
              <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="w-16 h-16 mx-auto bg-slate-900 rounded p-1 flex items-center justify-center text-white text-[9px] font-mono leading-none tracking-tighter">
                  QR-VERIFIED<br />{certNumber.substring(0, 8)}
                </div>
                <p className="text-[9px] text-slate-600 font-mono mt-1 font-semibold">REF: {request.referenceNumber}</p>
                <p className="text-[8px] text-slate-400">Scan to verify authenticity</p>
              </div>
            </div>

            {/* Right Column: Formal Certificate Text */}
            <div className="col-span-8 pl-2 flex flex-col justify-between">
              <div>
                {/* Certificate Title */}
                <div className="text-center my-4">
                  <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900 border-b-2 border-blue-900 inline-block pb-1">
                    {request.serviceName.toUpperCase()}
                  </h1>
                </div>

                {/* Salutation */}
                <p className="font-bold text-slate-800 text-sm mb-4">TO WHOM IT MAY CONCERN:</p>

                {/* Body Text based on service */}
                <div className="text-justify text-xs md:text-sm leading-relaxed text-slate-800 space-y-4 font-serif">
                  <p>
                    This is to certify that <span className="font-bold font-sans underline">{request.residentName.toUpperCase()}</span>, 
                    of legal age, Filipino citizen, is a bonafide resident of <span className="font-semibold font-sans">{request.residentAddress}</span>, 
                    Barangay Lumang Bayan, Municipality of Abra de Ilog, Province of Occidental Mindoro.
                  </p>

                  <p>
                    Records in this office show that the above-named person has been residing in this community with good moral character, 
                    is a law-abiding citizen with a peaceful reputation, and has <span className="font-bold">NO DEROGATORY RECORD</span> or 
                    pending administrative case filed against them before the Lupong Tagapamayapa of this Barangay.
                  </p>

                  <p>
                    This certification is being issued upon the request of the interested party for the purpose of:{' '}
                    <span className="font-bold font-sans bg-amber-50 px-1 py-0.5 border-b border-amber-300">
                      {request.purpose.toUpperCase()}
                    </span>
                    {request.customDetails ? ` (${request.customDetails})` : ''}, and for whatever legal intents it may serve best.
                  </p>

                  <p>
                    Issued this <span className="font-bold font-sans">{formattedDate}</span> at the Barangay Hall of 
                    Lumang Bayan, Abra de Ilog, Occidental Mindoro, Philippines.
                  </p>
                </div>
              </div>

              {/* Signature & Seal Block */}
              <div className="mt-8 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4 items-end">
                  {/* Left: Applicant & Secretary certification */}
                  <div className="space-y-6">
                    <div>
                      <div className="w-32 h-10 border-b border-slate-400 mb-1"></div>
                      <p className="text-[11px] font-bold text-slate-800 uppercase">{request.residentName}</p>
                      <p className="text-[10px] text-slate-500">Applicant / Resident Signature</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Attested By:</p>
                      <p className="text-[11px] font-bold text-slate-800 uppercase mt-2">{OFFICIAL_INFO.secretary}</p>
                      <p className="text-[10px] text-slate-500">Barangay Secretary</p>
                    </div>
                  </div>

                  {/* Right: Punong Barangay Official Approval */}
                  <div className="text-right space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Approved and Issued By:</p>
                    
                    {/* Simulated Digital Signature for Prototype */}
                    <div className="h-12 flex items-center justify-end">
                      <span className="font-serif italic text-blue-900 font-bold text-base tracking-wide opacity-80 border-b border-dashed border-blue-400 px-3 py-1 bg-blue-50/50 rounded">
                        [DIGITAL SIGNATURE / PROTOTYPE]
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <p className="text-xs font-black text-slate-900 uppercase">{OFFICIAL_INFO.captain}</p>
                      <p className="text-[10px] font-semibold text-blue-900">Punong Barangay</p>
                    </div>
                  </div>
                </div>

                {/* Prototype Notice Strip */}
                <div className="mt-4 p-2 bg-slate-100 rounded text-center text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  *** SAMPLE PROTOTYPE DOCUMENT — FOR SYSTEM DEMONSTRATION ONLY ***
                </div>

                 {/* Footer Metadata */}
                <div className="mt-6 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Control No: <strong>{certNumber}</strong></span>
                  <span>OR No: <strong>{orNumber}</strong></span>
                  <span>Doc Fee: <strong>Official / Assessed</strong></span>
                  <span>Valid for 6 Months</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions - Hidden during print */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Official E-Document of Barangay Lumang Bayan. Present original paper or verified reference code upon request.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

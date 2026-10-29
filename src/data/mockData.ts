import { User, ServiceCatalogItem, ServiceRequest, Announcement, CommunityConcern, AuditLogItem } from '../types';

export const BARANGAY_SEAL_URL = '/assets/aistudio/logo_2f79370c.png';

export const OFFICIAL_INFO = {
  barangay: 'Barangay Lumang Bayan',
  municipality: 'Municipality of Abra de Ilog',
  province: 'Province of Occidental Mindoro',
  region: 'MIMAROPA Region (Region IV-B)',
  captain: 'Hon. Punong Barangay',
  secretary: 'Barangay Secretary',
  treasurer: 'Barangay Treasurer',
  officeHours: 'Monday to Friday: 8:00 AM – 5:00 PM',
  contactPhone: '(043) 000-0000 / 0900-000-0000',
  contactEmail: 'barangay.lumangbayan@example.gov.ph',
  hallAddress: 'Barangay Hall, Lumang Bayan, Abra de Ilog, Occidental Mindoro',
  kagawadList: [
    'Barangay Kagawad (Committee on Peace & Order)',
    'Barangay Kagawad (Committee on Health & Sanitation)',
    'Barangay Kagawad (Committee on Public Works)',
    'Barangay Kagawad (Committee on Education & Culture)',
    'Barangay Kagawad (Committee on Agriculture)',
    'Barangay Kagawad (Committee on Budget & Finance)',
    'SK Chairperson (Youth & Sports Development)'
  ]
};

export const GUEST_USER: User = {
  id: 'usr-guest',
  username: '',
  fullName: 'Resident (No Account Yet)',
  email: '',
  role: 'guest',
  phone: '',
  address: '',
  purok: 'Purok 1',
  voterStatus: 'Pending Verification',
  yearsOfResidency: 0
};

export const DEMO_USERS: Record<string, User> = {
  guest: GUEST_USER,
  resident: {
    id: 'usr-res-01',
    username: 'sample_resident',
    fullName: 'Sample Resident (Juan)',
    email: 'resident.juan@example.com',
    role: 'resident',
    phone: '0900-111-2233',
    address: 'House #1, Purok 3 (Sample Address)',
    purok: 'Purok 3',
    voterStatus: 'Registered Voter',
    yearsOfResidency: 10
  },
  resident2: {
    id: 'usr-res-02',
    username: 'sample_resident2',
    fullName: 'Sample Resident (Maria)',
    email: 'resident.maria@example.com',
    role: 'resident',
    phone: '0900-222-3344',
    address: 'Purok 5 (Sample Address)',
    purok: 'Purok 5',
    voterStatus: 'Registered Voter',
    yearsOfResidency: 5
  },
  staff: {
    id: 'usr-stf-01',
    username: 'barangay_staff',
    fullName: 'Barangay Secretary / Staff',
    email: 'secretary@example.gov.ph',
    role: 'staff',
    phone: '0900-333-4455',
    address: 'Barangay Hall Office',
    purok: 'Purok 1',
    voterStatus: 'Registered Voter',
    yearsOfResidency: 15
  },
  captain: {
    id: 'usr-cap-01',
    username: 'punong_barangay',
    fullName: 'Hon. Punong Barangay (Captain)',
    email: 'captain@example.gov.ph',
    role: 'captain',
    phone: '0900-444-5566',
    address: 'Barangay Hall Executive Desk',
    purok: 'Purok 1',
    voterStatus: 'Registered Voter',
    yearsOfResidency: 20
  },
  admin: {
    id: 'usr-adm-01',
    username: 'portal_admin',
    fullName: 'System Administrator',
    email: 'admin@example.gov.ph',
    role: 'admin',
    phone: '0900-555-6677',
    address: 'IT & Records Unit, Barangay Hall',
    purok: 'Purok 1',
    voterStatus: 'Registered Voter',
    yearsOfResidency: 10
  }
};

export const INITIAL_SERVICES: ServiceCatalogItem[] = [
  {
    id: 'svc-clearance',
    code: 'BC-01',
    name: 'Barangay Clearance',
    nameFilipino: 'Barangay Clearance (Pang-hanapbuhay o Transaksyon)',
    category: 'Clearance',
    fee: 0, // 100% Free Public Service
    processingDays: 1,
    description: 'Official clearance certifying applicant has no pending derogatory record in the barangay and is a resident of good standing.',
    descriptionFilipino: 'Katunayan na ang mamamayan ay residente ng barangay na may maayos na pamumuhay at walang kinahaharap na kaso o reklamo sa Lupon.',
    requirements: [
      { id: 'req-1', name: 'Valid Government Issued ID', isMandatory: true, sampleVerified: true, notes: 'UMID, PhilSys National ID, Driver\'s License, Postal ID, or Voter\'s ID' },
      { id: 'req-2', name: 'Proof of Residency / Purok Leader Certification', isMandatory: true, sampleVerified: true, notes: 'Or endorsement from current Purok Leader' },
      { id: 'req-3', name: 'Recent 2x2 colored photo (white background)', isMandatory: true, sampleVerified: true, notes: 'Taken within the last 6 months' },
      { id: 'req-4', name: 'Community Tax Certificate (Cedula)', isMandatory: false, sampleVerified: true, notes: 'Can be processed at Barangay Hall if not yet obtained' }
    ],
    validPurposes: [
      'Local Employment / Job Application',
      'Overseas Employment / POEA Requirements',
      'Bank Account Opening / Loan Application',
      'Postal ID / Passport Application',
      'School Enrollment / Board Examination',
      'Police / NBI Clearance Requirement',
      'Transfer of Residence',
      'Other Official Purpose'
    ],
    isOnlineEnabled: true,
    certificateTitle: 'BARANGAY CLEARANCE'
  },
  {
    id: 'svc-residency',
    code: 'CR-02',
    name: 'Certificate of Residency',
    nameFilipino: 'Katunayan ng Paninirahan (Residency)',
    category: 'Certification',
    fee: 0, // 100% Free Public Service
    processingDays: 1,
    description: 'Certifies that the named individual is a bona fide resident of Barangay Lumang Bayan with a confirmed address and verified length of stay.',
    descriptionFilipino: 'Katunayan na ang naturang mamamayan ay lehitimong naninirahan sa nasasakupan ng Barangay Lumang Bayan.',
    requirements: [
      { id: 'req-1', name: 'Valid ID showing current residential address', isMandatory: true, sampleVerified: true },
      { id: 'req-2', name: 'Barangay Purok Clearance / Endorsement', isMandatory: true, sampleVerified: true },
      { id: 'req-3', name: 'Utility Bill (Electric or Water) or Lease Contract', isMandatory: false, sampleVerified: true }
    ],
    validPurposes: [
      'Proof of Address for Bank / Telco',
      'DepEd / CHED School Enrollment',
      'TIN / SSS / PhilHealth Registration',
      'Comelec Voter Registration Verification',
      'Water / Electricity Connection Application',
      'Court / Legal Hearing Requirement'
    ],
    isOnlineEnabled: true,
    certificateTitle: 'CERTIFICATE OF RESIDENCY'
  },
  {
    id: 'svc-indigency',
    code: 'CI-03',
    name: 'Certificate of Indigency',
    nameFilipino: 'Katunayan ng Pagiging Kapus-palad (Indigency)',
    category: 'Social',
    fee: 0, // Free of charge per civic policy
    processingDays: 1,
    description: 'Certificate issued to low-income families and indigent individuals to facilitate medical, burial, educational, or legal assistance.',
    descriptionFilipino: 'Sertipikasyon para sa mga kapus-palad na residente upang makakuha ng tulong medikal, pinansyal, o scholarship sa pamahalaan.',
    requirements: [
      { id: 'req-1', name: 'Valid ID of Applicant or Authorized Representative', isMandatory: true, sampleVerified: true },
      { id: 'req-2', name: 'Purok Leader Endorsement / MSWDO Referral', isMandatory: true, sampleVerified: true },
      { id: 'req-3', name: 'Medical Abstract / Hospital Bill / Death Certificate (if for assistance)', isMandatory: false, sampleVerified: true }
    ],
    validPurposes: [
      'Medical Assistance (Malasakit Center / DOH / PCSO)',
      'Hospital Bill Discount / PhilHealth Indigent Program',
      'Educational Assistance / LGU Scholarship',
      'DSWD Assistance to Individuals in Crisis (AICS)',
      'Public Attorney\'s Office (PAO) Free Legal Aid',
      'Burial / Funeral Financial Assistance'
    ],
    isOnlineEnabled: true,
    certificateTitle: 'CERTIFICATE OF INDIGENCY'
  },
  {
    id: 'svc-jobseeker',
    code: 'FTJ-04',
    name: 'First Time Jobseeker Certificate (RA 11261)',
    nameFilipino: 'Katunayan para sa Unang Paghahanap ng Trabaho',
    category: 'Certification',
    fee: 0,
    processingDays: 1,
    description: 'Issued in compliance with Republic Act No. 11261 (First Time Jobseekers Assistance Act), waiving government fees for first-time job applicants.',
    descriptionFilipino: 'Alinsunod sa RA 11261, ipinagkakaloob sa mga bagong tapos sa pag-aaral o unang beses maghahanap ng trabaho.',
    requirements: [
      { id: 'req-1', name: 'Barangay Oath of Undertaking (signed at office or digital)', isMandatory: true, sampleVerified: true },
      { id: 'req-2', name: 'Valid School ID, Transcript of Records, or Diploma', isMandatory: true, sampleVerified: true },
      { id: 'req-3', name: 'Birth Certificate (PSA copy)', isMandatory: true, sampleVerified: true }
    ],
    validPurposes: [
      'First Time Job Application / Pre-employment clearances',
      'Waiving of NBI / Police Clearance / Cedula Fees',
      'Civil Service Examination Requirement'
    ],
    isOnlineEnabled: true,
    certificateTitle: 'FIRST TIME JOBSEEKER CERTIFICATE'
  },
  {
    id: 'svc-business',
    code: 'BC-05',
    name: 'Barangay Business Clearance',
    nameFilipino: 'Barangay Business Clearance (Permiso sa Negosyo)',
    category: 'Permit',
    fee: 0, // 100% Free Public Service
    processingDays: 2,
    description: 'Required clearance for establishing or renewing a commercial enterprise, store, micro-business, or establishment within barangay territory.',
    descriptionFilipino: 'Kinakailangang pahintulot mula sa barangay bago makakuha ng Mayor\'s Permit o makapagpatakbo ng negosyo o tindahan.',
    requirements: [
      { id: 'req-1', name: 'DTI Business Name Registration or SEC Registration', isMandatory: true, sampleVerified: true },
      { id: 'req-2', name: 'Contract of Lease or Proof of Property Ownership', isMandatory: true, sampleVerified: true },
      { id: 'req-3', name: 'Location Sketch / Storefront Photo', isMandatory: true, sampleVerified: true },
      { id: 'req-4', name: 'Barangay Clearance of Business Owner', isMandatory: true, sampleVerified: true }
    ],
    validPurposes: [
      'New Business Permit Application (Mayor\'s Permit)',
      'Annual Business Permit Renewal',
      'Sari-Sari Store / Small Retail Operation',
      'Food Stall / Carinderia Operation'
    ],
    isOnlineEnabled: true,
    certificateTitle: 'BARANGAY BUSINESS CLEARANCE'
  },
  {
    id: 'svc-barangay-id',
    code: 'BID-06',
    name: 'Barangay Resident ID Card',
    nameFilipino: 'Barangay Resident Identification Card',
    category: 'ID',
    fee: 0, // 100% Free Public Service
    processingDays: 2,
    description: 'Official laminated plastic ID card with photo, resident number, QR code verification, and emergency contact details.',
    descriptionFilipino: 'Opisyal na identification card ng residente na may litrato at QR code na magagamit sa iba\'t ibang transaksyon sa barangay at bayan.',
    requirements: [
      { id: 'req-1', name: 'Proof of Residency (6 months minimum stay in Lumang Bayan)', isMandatory: true, sampleVerified: true },
      { id: 'req-2', name: 'Birth Certificate or any valid photo ID', isMandatory: true, sampleVerified: true },
      { id: 'req-3', name: 'Emergency contact person details and phone number', isMandatory: true, sampleVerified: true }
    ],
    validPurposes: [
      'Barangay Resident Identification',
      'Emergency Preparedness Identification',
      'Secondary ID for Financial & Civic Services'
    ],
    isOnlineEnabled: true,
    certificateTitle: 'BARANGAY RESIDENT ID'
  },
  {
    id: 'svc-good-moral',
    code: 'GM-07',
    name: 'Certificate of Good Moral Character',
    nameFilipino: 'Katunayan ng Mabuting Asal at Pag-uugali',
    category: 'Certification',
    fee: 0, // 100% Free Public Service
    processingDays: 1,
    description: 'Attests to the applicant\'s good reputation, peaceful conduct, and upright standing in the community with no Lupon tagapamayapa complaint.',
    descriptionFilipino: 'Patunay na ang mamamayan ay nagpapakita ng mabuting kaasalan, sumusunod sa mga batas at ordinansa ng komunidad.',
    requirements: [
      { id: 'req-1', name: 'Valid Government Issued ID', isMandatory: true, sampleVerified: true },
      { id: 'req-2', name: 'Purok Leader Clearance / Recommendation', isMandatory: true, sampleVerified: true }
    ],
    validPurposes: [
      'Scholarship Application Requirement',
      'Law School or Graduate Studies Admission',
      'Firearm License Application',
      'Adoption or Legal Guardianship'
    ],
    isOnlineEnabled: true,
    certificateTitle: 'CERTIFICATE OF GOOD MORAL CHARACTER'
  },
  {
    id: 'svc-cedula',
    code: 'CTC-08',
    name: 'Cedula / Community Tax Certificate Endorsement',
    nameFilipino: 'Endorsement sa Pagkuha ng Sedula (CTC)',
    category: 'Certification',
    fee: 0, // 100% Free Public Service
    processingDays: 1,
    description: 'Pre-computation and official endorsement for issuance of Community Tax Certificate at the Barangay Hall or Municipal Treasury.',
    descriptionFilipino: 'Pagtatala ng impormasyon para sa pagkuha ng sedula batay sa kinikita o pamumuhay.',
    requirements: [
      { id: 'req-1', name: 'Valid ID showing Birth Date and TIN (if available)', isMandatory: true, sampleVerified: true },
      { id: 'req-2', name: 'Proof of Gross Annual Income / Payslip (optional)', isMandatory: false, sampleVerified: true }
    ],
    validPurposes: [
      'Notarial Document Requirement',
      'Sale / Deed of Conveyance',
      'Passport / PRC Renewal',
      'Government Transaction Requirement'
    ],
    isOnlineEnabled: true,
    certificateTitle: 'CEDULA ASSESSMENT ENDORSEMENT'
  }
];

export const INITIAL_REQUESTS: ServiceRequest[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Medical at Dental Mission sa Barangay Covered Court',
    body: 'Inaanyayahan ang lahat ng mamamayan ng Barangay Lumang Bayan sa darating na Sabado, 8:00 AM hanggang 3:00 PM para sa Konsultasyon, Bunot ng Ngipin, Pamamahagi ng Gamot at Bitamina, at BP Checkup. Mangyaring magdala ng valid ID.',
    category: 'health',
    isPinned: true,
    author: 'Barangay Health Committee',
    authorRole: 'Committee on Health',
    createdAt: '2026-10-28T08:00:00Z'
  },
  {
    id: 'ann-2',
    title: 'Iskedyul ng Payout: Social Pension para sa Indigent Senior Citizens',
    body: 'Para sa kaalaman ng ating mga nakatatanda, ang pamamahagi ng Social Pension mula sa DSWD/MSWDO ay gaganapin sa Barangay Session Hall simula 9:00 AM. Magdala ng Senior Citizen ID (OSCA) at photocopy nito.',
    category: 'program',
    isPinned: true,
    author: 'Barangay Secretary',
    authorRole: 'Barangay Secretariat',
    createdAt: '2026-10-27T10:00:00Z'
  },
  {
    id: 'ann-3',
    title: 'Barangay-wide Clean-up Drive at Anti-Dengue Operation (Tapat Ko, Linis Ko)',
    body: 'Magsasagawa ng sabay-sabay na clean-up drive ang lahat ng purok ngayong darating na Linggo, 6:00 AM. Pakiusap na itapon ang mga stagnant water sa gulong, paso, at lata upang maiwasan ang lamok na nagdadala ng Dengue.',
    category: 'advisory',
    isPinned: false,
    author: 'Punong Barangay Office',
    authorRole: 'Executive Office',
    createdAt: '2026-10-25T14:30:00Z'
  },
  {
    id: 'ann-4',
    title: 'Paalala ukol sa Bagong Online Services Portal ng Barangay',
    body: 'Maaari na pong mag-request ng Barangay Clearance, Certificate of Residency, Indigency, at Business Clearance gamit ang prototype portal na ito. Mag-apply online at sundan ang status ng inyong dokumento.',
    category: 'advisory',
    isPinned: false,
    author: 'Portal Administrator',
    authorRole: 'System Administrator',
    createdAt: '2026-10-24T09:00:00Z'
  }
];

export const INITIAL_CONCERNS: CommunityConcern[] = [
  {
    id: 'con-1',
    referenceNumber: 'CON-2026-0042',
    residentId: 'usr-res-01',
    residentName: 'Sample Resident (Juan)',
    residentPhone: '0900-111-2233',
    purok: 'Purok 3',
    category: 'infrastructure',
    subject: 'Pundidong Streetlight sa panulukan ng Purok 3 malapit sa Chapel',
    description: 'Napakadilim po sa bahaging ito tuwing gabi at delikado para sa mga naglalakad na mga taga-purok pauwi galing trabaho. Humihiling po kami ng kapalit na LED bulb.',
    isUrgent: false,
    status: 'Action Taken',
    adminResponse: 'Naka-schedule na po ang maintenance team para palitan ang streetlight bukas ng umaga.',
    createdAt: '2026-10-26T14:00:00Z'
  },
  {
    id: 'con-2',
    referenceNumber: 'CON-2026-0051',
    residentId: 'usr-res-02',
    residentName: 'Sample Resident (Maria)',
    residentPhone: '0900-222-3344',
    purok: 'Purok 5',
    category: 'sanitation',
    subject: 'Hindi nahakot na basura sa kanto ng Riverside Road',
    description: 'May mga nakatambak pong mga basurang naiwan simula pa noong Sabado at pinipitas ng mga ligaw na hayop.',
    isUrgent: true,
    status: 'Resolved',
    adminResponse: 'Nahakot na po ng barangay dump truck kaninang umaga.',
    createdAt: '2026-10-27T08:15:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-01',
    timestamp: '2026-10-29 09:10 AM',
    actorName: 'Barangay Staff',
    actorRole: 'staff',
    action: 'STATUS_UPDATE',
    target: 'LB-2026-0211',
    details: 'Changed status to Processing and scheduled ocular inspection.'
  },
  {
    id: 'aud-02',
    timestamp: '2026-10-28 02:30 PM',
    actorName: 'Hon. Punong Barangay',
    actorRole: 'captain',
    action: 'APPROVE_REQUEST',
    target: 'LB-2026-0189',
    details: 'Approved Barangay Clearance with certificate number BC-2026-0001.'
  },
  {
    id: 'aud-03',
    timestamp: '2026-10-28 08:00 AM',
    actorName: 'Barangay Health Committee',
    actorRole: 'staff',
    action: 'PUBLISH_ANNOUNCEMENT',
    target: 'Free Medical & Dental Mission',
    details: 'Posted public advisory on medical mission at Covered Court.'
  },
  {
    id: 'aud-04',
    timestamp: '2026-10-27 11:15 AM',
    actorName: 'Barangay Secretary',
    actorRole: 'staff',
    action: 'RELEASE_DOCUMENT',
    target: 'LB-2026-0218',
    details: 'Issued official printed Certificate of Residency with OR-009876.'
  }
];

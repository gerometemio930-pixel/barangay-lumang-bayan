import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { DatabaseSync } from 'node:sqlite';

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.env.PORTAL_DATA_DIR || './data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'portal.db');
const db = new DatabaseSync(DB_PATH);

// Helper for secure password hashing
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

// Initialize SQLite Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    purok TEXT,
    voter_status TEXT DEFAULT 'Registered Voter',
    years_of_residency INTEGER DEFAULT 3,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    name_filipino TEXT NOT NULL,
    category TEXT NOT NULL,
    fee REAL DEFAULT 0,
    processing_days INTEGER DEFAULT 1,
    description TEXT,
    description_filipino TEXT,
    requirements_json TEXT NOT NULL,
    valid_purposes_json TEXT NOT NULL,
    is_online_enabled INTEGER DEFAULT 1,
    certificate_title TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    reference_number TEXT UNIQUE NOT NULL,
    resident_id TEXT NOT NULL,
    resident_name TEXT NOT NULL,
    resident_email TEXT NOT NULL,
    resident_phone TEXT NOT NULL,
    resident_address TEXT NOT NULL,
    resident_purok TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    purpose TEXT NOT NULL,
    custom_details TEXT,
    status TEXT NOT NULL,
    fee REAL DEFAULT 0,
    or_number TEXT,
    certificate_number TEXT,
    submitted_documents_json TEXT NOT NULL,
    assigned_staff TEXT,
    admin_note TEXT,
    captain_remarks TEXT,
    pickup_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    approved_at TEXT,
    completed_at TEXT,
    timeline_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0,
    author TEXT NOT NULL,
    author_role TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS concerns (
    id TEXT PRIMARY KEY,
    reference_number TEXT UNIQUE NOT NULL,
    resident_id TEXT NOT NULL,
    resident_name TEXT NOT NULL,
    resident_phone TEXT NOT NULL,
    purok TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    is_urgent INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Under Review',
    admin_response TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    details TEXT NOT NULL
  );
`);

// Seed Default Accounts if missing
function seedDatabase() {
  const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const { count } = userCountStmt.get() as { count: number };

  if (count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, username, password_hash, full_name, role, phone, address, purok, voter_status, years_of_residency, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    // Default Authorized Administrator
    insertUser.run(
      'usr-admin-01',
      'admin@lumangbayan.gov.ph',
      'admin',
      hashPassword('AdminPass123!'),
      'System Administrator',
      'admin',
      '0917-888-0001',
      'Barangay Hall Complex, Lumang Bayan',
      'Purok 1',
      'Registered Voter',
      10,
      now
    );

    // Default Barangay Staff
    insertUser.run(
      'usr-staff-01',
      'staff@lumangbayan.gov.ph',
      'staff',
      hashPassword('StaffPass123!'),
      'Barangay Secretary / Staff',
      'staff',
      '0917-888-0002',
      'Office of the Secretary, Lumang Bayan',
      'Purok 2',
      'Registered Voter',
      8,
      now
    );

    // Default Punong Barangay
    insertUser.run(
      'usr-captain-01',
      'captain@lumangbayan.gov.ph',
      'captain',
      hashPassword('CaptainPass123!'),
      'Hon. Punong Barangay (Captain)',
      'captain',
      '0917-888-0003',
      'Executive Office, Barangay Lumang Bayan',
      'Purok 1',
      'Registered Voter',
      15,
      now
    );

    // Default Demo Resident
    insertUser.run(
      'usr-res-01',
      'resident@lumangbayan.gov.ph',
      'resident',
      hashPassword('ResidentPass123!'),
      'Sample Resident (Juan)',
      'resident',
      '0917-111-2233',
      'House #10, Riverside St., Lumang Bayan',
      'Purok 3',
      'Registered Voter',
      5,
      now
    );
  }

  // Seed default service catalog if empty
  const serviceCountStmt = db.prepare('SELECT COUNT(*) as count FROM services');
  const { count: sCount } = serviceCountStmt.get() as { count: number };

  if (sCount === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (id, code, name, name_filipino, category, fee, processing_days, description, description_filipino, requirements_json, valid_purposes_json, is_online_enabled, certificate_title)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultServices = [
      {
        id: 'svc-clearance',
        code: 'BC-01',
        name: 'Barangay Clearance',
        nameFilipino: 'Pagpapatunay ng Malinis na Rekord sa Barangay',
        category: 'Clearance',
        fee: 0,
        processingDays: 1,
        description: 'Official clearance certifying good moral character, residency, and lack of adverse records in the Barangay blotter.',
        descriptionFilipino: 'Opisyal na pagpapatunay na ang mamamayan ay residente at walang anumang nakabinbing kaso o reklamo sa barangay.',
        requirements: [
          { id: 'req-1', name: 'Valid Government Issued ID', isMandatory: true, sampleVerified: true, notes: 'UMID, PhilSys National ID, Driver License, Voters ID' },
          { id: 'req-2', name: 'Proof of Residency / Endorsement', isMandatory: true, sampleVerified: true, notes: 'Purok Leader endorsement or utility bill' },
          { id: 'req-3', name: 'Recent 2x2 ID Photo', isMandatory: true, sampleVerified: true, notes: 'Plain white background' }
        ],
        validPurposes: ['Local Employment', 'Bank Account Opening', 'Postal ID Application', 'Police Clearance Requirement', 'NBI Clearance Requirement', 'Business Requirement', 'Travel / Passport'],
        isOnlineEnabled: 1,
        certificateTitle: 'BARANGAY CLEARANCE'
      },
      {
        id: 'svc-residency',
        code: 'CR-02',
        name: 'Certificate of Residency',
        nameFilipino: 'Katunayan ng Paninirahan sa Barangay',
        category: 'Certification',
        fee: 0,
        processingDays: 1,
        description: 'Certifies that the applicant is a bonafide resident living in the specified Purok and address within Barangay Lumang Bayan.',
        descriptionFilipino: 'Nagpapatunay na ang indibidwal ay lehitimong naninirahan sa nasasakupang purok ng Barangay Lumang Bayan.',
        requirements: [
          { id: 'req-1', name: 'Valid ID with Address or Proof of Billing', isMandatory: true, sampleVerified: true, notes: 'Meralco/Water bill, Lease Contract, or Barangay ID' },
          { id: 'req-2', name: 'Purok Leader Certification / Endorsement', isMandatory: true, sampleVerified: true, notes: 'Signed by Purok Kagawad / Leader' }
        ],
        validPurposes: ['Proof of Address for Bank / Telco', 'School Enrollment', 'Court / Legal Requirement', 'Voter Registration Verification', 'Loan Application Requirement'],
        isOnlineEnabled: 1,
        certificateTitle: 'CERTIFICATE OF RESIDENCY'
      },
      {
        id: 'svc-indigency',
        code: 'CI-03',
        name: 'Certificate of Indigency',
        nameFilipino: 'Katunayan ng Katayuang Kapus-palad para sa Ayuda',
        category: 'Certification',
        fee: 0,
        processingDays: 1,
        description: 'Issued to qualified indigent families requesting financial, medical, funeral, or educational assistance from government agencies.',
        descriptionFilipino: 'Iginagawad sa mga pamilyang nangangailangan ng tulong-pinansyal, medikal, o scholarship mula sa gobyerno.',
        requirements: [
          { id: 'req-1', name: 'Valid ID of Applicant / Representative', isMandatory: true, sampleVerified: true, notes: 'Any valid government-issued ID' },
          { id: 'req-2', name: 'Endorsement from Purok Committee on Social Services', isMandatory: true, sampleVerified: true, notes: 'Assessment of low-income status' },
          { id: 'req-3', name: 'Supporting Document (Medical Bill, Hospital Abstract, etc.)', isMandatory: false, sampleVerified: true, notes: 'Hospital bill, prescription, funeral contract' }
        ],
        validPurposes: ['Medical Assistance (Malasakit Center / DOH / PCSO)', 'Financial Aid (DSWD AICS)', 'Educational Assistance / Scholarship', 'Public Attorney Office (PAO) Free Legal Services', 'Hospital Bill Discount'],
        isOnlineEnabled: 1,
        certificateTitle: 'CERTIFICATE OF INDIGENCY'
      },
      {
        id: 'svc-jobseeker',
        code: 'FTJ-04',
        name: 'First Time Jobseeker Certificate (RA 11261)',
        nameFilipino: 'Sertipikasyon sa ilalim ng First Time Jobseekers Act',
        category: 'Certification',
        fee: 0,
        processingDays: 1,
        description: 'Under Republic Act No. 11261, first-time jobseekers are exempted from fees for government-issued pre-employment documents.',
        descriptionFilipino: 'Alinsunod sa batas, libre ang mga dokumento para sa unang beses na maghahanap ng trabaho.',
        requirements: [
          { id: 'req-1', name: 'Signed Barangay Oath of Undertaking', isMandatory: true, sampleVerified: true, notes: 'Must be accomplished by the jobseeker' },
          { id: 'req-2', name: 'Transcript of Records, Diploma, or Certificate of Graduation', isMandatory: true, sampleVerified: true, notes: 'Proof of educational attainment' },
          { id: 'req-3', name: 'Birth Certificate (PSA copy)', isMandatory: true, sampleVerified: true, notes: 'Copy of PSA birth certificate' }
        ],
        validPurposes: ['Pre-employment Clearance Exemption (Police, NBI, Med Cert, PhilHealth)'],
        isOnlineEnabled: 1,
        certificateTitle: 'FIRST TIME JOBSEEKER CERTIFICATION'
      },
      {
        id: 'svc-business',
        code: 'BC-05',
        name: 'Barangay Business Clearance',
        nameFilipino: 'Pahintulot sa Pagnenegosyo sa Loob ng Barangay',
        category: 'Permit',
        fee: 0,
        processingDays: 2,
        description: 'Requirement for new business permit application or annual renewal with the City/Municipal Business Permits and Licensing Office (BPLO).',
        descriptionFilipino: 'Kailangan para sa pagkuha o pag-renew ng Mayor Permit para sa komersyal na establisyimento.',
        requirements: [
          { id: 'req-1', name: 'DTI Business Name Registration or SEC Certificate', isMandatory: true, sampleVerified: true, notes: 'Official business registration' },
          { id: 'req-2', name: 'Contract of Lease or Land Title', isMandatory: true, sampleVerified: true, notes: 'Proof of occupancy of business location' },
          { id: 'req-3', name: 'Storefront and Establishment Photo with Signage', isMandatory: true, sampleVerified: true, notes: 'Clear image of the business facade' }
        ],
        validPurposes: ['New Business Permit Application (Mayor Permit)', 'Annual Business Permit Renewal', 'BPLO Municipal Assessment'],
        isOnlineEnabled: 1,
        certificateTitle: 'BARANGAY BUSINESS CLEARANCE'
      }
    ];

    for (const svc of defaultServices) {
      insertService.run(
        svc.id,
        svc.code,
        svc.name,
        svc.nameFilipino,
        svc.category,
        svc.fee,
        svc.processingDays,
        svc.description,
        svc.descriptionFilipino,
        JSON.stringify(svc.requirements),
        JSON.stringify(svc.validPurposes),
        svc.isOnlineEnabled,
        svc.certificateTitle
      );
    }
  }

  // Seed default announcements if empty
  const annCountStmt = db.prepare('SELECT COUNT(*) as count FROM announcements');
  const { count: aCount } = annCountStmt.get() as { count: number };

  if (aCount === 0) {
    const insertAnn = db.prepare(`
      INSERT INTO announcements (id, title, body, category, is_pinned, author, author_role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    insertAnn.run(
      'ann-1',
      'Medical at Dental Mission sa Barangay Covered Court',
      'Inaanyayahan ang lahat ng mamamayan ng Barangay Lumang Bayan sa darating na Sabado, 8:00 AM hanggang 3:00 PM para sa Konsultasyon, Bunot ng Ngipin, Pamamahagi ng Gamot at Bitamina, at BP Checkup. Mangyaring magdala ng valid ID.',
      'health',
      1,
      'Barangay Health Committee',
      'Committee on Health',
      now
    );

    insertAnn.run(
      'ann-2',
      'Iskedyul ng Payout: Social Pension para sa Indigent Senior Citizens',
      'Para sa kaalaman ng ating mga nakatatanda, ang pamamahagi ng Social Pension mula sa DSWD/MSWDO ay gaganapin sa Barangay Session Hall simula 9:00 AM. Magdala ng Senior Citizen ID (OSCA) at photocopy nito.',
      'program',
      1,
      'Barangay Secretary',
      'Barangay Secretariat',
      now
    );

    insertAnn.run(
      'ann-3',
      'Paalala ukol sa Bagong Online Services Portal ng Barangay',
      'Maaari na pong mag-request ng Barangay Clearance, Certificate of Residency, Indigency, at Business Clearance gamit ang opisyal na portal na ito. Mag-rehistro at i-track ang status ng inyong dokumento.',
      'advisory',
      0,
      'Portal Administrator',
      'System Administrator',
      now
    );
  }
}

seedDatabase();

// Express Application Setup
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper to log audits
function logAudit(actorName: string, actorRole: string, action: string, target: string, details: string) {
  try {
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (id, timestamp, actor_name, actor_role, action, target, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    insertAudit.run(`aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`, timeStr, actorName, actorRole, action, target, details);
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: 'resident' | 'staff' | 'captain' | 'admin';
    phone: string;
    address: string;
    purok: string;
    voterStatus: string;
    yearsOfResidency: number;
  };
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const token = authHeader.substring(7).trim();
  const sessionStmt = db.prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?');
  const session = sessionStmt.get(token) as { user_id: string; expires_at: string } | undefined;

  if (!session || new Date(session.expires_at) < new Date()) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }

  const userStmt = db.prepare('SELECT id, email, username, full_name, role, phone, address, purok, voter_status, years_of_residency FROM users WHERE id = ?');
  const user = userStmt.get(session.user_id) as any;

  if (!user) {
    res.status(401).json({ error: 'User account not found.' });
    return;
  }

  req.user = {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.full_name,
    role: user.role,
    phone: user.phone,
    address: user.address,
    purok: user.purok,
    voterStatus: user.voter_status,
    yearsOfResidency: user.years_of_residency
  };

  next();
}

function adminOrStaffMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.role !== 'captain')) {
    res.status(403).json({ error: 'Access denied. Authorized barangay personnel only.' });
    return;
  }
  next();
}

// ==========================================
// API ROUTES
// ==========================================

// 1. AUTH ROUTES
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, purok, address, username } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Full name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      res.status(400).json({ error: 'An account with this email address already exists. Please sign in instead.' });
      return;
    }

    const userId = `usr-res-${Date.now()}`;
    const cleanUsername = username?.trim().toLowerCase() || email.split('@')[0];
    const hashedPassword = hashPassword(password);
    const now = new Date().toISOString();

    // STRICT: Public registrations are ALWAYS resident role
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, username, password_hash, full_name, role, phone, address, purok, voter_status, years_of_residency, created_at)
      VALUES (?, ?, ?, ?, ?, 'resident', ?, ?, ?, 'Registered Voter', 3, ?)
    `);

    insertUser.run(
      userId,
      email.toLowerCase().trim(),
      cleanUsername,
      hashedPassword,
      fullName.trim(),
      phone?.trim() || '0900-000-0000',
      address?.trim() || `${purok || 'Purok 1'}, Lumang Bayan`,
      purok || 'Purok 1',
      now
    );

    // Create session token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
      token,
      userId,
      now,
      expiresAt
    );

    const newUser = {
      id: userId,
      email: email.toLowerCase().trim(),
      username: cleanUsername,
      fullName: fullName.trim(),
      role: 'resident' as const,
      phone: phone?.trim() || '0900-000-0000',
      address: address?.trim() || `${purok || 'Purok 1'}, Lumang Bayan`,
      purok: purok || 'Purok 1',
      voterStatus: 'Registered Voter',
      yearsOfResidency: 3
    };

    logAudit(newUser.fullName, 'resident', 'REGISTER', userId, 'Registered new resident account.');
    res.status(201).json({ user: newUser, token });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please check your data and try again.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      res.status(400).json({ error: 'Please enter your email/username and password.' });
      return;
    }

    const cleanIdent = identifier.trim().toLowerCase();
    const user = db.prepare(`
      SELECT id, email, username, password_hash, full_name, role, phone, address, purok, voter_status, years_of_residency
      FROM users
      WHERE LOWER(email) = ? OR LOWER(username) = ?
    `).get(cleanIdent, cleanIdent) as any;

    if (!user) {
      res.status(401).json({ error: 'Account not found. Please check your credentials or register.' });
      return;
    }

    if (!verifyPassword(password, user.password_hash)) {
      res.status(401).json({ error: 'Incorrect password. Please try again or use Forgot Password.' });
      return;
    }

    // Create session token
    const token = randomBytes(32).toString('hex');
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
      token,
      user.id,
      now,
      expiresAt
    );

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      phone: user.phone,
      address: user.address,
      purok: user.purok,
      voterStatus: user.voter_status,
      yearsOfResidency: user.years_of_residency
    };

    logAudit(safeUser.fullName, safeUser.role, 'LOGIN', safeUser.id, `User signed in successfully.`);
    res.json({ user: safeUser, token });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login service encountered an issue. Please try again.' });
  }
});

app.post('/api/auth/logout', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
    if (req.user) {
      logAudit(req.user.fullName, req.user.role, 'LOGOUT', req.user.id, 'User signed out.');
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error during logout.' });
  }
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Please provide your registered email address.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, full_name, email FROM users WHERE LOWER(email) = ?').get(cleanEmail) as any;

    if (!user) {
      res.status(404).json({ error: 'No account registered with this email address.' });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        return;
      }
      const newHash = hashPassword(newPassword);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id);
      logAudit(user.full_name, 'resident', 'PASSWORD_RESET', user.id, 'Password reset successfully.');
      res.json({ success: true, message: 'Ang inyong password ay matagumpay na napalitan! Maaari na kayong mag-sign in.' });
    } else {
      // Verification check: email verified and ready to reset
      res.json({ success: true, verified: true, message: `Account verified for ${user.full_name}. Please enter your new password.` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Password recovery error. Please try again.' });
  }
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

app.put('/api/auth/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, phone, address, purok, voterStatus, yearsOfResidency } = req.body;
    const userId = req.user!.id;

    db.prepare(`
      UPDATE users
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          purok = COALESCE(?, purok),
          voter_status = COALESCE(?, voter_status),
          years_of_residency = COALESCE(?, years_of_residency)
      WHERE id = ?
    `).run(fullName, phone, address, purok, voterStatus, yearsOfResidency, userId);

    const updatedUser = db.prepare('SELECT id, email, username, full_name, role, phone, address, purok, voter_status, years_of_residency FROM users WHERE id = ?').get(userId) as any;

    const safeUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      fullName: updatedUser.full_name,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      purok: updatedUser.purok,
      voterStatus: updatedUser.voter_status,
      yearsOfResidency: updatedUser.years_of_residency
    };

    logAudit(safeUser.fullName, safeUser.role, 'UPDATE_PROFILE', safeUser.id, 'Updated personal resident information.');
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// 2. SERVICES CATALOG ROUTES
app.get('/api/services', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM services ORDER BY code ASC').all() as any[];
    const services = rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      nameFilipino: r.name_filipino,
      category: r.category,
      fee: r.fee,
      processingDays: r.processing_days,
      description: r.description,
      descriptionFilipino: r.description_filipino,
      requirements: JSON.parse(r.requirements_json || '[]'),
      validPurposes: JSON.parse(r.valid_purposes_json || '[]'),
      isOnlineEnabled: r.is_online_enabled === 1,
      certificateTitle: r.certificate_title
    }));
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve service catalog.' });
  }
});

app.put('/api/services/:id', authMiddleware, adminOrStaffMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fee, isOnlineEnabled, requirements } = req.body;

    const current = db.prepare('SELECT id FROM services WHERE id = ?').get(id);
    if (!current) {
      res.status(404).json({ error: 'Service not found.' });
      return;
    }

    if (fee !== undefined) {
      db.prepare('UPDATE services SET fee = ? WHERE id = ?').run(Math.max(0, fee), id);
    }
    if (isOnlineEnabled !== undefined) {
      db.prepare('UPDATE services SET is_online_enabled = ? WHERE id = ?').run(isOnlineEnabled ? 1 : 0, id);
    }
    if (requirements !== undefined) {
      db.prepare('UPDATE services SET requirements_json = ? WHERE id = ?').run(JSON.stringify(requirements), id);
    }

    logAudit(req.user!.fullName, req.user!.role, 'SERVICE_CONFIG', id, 'Updated service configuration/requirements.');
    res.json({ success: true, message: 'Service updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update service.' });
  }
});

// 3. REQUESTS ROUTES
app.get('/api/requests', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    let rows: any[];

    if (user.role === 'resident') {
      // Resident ONLY sees their own requests
      rows = db.prepare('SELECT * FROM requests WHERE resident_id = ? OR LOWER(resident_email) = ? ORDER BY created_at DESC').all(user.id, user.email.toLowerCase()) as any[];
    } else {
      // Staff, Captain, Admin see all requests
      rows = db.prepare('SELECT * FROM requests ORDER BY created_at DESC').all() as any[];
    }

    const requests = rows.map((r) => ({
      id: r.id,
      referenceNumber: r.reference_number,
      residentId: r.resident_id,
      residentName: r.resident_name,
      residentEmail: r.resident_email,
      residentPhone: r.resident_phone,
      residentAddress: r.resident_address,
      residentPurok: r.resident_purok,
      serviceId: r.service_id,
      serviceName: r.service_name,
      purpose: r.purpose,
      customDetails: r.custom_details,
      status: r.status,
      fee: r.fee,
      orNumber: r.or_number,
      certificateNumber: r.certificate_number,
      submittedDocuments: JSON.parse(r.submitted_documents_json || '[]'),
      assignedStaff: r.assigned_staff,
      adminNote: r.admin_note,
      captainRemarks: r.captain_remarks,
      pickupDate: r.pickup_date,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      approvedAt: r.approved_at,
      completedAt: r.completed_at,
      timeline: JSON.parse(r.timeline_json || '[]')
    }));

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve requests.' });
  }
});

app.post('/api/requests', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { serviceId, serviceName, purpose, customDetails, fee, submittedDocuments } = req.body;

    if (!serviceId || !serviceName || !purpose) {
      res.status(400).json({ error: 'Service and purpose are required.' });
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refNumber = `LB-2026-${randomSuffix}`;
    const requestId = `req-${Date.now()}`;
    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const timeline = [
      {
        title: 'Application Submitted Online',
        description: 'Request successfully submitted. Awaiting initial document screening by Barangay Staff.',
        timestamp: `${new Date().toLocaleDateString()} ${timeStr}`,
        actor: user.fullName
      }
    ];

    const insertReq = db.prepare(`
      INSERT INTO requests (
        id, reference_number, resident_id, resident_name, resident_email, resident_phone,
        resident_address, resident_purok, service_id, service_name, purpose, custom_details,
        status, fee, submitted_documents_json, created_at, updated_at, timeline_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?)
    `);

    insertReq.run(
      requestId,
      refNumber,
      user.id,
      user.fullName,
      user.email,
      user.phone,
      user.address,
      user.purok,
      serviceId,
      serviceName,
      purpose,
      customDetails || '',
      fee || 0,
      JSON.stringify(submittedDocuments || []),
      now,
      now,
      JSON.stringify(timeline)
    );

    logAudit(user.fullName, user.role, 'NEW_REQUEST', refNumber, `Submitted ${serviceName} request.`);

    const newRequest = {
      id: requestId,
      referenceNumber: refNumber,
      residentId: user.id,
      residentName: user.fullName,
      residentEmail: user.email,
      residentPhone: user.phone,
      residentAddress: user.address,
      residentPurok: user.purok,
      serviceId,
      serviceName,
      purpose,
      customDetails,
      status: 'Pending',
      fee: fee || 0,
      submittedDocuments: submittedDocuments || [],
      createdAt: now,
      updatedAt: now,
      timeline
    };

    res.status(201).json(newRequest);
  } catch (err: any) {
    console.error('Request creation error:', err);
    res.status(500).json({ error: 'Failed to submit application. Please try again.' });
  }
});

// Update request status (Staff, Captain, Admin)
app.patch('/api/requests/:id/status', authMiddleware, adminOrStaffMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote, captainRemarks, orNumber, pickupDate, certificateNumber } = req.body;

    const reqRow = db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as any;
    if (!reqRow) {
      res.status(404).json({ error: 'Request not found.' });
      return;
    }

    const currentTimeline = JSON.parse(reqRow.timeline_json || '[]');
    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    currentTimeline.push({
      title: `Status: ${status}`,
      description: adminNote || captainRemarks || `Updated by ${req.user!.fullName} (${req.user!.role.toUpperCase()})`,
      timestamp: `${new Date().toLocaleDateString()} ${timeStr}`,
      actor: req.user!.fullName
    });

    const isApproved = status === 'Approved';
    const isCompleted = status === 'Completed';
    const certNum = certificateNumber || (isApproved ? (reqRow.certificate_number || `BC-2026-${Math.floor(1000 + Math.random() * 9000)}`) : reqRow.certificate_number);

    db.prepare(`
      UPDATE requests
      SET status = ?,
          admin_note = COALESCE(?, admin_note),
          captain_remarks = COALESCE(?, captain_remarks),
          or_number = COALESCE(?, or_number),
          pickup_date = COALESCE(?, pickup_date),
          certificate_number = ?,
          updated_at = ?,
          approved_at = CASE WHEN ? THEN ? ELSE approved_at END,
          completed_at = CASE WHEN ? THEN ? ELSE completed_at END,
          timeline_json = ?
      WHERE id = ?
    `).run(
      status,
      adminNote !== undefined ? adminNote : null,
      captainRemarks !== undefined ? captainRemarks : null,
      orNumber !== undefined ? orNumber : null,
      pickupDate !== undefined ? pickupDate : null,
      certNum || null,
      now,
      isApproved ? 1 : 0,
      now,
      isCompleted ? 1 : 0,
      now,
      JSON.stringify(currentTimeline),
      id
    );

    logAudit(req.user!.fullName, req.user!.role, 'STATUS_UPDATE', reqRow.reference_number, `Moved status to ${status}.`);
    res.json({ success: true, message: `Request status updated to ${status}.`, certificateNumber: certNum });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request status.' });
  }
});

// 4. ANNOUNCEMENTS ROUTES
app.get('/api/announcements', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM announcements ORDER BY is_pinned DESC, created_at DESC').all() as any[];
    const announcements = rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      category: r.category,
      isPinned: r.is_pinned === 1,
      author: r.author,
      authorRole: r.author_role,
      createdAt: r.created_at
    }));
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve announcements.' });
  }
});

app.post('/api/announcements', authMiddleware, adminOrStaffMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, body, category } = req.body;
    if (!title || !body) {
      res.status(400).json({ error: 'Title and body are required.' });
      return;
    }

    const annId = `ann-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO announcements (id, title, body, category, is_pinned, author, author_role, created_at)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?)
    `).run(
      annId,
      title.trim(),
      body.trim(),
      category || 'advisory',
      req.user!.fullName,
      req.user!.role === 'admin' ? 'Portal Administrator' : 'Barangay Official',
      now
    );

    logAudit(req.user!.fullName, req.user!.role, 'PUBLISH_ANNOUNCEMENT', annId, `Published: ${title}`);
    res.status(201).json({ id: annId, title, body, category, isPinned: false, author: req.user!.fullName, authorRole: req.user!.role, createdAt: now });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create announcement.' });
  }
});

app.delete('/api/announcements/:id', authMiddleware, adminOrStaffMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
    logAudit(req.user!.fullName, req.user!.role, 'DELETE_ANNOUNCEMENT', id, 'Deleted announcement.');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete announcement.' });
  }
});

app.patch('/api/announcements/:id/pin', authMiddleware, adminOrStaffMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE announcements SET is_pinned = CASE WHEN is_pinned = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle pin.' });
  }
});

// 5. COMMUNITY CONCERNS
app.get('/api/concerns', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    let rows: any[];
    if (user.role === 'resident') {
      rows = db.prepare('SELECT * FROM concerns WHERE resident_id = ? ORDER BY created_at DESC').all(user.id) as any[];
    } else {
      rows = db.prepare('SELECT * FROM concerns ORDER BY created_at DESC').all() as any[];
    }

    const concerns = rows.map((r) => ({
      id: r.id,
      referenceNumber: r.reference_number,
      residentId: r.resident_id,
      residentName: r.resident_name,
      residentPhone: r.resident_phone,
      purok: r.purok,
      category: r.category,
      subject: r.subject,
      description: r.description,
      isUrgent: r.is_urgent === 1,
      status: r.status,
      adminResponse: r.admin_response,
      createdAt: r.created_at
    }));
    res.json(concerns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve concerns.' });
  }
});

app.post('/api/concerns', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { category, subject, description, isUrgent } = req.body;

    if (!subject || !description) {
      res.status(400).json({ error: 'Subject and description are required.' });
      return;
    }

    const conId = `con-${Date.now()}`;
    const refNumber = `CON-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO concerns (id, reference_number, resident_id, resident_name, resident_phone, purok, category, subject, description, is_urgent, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Under Review', ?)
    `).run(
      conId,
      refNumber,
      user.id,
      user.fullName,
      user.phone,
      user.purok,
      category || 'inquiry',
      subject.trim(),
      description.trim(),
      isUrgent ? 1 : 0,
      now
    );

    logAudit(user.fullName, user.role, 'SUBMIT_CONCERN', refNumber, subject);
    res.status(201).json({ id: conId, referenceNumber: refNumber, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit concern.' });
  }
});

// 6. ADMIN RESIDENTS & AUDIT LOGS
app.get('/api/admin/residents', authMiddleware, adminOrStaffMiddleware, (_req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT id, email, username, full_name, role, phone, address, purok, voter_status, years_of_residency, created_at
      FROM users
      WHERE role = 'resident'
      ORDER BY created_at DESC
    `).all() as any[];

    const residents = rows.map((r) => ({
      id: r.id,
      email: r.email,
      username: r.username,
      fullName: r.full_name,
      role: r.role,
      phone: r.phone,
      address: r.address,
      purok: r.purok,
      voterStatus: r.voter_status,
      yearsOfResidency: r.years_of_residency,
      createdAt: r.created_at
    }));
    res.json(residents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve resident accounts.' });
  }
});

app.get('/api/admin/audit-logs', authMiddleware, adminOrStaffMiddleware, (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM audit_logs ORDER BY rowid DESC LIMIT 100').all() as any[];
    const logs = rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      actorName: r.actor_name,
      actorRole: r.actor_role,
      action: r.action,
      target: r.target,
      details: r.details
    }));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
});

// Reference code lookup (Public track)
app.get('/api/track/:ref', (req: Request, res: Response) => {
  try {
    const { ref } = req.params;
    const reqRow = db.prepare('SELECT reference_number, service_name, status, created_at, updated_at, timeline_json, pickup_date, admin_note, certificate_number FROM requests WHERE LOWER(reference_number) = ?').get(ref.toLowerCase().trim()) as any;

    if (!reqRow) {
      res.status(404).json({ error: 'Walang nahanap na aplikasyon sa ibinigay na Reference Number.' });
      return;
    }

    res.json({
      referenceNumber: reqRow.reference_number,
      serviceName: reqRow.service_name,
      status: reqRow.status,
      createdAt: reqRow.created_at,
      updatedAt: reqRow.updated_at,
      pickupDate: reqRow.pickup_date,
      adminNote: reqRow.admin_note,
      certificateNumber: reqRow.certificate_number,
      timeline: JSON.parse(reqRow.timeline_json || '[]')
    });
  } catch (err) {
    res.status(500).json({ error: 'Tracking service error.' });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Barangay Lumang Bayan Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

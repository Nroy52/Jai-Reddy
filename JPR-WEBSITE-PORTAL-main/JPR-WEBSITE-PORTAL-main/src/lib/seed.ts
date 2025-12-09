/**
 * Seed data utilities for Raghava v1.0 CEO OS
 * Provides deterministic dummy data for all features
 */

export type UserRole =
  | 'Super User'
  | 'CEO'
  | 'Director'
  | 'Managing Director'
  | 'Admin'
  | 'Staff'
  | 'IT Team'
  | 'Family and Friends'
  | 'CPDP Manager'
  | 'CPDP TCO'
  | 'CPDP Staff'
  | 'CPDP Patients'
  | 'CPDP Training'
  | 'CPDP Network'
  | 'Guest'
  | 'Manager'
  | 'Consultant'
  | 'Partner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamTag?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  org?: string;
  phone?: string;
  tags: string[];
  notes?: string;
  ftuId?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'Backlog' | 'Doing' | 'Blocked' | 'Done';
  priority: 'Low' | 'Med' | 'High' | 'Critical';
  dueDate?: string;
  assigneeUserId: string;
  createdByUserId: string;
  ftuId?: string;
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  authorUserId: string;
  text: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  title: string;
  participantIds: string[];
  linkedTaskId?: string;
  ftuId?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface VaultItem {
  id: string;
  title: string;
  type: 'doc' | 'note';
  value: string;
  tags: string[];
  ftuId?: string;
  sensitivity: 'Low' | 'Medium' | 'High';
  createdAt: string;
}

export interface PasswordItem {
  id: string;
  title: string;
  username?: string;
  url?: string;
  passwordEnc: string;
  tags: string[];
  ftuId?: string;
  createdAt: string;
}

// Mulberry32 PRNG for deterministic randomness
function mulberry32(seed: number) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Generate deterministic score for FTU code
export function generateTopicScore(ftuCode: string): number {
  const hash = ftuCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rng = mulberry32(hash);
  return Math.floor(rng() * 30) + 70; // 70-100 range
}

// Generate sparkline data (8 points) with trend
export function generateSparklineData(ftuCode: string): number[] {
  const hash = ftuCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rng = mulberry32(hash);
  const baseScore = generateTopicScore(ftuCode);
  const trend = (rng() - 0.5) * 10; // -5 to +5 trend

  const data: number[] = [];
  for (let i = 0; i < 8; i++) {
    const variance = (rng() - 0.5) * 8;
    const value = Math.max(0, Math.min(100, baseScore + (trend * i / 7) + variance));
    data.push(Math.round(value));
  }
  return data;
}

// I❤️CEO v1.2 Framework - Universal Institutional Life Architecture
export const FTU_FRAMEWORK = [
  {
    code: 'F1',
    title: 'Personal & Family Life',
    topics: [
      { code: 'T1', title: 'Self-Discipline & Habits' },
      { code: 'T2', title: 'Family Structure & Traditions' },
      { code: 'T3', title: 'Emotional Intelligence & Communication' },
      { code: 'T4', title: 'Daily Routine & Lifestyle' },
      { code: 'T5', title: 'Parenting & Mentorship' },
      { code: 'T6', title: 'Relationships & Extended Family' },
      { code: 'T7', title: 'Travel & Experiences' },
      { code: 'T8', title: 'Home & Living Environment' },
      { code: 'T9', title: 'Personal Growth & Reflection' },
      { code: 'T10', title: 'Annual Family Planning & Review' },
    ],
  },
  {
    code: 'F2',
    title: 'Health & Fitness',
    topics: [
      { code: 'T1', title: 'Medical Records & Monitoring' },
      { code: 'T2', title: 'Diet & Nutrition' },
      { code: 'T3', title: 'Exercise & Performance Tracking' },
      { code: 'T4', title: 'Sleep & Recovery' },
      { code: 'T5', title: 'Stress Management & Mindfulness' },
      { code: 'T6', title: 'Preventive Health & Screenings' },
      { code: 'T7', title: 'Dental & Aesthetic Care' },
      { code: 'T8', title: 'Biometrics & Wearables Data' },
      { code: 'T9', title: 'Fitness Challenges & Targets' },
      { code: 'T10', title: 'Longevity & Holistic Healing' },
    ],
  },
  {
    code: 'F3',
    title: 'Academics & Research',
    topics: [
      { code: 'T1', title: 'Degrees & Certifications' },
      { code: 'T2', title: 'PhD & Research Projects' },
      { code: 'T3', title: 'Reading Lists & Learning Paths' },
      { code: 'T4', title: 'Publications & Citations' },
      { code: 'T5', title: 'Teaching & Mentoring' },
      { code: 'T6', title: 'R&D Collaborations' },
      { code: 'T7', title: 'Conferences & Presentations' },
      { code: 'T8', title: 'Innovation Grants & Patents' },
      { code: 'T9', title: 'Knowledge Management & Notes' },
      { code: 'T10', title: 'Academic Brand & Recognition' },
    ],
  },
  {
    code: 'F4',
    title: 'Dentistry & Healthcare',
    topics: [
      { code: 'T1', title: 'Clinical Practice Operations' },
      { code: 'T2', title: 'Implants & Surgery Protocols' },
      { code: 'T3', title: 'Laser Dentistry & Photobiomodulation' },
      { code: 'T4', title: 'Same-Day Digital Workflows' },
      { code: 'T5', title: 'Patient Journey & Safety Systems' },
      { code: 'T6', title: 'Team Training & Clinical Education' },
      { code: 'T7', title: 'Research & Outcome Analysis' },
      { code: 'T8', title: 'Regulation, Ethics & Audit' },
      { code: 'T9', title: 'Practice Growth & Marketing' },
      { code: 'T10', title: 'Community Health & Public Awareness' },
    ],
  },
  {
    code: 'F5',
    title: 'Business & Enterprise',
    topics: [
      { code: 'T1', title: 'VGGE Core Operations' },
      { code: 'T2', title: 'Subsidiary Governance & Integration' },
      { code: 'T3', title: 'Leadership Teams & HR Strategy' },
      { code: 'T4', title: 'Strategic Planning & KPIs' },
      { code: 'T5', title: 'Technology & Systems Deployment' },
      { code: 'T6', title: 'Client & Partner Relations' },
      { code: 'T7', title: 'Legal & Compliance Management' },
      { code: 'T8', title: 'Sales, Marketing & CRM' },
      { code: 'T9', title: 'Quality Control & Risk Audits' },
      { code: 'T10', title: 'Global Expansion & Joint Ventures' },
    ],
  },
  {
    code: 'F6',
    title: 'Technology & Innovation',
    topics: [
      { code: 'T1', title: 'I❤️CEO OS Development' },
      { code: 'T2', title: 'AI Assistants & Automation Tools' },
      { code: 'T3', title: 'Hardware & IoT Systems' },
      { code: 'T4', title: 'R&D Labs & Prototype Builds' },
      { code: 'T5', title: 'Data Analytics & Cloud Systems' },
      { code: 'T6', title: 'Cybersecurity & Encryption' },
      { code: 'T7', title: 'Software Platforms & APIs' },
      { code: 'T8', title: 'Product Design & UI/UX' },
      { code: 'T9', title: 'Patents & Intellectual Property' },
      { code: 'T10', title: 'Future Technology Forecasting' },
    ],
  },
  {
    code: 'F7',
    title: 'Wealth & Finance',
    topics: [
      { code: 'T1', title: 'Income Streams & Cashflow' },
      { code: 'T2', title: 'Personal Finance Dashboard' },
      { code: 'T3', title: 'Business Accounts & Audits' },
      { code: 'T4', title: 'Real Estate & Assets' },
      { code: 'T5', title: 'Investments & Portfolios' },
      { code: 'T6', title: 'Tax Strategy & Planning' },
      { code: 'T7', title: 'Trusts & Wealth Protection' },
      { code: 'T8', title: 'Charity Allocations & CSR' },
      { code: 'T9', title: 'Insurance & Risk Coverage' },
      { code: 'T10', title: 'Retirement & Legacy Funds' },
    ],
  },
  {
    code: 'F8',
    title: 'Leadership & Branding',
    topics: [
      { code: 'T1', title: 'Personal Brand Development' },
      { code: 'T2', title: 'Public Speaking & Media Presence' },
      { code: 'T3', title: 'Professional Profile & Awards' },
      { code: 'T4', title: 'Podcast & Video Productions' },
      { code: 'T5', title: 'Social Media Strategy' },
      { code: 'T6', title: 'Networking & Relationship Capital' },
      { code: 'T7', title: 'Writing & Publications' },
      { code: 'T8', title: 'Events & Conferences' },
      { code: 'T9', title: 'Reputation Management' },
      { code: 'T10', title: 'Global Ambassadorship' },
    ],
  },
  {
    code: 'F9',
    title: 'Governance & Security',
    topics: [
      { code: 'T1', title: 'Corporate Governance Framework' },
      { code: 'T2', title: 'Legal Systems & Contracts' },
      { code: 'T3', title: 'Digital Security Protocols' },
      { code: 'T4', title: 'Risk Management & Audits' },
      { code: 'T5', title: 'Trinetra Security Division' },
      { code: 'T6', title: 'Data Privacy & GDPR Compliance' },
      { code: 'T7', title: 'Crisis Management & Emergency SOPs' },
      { code: 'T8', title: 'Diplomatic & Governmental Relations' },
      { code: 'T9', title: 'Travel Security & Global Mobility' },
      { code: 'T10', title: 'Strategic Intelligence & Analysis' },
    ],
  },
  {
    code: 'F10',
    title: 'Philanthropy & Legacy',
    topics: [
      { code: 'T1', title: 'VishwaJīvana Trust Operations' },
      { code: 'T2', title: 'Education & Scholarship Programs' },
      { code: 'T3', title: 'Healthcare Access & Rural Outreach' },
      { code: 'T4', title: 'Environmental & Green Initiatives' },
      { code: 'T5', title: 'Community Development Projects' },
      { code: 'T6', title: 'Religious & Cultural Preservation' },
      { code: 'T7', title: 'Youth Empowerment Programs' },
      { code: 'T8', title: 'Social Enterprise Models' },
      { code: 'T9', title: 'Family Legacy Documentation' },
      { code: 'T10', title: 'Global Humanitarian Partnerships' },
    ],
  },
];

// Generate topic score map
export function generateTopicScoreMap(): Record<string, number> {
  const map: Record<string, number> = {};
  FTU_FRAMEWORK.forEach(focus => {
    focus.topics.forEach(topic => {
      const ftuCode = `${focus.code}.${topic.code}`;
      map[ftuCode] = generateTopicScore(ftuCode);
    });
  });
  return map;
}

// Seed users cleared (no demo accounts pre-loaded)
export const SEED_USERS: User[] = [];

// Seed contacts (30+)
export const SEED_CONTACTS: Contact[] = [
  {
    id: 'c1', name: 'Dr (Maj) Jai Prathap Reddy', email: 'ceo@raghava.ai', role: 'CEO',
    department: 'Executive', org: 'Raghava AI', phone: '+1-555-0001',
    tags: ['Leadership', 'Strategy'], notes: 'Founder and CEO', createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'c2', name: 'Sarah Williams', email: 'director1@raghava.ai', role: 'Director',
    department: 'Clinical', org: 'Raghava AI', phone: '+1-555-0002',
    tags: ['Clinical', 'Healthcare'], ftuId: 'F1.T1.U1', createdAt: '2024-01-16T10:00:00Z'
  },
  {
    id: 'c3', name: 'Michael Chen', email: 'director2@raghava.ai', role: 'Director',
    department: 'Operations', org: 'Raghava AI', phone: '+1-555-0003',
    tags: ['Operations', 'Logistics'], createdAt: '2024-01-17T10:00:00Z'
  },
  {
    id: 'c4', name: 'Jane Admin', email: 'admin@raghava.ai', role: 'Admin',
    department: 'Administration', org: 'Raghava AI', phone: '+1-555-0004',
    tags: ['Admin', 'HR'], createdAt: '2024-01-18T10:00:00Z'
  },
  {
    id: 'c5', name: 'Robert Thompson', email: 'robert.t@advisor.com', role: 'Director',
    department: 'Advisory', org: 'Strategic Partners', phone: '+1-555-1001',
    tags: ['Advisor', 'Finance', 'Strategy'], ftuId: 'F2.T2.U4', createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'c6', name: 'Emily Rodriguez', email: 'emily.r@legal.com', role: 'Director',
    department: 'Legal', org: 'Legal Services Inc', phone: '+1-555-1002',
    tags: ['Legal', 'Compliance'], createdAt: '2024-01-22T10:00:00Z'
  },
  {
    id: 'c7', name: 'James Wilson', email: 'james.w@tech.com', role: 'Staff',
    department: 'Technology', org: 'Tech Innovations', phone: '+1-555-1003',
    tags: ['Technology', 'Software'], createdAt: '2024-01-24T10:00:00Z'
  },
  {
    id: 'c8', name: 'Lisa Anderson', email: 'lisa.a@finance.com', role: 'Admin',
    department: 'Finance', org: 'Financial Partners', phone: '+1-555-1004',
    tags: ['Finance', 'Accounting'], ftuId: 'F2.T1.U2', createdAt: '2024-01-26T10:00:00Z'
  },
  {
    id: 'c9', name: 'Christopher Martin', email: 'chris.m@marketing.com', role: 'Staff',
    department: 'Marketing', org: 'Brand Agency', phone: '+1-555-1005',
    tags: ['Marketing', 'Branding'], createdAt: '2024-01-28T10:00:00Z'
  },
  {
    id: 'c10', name: 'Amanda White', email: 'amanda.w@hr.com', role: 'Admin',
    department: 'HR', org: 'People First', phone: '+1-555-1006',
    tags: ['HR', 'Recruiting'], createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 'c11', name: 'Daniel Harris', email: 'daniel.h@security.com', role: 'Staff',
    department: 'Security', org: 'SecureIT', phone: '+1-555-1007',
    tags: ['Security', 'Cybersecurity'], ftuId: 'F7.T5.U3', createdAt: '2024-02-03T10:00:00Z'
  },
  {
    id: 'c12', name: 'Michelle Taylor', email: 'michelle.t@clinical.com', role: 'Staff',
    department: 'Clinical', org: 'HealthCare Plus', phone: '+1-555-1008',
    tags: ['Clinical', 'Research'], createdAt: '2024-02-05T10:00:00Z'
  },
  {
    id: 'c13', name: 'Kevin Brown', email: 'kevin.b@operations.com', role: 'Staff',
    department: 'Operations', org: 'Ops Excellence', phone: '+1-555-1009',
    tags: ['Operations', 'Process'], createdAt: '2024-02-07T10:00:00Z'
  },
  {
    id: 'c14', name: 'Jessica Davis', email: 'jessica.d@sales.com', role: 'Staff',
    department: 'Sales', org: 'Sales Force', phone: '+1-555-1010',
    tags: ['Sales', 'Business Development'], createdAt: '2024-02-09T10:00:00Z'
  },
  {
    id: 'c15', name: 'Matthew Miller', email: 'matthew.m@product.com', role: 'Admin',
    department: 'Product', org: 'Product Innovators', phone: '+1-555-1011',
    tags: ['Product', 'Innovation'], createdAt: '2024-02-11T10:00:00Z'
  },
  {
    id: 'c16', name: 'Ashley Garcia', email: 'ashley.g@design.com', role: 'Staff',
    department: 'Design', org: 'Creative Studio', phone: '+1-555-1012',
    tags: ['Design', 'UX'], createdAt: '2024-02-13T10:00:00Z'
  },
  {
    id: 'c17', name: 'Brian Martinez', email: 'brian.m@data.com', role: 'Staff',
    department: 'Data', org: 'Data Analytics Co', phone: '+1-555-1013',
    tags: ['Data', 'Analytics'], ftuId: 'F9.T5.U1', createdAt: '2024-02-15T10:00:00Z'
  },
  {
    id: 'c18', name: 'Nicole Lee', email: 'nicole.l@compliance.com', role: 'Admin',
    department: 'Compliance', org: 'Compliance Group', phone: '+1-555-1014',
    tags: ['Compliance', 'Regulatory'], createdAt: '2024-02-17T10:00:00Z'
  },
  {
    id: 'c19', name: 'Ryan Walker', email: 'ryan.w@consulting.com', role: 'Director',
    department: 'Consulting', org: 'Strategy Consultants', phone: '+1-555-1015',
    tags: ['Advisor', 'Strategy'], createdAt: '2024-02-19T10:00:00Z'
  },
  {
    id: 'c20', name: 'Stephanie Hall', email: 'stephanie.h@ventures.com', role: 'Director',
    department: 'Ventures', org: 'Growth Capital', phone: '+1-555-1016',
    tags: ['Finance', 'Ventures'], createdAt: '2024-02-21T10:00:00Z'
  },
  {
    id: 'c21', name: 'Justin Allen', email: 'justin.a@partnerships.com', role: 'Staff',
    department: 'Partnerships', org: 'Alliance Partners', phone: '+1-555-1017',
    tags: ['Partnerships', 'Alliances'], createdAt: '2024-02-23T10:00:00Z'
  },
  {
    id: 'c22', name: 'Rebecca Young', email: 'rebecca.y@training.com', role: 'Staff',
    department: 'Training', org: 'Learning Solutions', phone: '+1-555-1018',
    tags: ['Training', 'Development'], createdAt: '2024-02-25T10:00:00Z'
  },
  {
    id: 'c23', name: 'Gregory King', email: 'gregory.k@research.com', role: 'Staff',
    department: 'Research', org: 'R&D Labs', phone: '+1-555-1019',
    tags: ['Research', 'Science'], createdAt: '2024-02-27T10:00:00Z'
  },
  {
    id: 'c24', name: 'Samantha Wright', email: 'samantha.w@quality.com', role: 'Admin',
    department: 'Quality', org: 'QA Systems', phone: '+1-555-1020',
    tags: ['Quality', 'Assurance'], createdAt: '2024-03-01T10:00:00Z'
  },
  {
    id: 'c25', name: 'Tyler Lopez', email: 'tyler.l@logistics.com', role: 'Staff',
    department: 'Logistics', org: 'Supply Chain Co', phone: '+1-555-1021',
    tags: ['Logistics', 'Supply Chain'], createdAt: '2024-03-03T10:00:00Z'
  },
  {
    id: 'c26', name: 'Victoria Hill', email: 'victoria.h@media.com', role: 'Staff',
    department: 'Media', org: 'Media Relations', phone: '+1-555-1022',
    tags: ['Media', 'PR'], createdAt: '2024-03-05T10:00:00Z'
  },
  {
    id: 'c27', name: 'Brandon Scott', email: 'brandon.s@procurement.com', role: 'Admin',
    department: 'Procurement', org: 'Purchasing Group', phone: '+1-555-1023',
    tags: ['Procurement', 'Sourcing'], createdAt: '2024-03-07T10:00:00Z'
  },
  {
    id: 'c28', name: 'Rachel Green', email: 'rachel.g@sustainability.com', role: 'Staff',
    department: 'Sustainability', org: 'Green Initiatives', phone: '+1-555-1024',
    tags: ['Sustainability', 'Environment'], ftuId: 'F8.T3.U2', createdAt: '2024-03-09T10:00:00Z'
  },
  {
    id: 'c29', name: 'Aaron Adams', email: 'aaron.a@innovation.com', role: 'Director',
    department: 'Innovation', org: 'Future Labs', phone: '+1-555-1025',
    tags: ['Innovation', 'Technology'], createdAt: '2024-03-11T10:00:00Z'
  },
  {
    id: 'c30', name: 'Megan Baker', email: 'megan.b@customer.com', role: 'Staff',
    department: 'Customer Success', org: 'Client Care', phone: '+1-555-1026',
    tags: ['Customer Success', 'Support'], createdAt: '2024-03-13T10:00:00Z'
  },
  {
    id: 'c31', name: 'Jordan Nelson', email: 'jordan.n@platform.com', role: 'Staff',
    department: 'Platform', org: 'Tech Platform', phone: '+1-555-1027',
    tags: ['Technology', 'Platform'], createdAt: '2024-03-15T10:00:00Z'
  },
  {
    id: 'c32', name: 'Taylor Carter', email: 'taylor.c@advisory.com', role: 'Director',
    department: 'Advisory', org: 'Executive Advisors', phone: '+1-555-1028',
    tags: ['Advisor', 'Executive'], ftuId: 'F10.T1.U5', createdAt: '2024-03-17T10:00:00Z'
  }
];

// Seed tasks (40+)
export const SEED_TASKS: Task[] = [
  {
    id: 't1', title: 'Q1 Strategic Review', description: 'Review organizational strategy for Q1',
    status: 'Doing', priority: 'Critical', dueDate: '2024-04-15',
    assigneeUserId: '1', createdByUserId: '1', ftuId: 'F10.T1',
    comments: [{ id: 'tc1', authorUserId: '2', text: 'Started analysis', createdAt: '2024-03-10T10:00:00Z' }],
    createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-10T10:00:00Z'
  },
  {
    id: 't2', title: 'Clinical Protocol Update', description: 'Update clinical protocols for new guidelines',
    status: 'Doing', priority: 'High', dueDate: '2024-04-20',
    assigneeUserId: '2', createdByUserId: '1', ftuId: 'F1.T1',
    comments: [],
    createdAt: '2024-03-02T10:00:00Z', updatedAt: '2024-03-02T10:00:00Z'
  },
  {
    id: 't3', title: 'Ops Process Optimization', description: 'Streamline operational workflows',
    status: 'Backlog', priority: 'Med', dueDate: '2024-05-01',
    assigneeUserId: '3', createdByUserId: '1', ftuId: 'F9.T3',
    comments: [],
    createdAt: '2024-03-03T10:00:00Z', updatedAt: '2024-03-03T10:00:00Z'
  },
  {
    id: 't4', title: 'Staff Training Schedule', description: 'Plan Q2 training sessions',
    status: 'Done', priority: 'Med', dueDate: '2024-03-25',
    assigneeUserId: '4', createdByUserId: '1',
    comments: [{ id: 'tc2', authorUserId: '4', text: 'Completed', createdAt: '2024-03-20T10:00:00Z' }],
    createdAt: '2024-03-04T10:00:00Z', updatedAt: '2024-03-20T10:00:00Z'
  },
  {
    id: 't5', title: 'Patient Data Analysis', description: 'Analyze patient satisfaction metrics',
    status: 'Doing', priority: 'High', dueDate: '2024-04-10',
    assigneeUserId: '5', createdByUserId: '2', ftuId: 'F9.T5',
    comments: [],
    createdAt: '2024-03-05T10:00:00Z', updatedAt: '2024-03-05T10:00:00Z'
  },
  {
    id: 't6', title: 'Supply Chain Review', description: 'Review supplier contracts',
    status: 'Backlog', priority: 'Med', dueDate: '2024-05-15',
    assigneeUserId: '6', createdByUserId: '3',
    comments: [],
    createdAt: '2024-03-06T10:00:00Z', updatedAt: '2024-03-06T10:00:00Z'
  },
  {
    id: 't7', title: 'Financial Report Q1', description: 'Prepare quarterly financial report',
    status: 'Doing', priority: 'Critical', dueDate: '2024-04-05',
    assigneeUserId: '7', createdByUserId: '1', ftuId: 'F2.T1',
    comments: [{ id: 'tc3', authorUserId: '7', text: 'Draft ready', createdAt: '2024-03-15T10:00:00Z' }],
    createdAt: '2024-03-07T10:00:00Z', updatedAt: '2024-03-15T10:00:00Z'
  },
  {
    id: 't8', title: 'IT Security Audit', description: 'Conduct security compliance audit',
    status: 'Blocked', priority: 'High', dueDate: '2024-04-30',
    assigneeUserId: '5', createdByUserId: '4',
    comments: [{ id: 'tc4', authorUserId: '5', text: 'Waiting on vendor', createdAt: '2024-03-12T10:00:00Z' }],
    createdAt: '2024-03-08T10:00:00Z', updatedAt: '2024-03-12T10:00:00Z'
  },
  {
    id: 't9', title: 'Marketing Campaign Launch', description: 'Launch new patient outreach campaign',
    status: 'Done', priority: 'Med', dueDate: '2024-03-20',
    assigneeUserId: '6', createdByUserId: '3',
    comments: [],
    createdAt: '2024-03-09T10:00:00Z', updatedAt: '2024-03-21T10:00:00Z'
  },
  {
    id: 't10', title: 'Equipment Maintenance', description: 'Schedule annual equipment maintenance',
    status: 'Backlog', priority: 'Low', dueDate: '2024-06-01',
    assigneeUserId: '6', createdByUserId: '3',
    comments: [],
    createdAt: '2024-03-10T10:00:00Z', updatedAt: '2024-03-10T10:00:00Z'
  },
  // Add 30 more tasks for comprehensive testing
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `t${11 + i}`,
    title: `Task ${11 + i}: ${['Research', 'Implementation', 'Review', 'Analysis', 'Planning'][i % 5]}`,
    description: `Description for task ${11 + i}`,
    status: (['Backlog', 'Doing', 'Blocked', 'Done'] as const)[i % 4],
    priority: (['Low', 'Med', 'High', 'Critical'] as const)[i % 4],
    dueDate: new Date(2024, 3, 15 + i).toISOString().split('T')[0],
    assigneeUserId: String((i % 7) + 1),
    createdByUserId: String((i % 4) + 1),
    ftuId: i % 3 === 0 ? `F${(i % 10) + 1}.T${(i % 10) + 1}` : undefined,
    comments: i % 5 === 0 ? [{
      id: `tc${11 + i}`,
      authorUserId: String((i % 7) + 1),
      text: `Comment on task ${11 + i}`,
      createdAt: new Date(2024, 2, 15 + i).toISOString()
    }] : [],
    createdAt: new Date(2024, 2, 10 + i).toISOString(),
    updatedAt: new Date(2024, 2, 10 + i).toISOString()
  }))
];

// Seed message threads (12+)
export const SEED_MESSAGES: MessageThread[] = [
  {
    id: 'm1', title: 'Q1 Strategy Discussion', participantIds: ['1', '2', '3'], linkedTaskId: 't1', ftuId: 'F10.T1',
    messages: [
      { id: 'msg1', senderId: '1', text: 'Let\'s discuss our Q1 priorities', timestamp: '2024-03-01T09:00:00Z' },
      { id: 'msg2', senderId: '2', text: 'Clinical focus should be on patient outcomes', timestamp: '2024-03-01T09:15:00Z' },
      { id: 'msg3', senderId: '3', text: 'Agreed. Operations will support that goal', timestamp: '2024-03-01T09:30:00Z' },
    ],
    createdAt: '2024-03-01T09:00:00Z', updatedAt: '2024-03-01T09:30:00Z'
  },
  {
    id: 'm2', title: 'Clinical Team Sync', participantIds: ['2', '5'], linkedTaskId: 't2',
    messages: [
      { id: 'msg4', senderId: '2', text: '@Alex can you review the new protocols?', timestamp: '2024-03-02T10:00:00Z' },
      { id: 'msg5', senderId: '5', text: 'On it! Will have feedback by EOD', timestamp: '2024-03-02T10:30:00Z' },
    ],
    createdAt: '2024-03-02T10:00:00Z', updatedAt: '2024-03-02T10:30:00Z'
  },
  {
    id: 'm3', title: 'Finance Review', participantIds: ['1', '7'], linkedTaskId: 't7', ftuId: 'F2.T1',
    messages: [
      { id: 'msg6', senderId: '1', text: 'How is the Q1 report coming along?', timestamp: '2024-03-07T11:00:00Z' },
      { id: 'msg7', senderId: '7', text: 'Draft is ready for your review', timestamp: '2024-03-07T14:00:00Z' },
    ],
    createdAt: '2024-03-07T11:00:00Z', updatedAt: '2024-03-07T14:00:00Z'
  },
  {
    id: 'm4', title: 'Operations Planning', participantIds: ['3', '6'],
    messages: [
      { id: 'msg8', senderId: '3', text: 'Need to optimize our workflows', timestamp: '2024-03-03T12:00:00Z' },
      { id: 'msg9', senderId: '6', text: 'I have some ideas to share', timestamp: '2024-03-03T13:00:00Z' },
    ],
    createdAt: '2024-03-03T12:00:00Z', updatedAt: '2024-03-03T13:00:00Z'
  },
  {
    id: 'm5', title: 'Admin Updates', participantIds: ['1', '4'],
    messages: [
      { id: 'msg10', senderId: '4', text: 'Training schedule is finalized', timestamp: '2024-03-04T09:00:00Z' },
      { id: 'msg11', senderId: '1', text: 'Great work!', timestamp: '2024-03-04T09:15:00Z' },
    ],
    createdAt: '2024-03-04T09:00:00Z', updatedAt: '2024-03-04T09:15:00Z'
  },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `m${6 + i}`,
    title: `Thread ${6 + i}: ${['Project Update', 'Team Sync', 'Quick Question', 'Follow-up'][i % 4]}`,
    participantIds: [String((i % 7) + 1), String(((i + 1) % 7) + 1)],
    linkedTaskId: i % 3 === 0 ? `t${10 + i}` : undefined,
    ftuId: i % 2 === 0 ? `F${(i % 10) + 1}.T${(i % 5) + 1}` : undefined,
    messages: [
      {
        id: `msg${12 + i * 2}`,
        senderId: String((i % 7) + 1),
        text: `Message ${i + 1} content`,
        timestamp: new Date(2024, 2, 5 + i, 10, 0).toISOString()
      },
      {
        id: `msg${13 + i * 2}`,
        senderId: String(((i + 1) % 7) + 1),
        text: `Reply to message ${i + 1}`,
        timestamp: new Date(2024, 2, 5 + i, 10, 30).toISOString()
      },
    ],
    createdAt: new Date(2024, 2, 5 + i, 10, 0).toISOString(),
    updatedAt: new Date(2024, 2, 5 + i, 10, 30).toISOString()
  }))
];

// Seed vault items (12+)
export const SEED_VAULT_ITEMS: VaultItem[] = [
  {
    id: 'v1', title: 'Strategic Plan 2024', type: 'doc',
    value: 'Q1 2024 Strategic Initiatives...', tags: ['Strategy', 'Planning'],
    ftuId: 'F10.T1', sensitivity: 'High', createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'v2', title: 'Clinical Guidelines', type: 'doc',
    value: 'Updated clinical protocols...', tags: ['Clinical', 'Healthcare'],
    ftuId: 'F1.T1', sensitivity: 'Medium', createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 'v3', title: 'Financial Summary Q1', type: 'note',
    value: 'Revenue: $2.5M, Expenses: $1.8M...', tags: ['Finance', 'Reports'],
    ftuId: 'F2.T1', sensitivity: 'High', createdAt: '2024-03-01T10:00:00Z'
  },
  {
    id: 'v4', title: 'Meeting Notes - Leadership', type: 'note',
    value: 'Action items from leadership meeting...', tags: ['Meetings', 'Leadership'],
    sensitivity: 'Low', createdAt: '2024-03-05T10:00:00Z'
  },
  {
    id: 'v5', title: 'Patient Safety Protocol', type: 'doc',
    value: 'Emergency response procedures...', tags: ['Clinical', 'Safety'],
    ftuId: 'F1.T7', sensitivity: 'Medium', createdAt: '2024-02-15T10:00:00Z'
  },
  {
    id: 'v6', title: 'HR Policies', type: 'doc',
    value: 'Employee handbook and policies...', tags: ['HR', 'Policies'],
    sensitivity: 'Low', createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'v7', title: 'Board Meeting Minutes', type: 'note',
    value: 'Confidential board decisions...', tags: ['Board', 'Governance'],
    sensitivity: 'High', createdAt: '2024-03-10T10:00:00Z'
  },
  {
    id: 'v8', title: 'IT Security Audit', type: 'doc',
    value: 'Security assessment findings...', tags: ['IT', 'Security'],
    ftuId: 'F7.T5', sensitivity: 'High', createdAt: '2024-02-20T10:00:00Z'
  },
  {
    id: 'v9', title: 'Operations Manual', type: 'doc',
    value: 'Standard operating procedures...', tags: ['Operations', 'Process'],
    sensitivity: 'Low', createdAt: '2024-01-25T10:00:00Z'
  },
  {
    id: 'v10', title: 'Vendor Contracts', type: 'doc',
    value: 'Contract terms and agreements...', tags: ['Legal', 'Contracts'],
    sensitivity: 'Medium', createdAt: '2024-02-10T10:00:00Z'
  },
  {
    id: 'v11', title: 'Innovation Ideas', type: 'note',
    value: 'Brainstorming session notes...', tags: ['Innovation', 'Ideas'],
    ftuId: 'F10.T3', sensitivity: 'Low', createdAt: '2024-03-12T10:00:00Z'
  },
  {
    id: 'v12', title: 'Compliance Checklist', type: 'doc',
    value: 'Regulatory compliance items...', tags: ['Compliance', 'Legal'],
    sensitivity: 'Medium', createdAt: '2024-02-25T10:00:00Z'
  },
];

// Seed password items (8+) - encrypted with demo passcode "demo1234"
export const SEED_PASSWORD_ITEMS: PasswordItem[] = [
  {
    id: 'p1', title: 'CEO Email', username: 'ceo@raghava.ai', url: 'https://mail.raghava.ai',
    passwordEnc: 'PLACEHOLDER_ENCRYPTED', tags: ['Email'], ftuId: 'F9.T1',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'p2', title: 'Clinical System', username: 'admin', url: 'https://clinical.raghava.ai',
    passwordEnc: 'PLACEHOLDER_ENCRYPTED', tags: ['Clinical', 'System'],
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'p3', title: 'Finance Portal', username: 'finance_admin', url: 'https://finance.raghava.ai',
    passwordEnc: 'PLACEHOLDER_ENCRYPTED', tags: ['Finance'], ftuId: 'F2.T1',
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'p4', title: 'HR System', username: 'hr_manager', url: 'https://hr.raghava.ai',
    passwordEnc: 'PLACEHOLDER_ENCRYPTED', tags: ['HR'],
    createdAt: '2024-01-25T10:00:00Z'
  },
  {
    id: 'p5', title: 'AWS Console', username: 'ops@raghava.ai', url: 'https://console.aws.amazon.com',
    passwordEnc: 'PLACEHOLDER_ENCRYPTED', tags: ['IT', 'Cloud'],
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 'p6', title: 'Database Admin', username: 'db_admin', url: 'https://db.raghava.ai',
    passwordEnc: 'PLACEHOLDER_ENCRYPTED', tags: ['IT', 'Database'],
    createdAt: '2024-02-05T10:00:00Z'
  },
  {
    id: 'p7', title: 'VPN Access', username: 'vpn_user', url: 'https://vpn.raghava.ai',
    passwordEnc: 'PLACEHOLDER_ENCRYPTED', tags: ['IT', 'Security'],
    createdAt: '2024-02-10T10:00:00Z'
  },
  {
    id: 'p8', title: 'API Keys', username: 'api_service', url: 'https://api.raghava.ai',
    passwordEnc: 'PLACEHOLDER_ENCRYPTED', tags: ['IT', 'API'], ftuId: 'F7.T5',
    createdAt: '2024-02-15T10:00:00Z'
  },
];

// Initialize all seed data in localStorage
export function initializeSeedData() {
  const prefix = 'raghava:';

  // Only seed if not already initialized
  if (localStorage.getItem(`${prefix}seed:initialized`)) {
    return;
  }

  // Users
  localStorage.setItem(`${prefix}users`, JSON.stringify(SEED_USERS));

  // Contacts
  localStorage.setItem(`${prefix}contacts`, JSON.stringify(SEED_CONTACTS));

  // Tasks
  localStorage.setItem(`${prefix}tasks`, JSON.stringify(SEED_TASKS));

  // Messages
  localStorage.setItem(`${prefix}messages`, JSON.stringify(SEED_MESSAGES));

  // Vault items
  localStorage.setItem(`${prefix}vault:items`, JSON.stringify(SEED_VAULT_ITEMS));

  // Password items
  localStorage.setItem(`${prefix}pm:items`, JSON.stringify(SEED_PASSWORD_ITEMS));

  // Topic scores
  const topicScores = generateTopicScoreMap();
  localStorage.setItem(`${prefix}topic:scores`, JSON.stringify(topicScores));

  // Mark as initialized
  localStorage.setItem(`${prefix}seed:initialized`, 'true');
}

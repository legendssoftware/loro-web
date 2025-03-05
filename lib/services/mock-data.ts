import { Lead, LeadStatus } from '@/lib/types/lead';

// Mock company names
const companies = [
  'Capital Flow',
  'Wealth Edge',
  'Code Sphere',
  'Pixel Core',
  'Care Bridge',
  'Trend Haven',
  'BioVita',
  'Luminous Co',
  'Market Hive',
  'Tech Vantage',
];

// Mock lead names with initials
const leadData = [
  { name: 'Esther Howard', initials: 'EH' },
  { name: 'Guy Hawkins', initials: 'GH' },
  { name: 'Wade Warren', initials: 'WW' },
  { name: 'Jenny Wilson', initials: 'JW' },
  { name: 'Robert Fox', initials: 'RF' },
  { name: 'Jacob Jones', initials: 'JJ' },
  { name: 'Cameron Williamson', initials: 'CW' },
  { name: 'Cody Fisher', initials: 'CF' },
  { name: 'Bessie Cooper', initials: 'BC' },
  { name: 'Savannah Nguyen', initials: 'SN' },
  { name: 'Leslie Alexander', initials: 'LA' },
  { name: 'Ronald Richards', initials: 'RR' },
  { name: 'Kristin Watson', initials: 'KW' },
];

// Mock email domains
const emailDomains = [
  'trend.com',
  'market.com',
  'pure.com',
  'pixel.com',
  'care.com',
  'luminous.com',
];

// Generate random phone number
const generatePhoneNumber = (): string => {
  const areaCode = Math.floor(Math.random() * 800) + 200;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${prefix}-${lineNumber}`;
};

// Generate a random lead
export const generateMockLead = (id: number): Lead => {
  const leadIndex = Math.floor(Math.random() * leadData.length);
  const { name, initials } = leadData[leadIndex];

  const companyIndex = Math.floor(Math.random() * companies.length);
  const company = companies[companyIndex];

  const domainIndex = Math.floor(Math.random() * emailDomains.length);
  const domain = emailDomains[domainIndex];

  const firstName = name.split(' ')[0].toLowerCase();
  const email = `${firstName}@${domain}`;

  const statusValues = Object.values(LeadStatus);
  const status = statusValues[Math.floor(Math.random() * statusValues.length)];

  return {
    uid: id,
    name,
    email,
    phone: generatePhoneNumber(),
    companyName: company,
    notes: `Notes for ${name}`,
    status,
    isDeleted: false,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    initials,
    owner: {
      uid: 1,
      name: 'Current User',
      email: 'user@example.com',
    }
  };
};

// Generate specific leads to match the image
export const generateSpecificLeads = (): Lead[] => {
  const specificLeads = [
    {
      uid: 1,
      name: 'Robert Fox',
      initials: 'RF',
      email: 'robert@trend.com',
      phone: '(567) 852-3272',
      companyName: 'Capital Flow',
      notes: 'Notes for Robert Fox',
      status: LeadStatus.NEW,
      isDeleted: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      owner: {
        uid: 1,
        name: 'Current User',
        email: 'user@example.com',
      }
    },
    {
      uid: 2,
      name: 'Jacob Jones',
      initials: 'JJ',
      email: 'jacob@pixel.com',
      phone: '(744) 489-2064',
      companyName: 'Care Bridge',
      notes: 'Notes for Jacob Jones',
      status: LeadStatus.CONTACTED,
      isDeleted: false,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      owner: {
        uid: 1,
        name: 'Current User',
        email: 'user@example.com',
      }
    },
    {
      uid: 3,
      name: 'Cody Fisher',
      initials: 'CF',
      email: 'cody@pure.com',
      phone: '(408) 669-3801',
      companyName: 'Market Hive',
      notes: 'Notes for Cody Fisher',
      status: LeadStatus.CLOSED_LOST,
      isDeleted: false,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      owner: {
        uid: 1,
        name: 'Current User',
        email: 'user@example.com',
      }
    },
    {
      uid: 4,
      name: 'Kristin Watson',
      initials: 'KW',
      email: 'kristin@trend.com',
      phone: '(315) 246-6675',
      companyName: 'Wealth Edge',
      notes: 'Notes for Kristin Watson',
      status: LeadStatus.NEW,
      isDeleted: false,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      owner: {
        uid: 1,
        name: 'Current User',
        email: 'user@example.com',
      }
    },
    {
      uid: 5,
      name: 'Jacob Jones',
      initials: 'JJ',
      email: 'jacob@care.com',
      phone: '(361) 686-3669',
      companyName: 'Tech Vantage',
      notes: 'Notes for Jacob Jones',
      status: LeadStatus.CONTACTED,
      isDeleted: false,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      owner: {
        uid: 1,
        name: 'Current User',
        email: 'user@example.com',
      }
    },
    {
      uid: 6,
      name: 'Esther Howard',
      initials: 'EH',
      email: 'esther@market.com',
      phone: '(376) 154-6817',
      companyName: 'Capital Flow',
      notes: 'Notes for Esther Howard',
      status: LeadStatus.CLOSED_LOST,
      isDeleted: false,
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      owner: {
        uid: 1,
        name: 'Current User',
        email: 'user@example.com',
      }
    }
  ];

  // Add more random leads to reach 30 total
  const additionalLeadsCount = 24;
  const randomLeads = Array.from({ length: additionalLeadsCount }, (_, i) =>
    generateMockLead(specificLeads.length + i + 1)
  );

  return [...specificLeads, ...randomLeads];
};

// Mock leads data - use specific leads that match the image
export const mockLeads = generateSpecificLeads();

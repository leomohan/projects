export const EMPTY_DOSSIER = {
  id: "",
  userId: "",
  status: "draft",
  personal: {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    birthDate: "",
    nationality: "",
    familyBackground: ""
  },
  education: [],
  work: [],
  certifications: [],
  achievements: [],
  training: [],
  references: [],
  attachments: [],
  updatedAt: ""
};

export const SEED_DB = {
  users: [
    {
      id: "user-candidate-1",
      role: "candidate",
      email: "candidate@dossier.dev",
      password: "demo",
      displayName: "Ariana Shah",
      candidateId: "cand-001"
    },
    {
      id: "user-recruiter-1",
      role: "recruiter",
      email: "recruiter@dossier.dev",
      password: "demo",
      displayName: "Mason Cole"
    },
    {
      id: "user-candidate-2",
      role: "candidate",
      email: "sara@dossier.dev",
      password: "demo",
      displayName: "Sara Bennett",
      candidateId: "cand-002"
    }
  ],
  dossiers: [
    {
      id: "cand-001",
      userId: "user-candidate-1",
      status: "ready",
      personal: {
        fullName: "Ariana Shah",
        headline: "Senior Operations Analyst",
        email: "ariana.shah@example.com",
        phone: "+971 55 501 0101",
        location: "Dubai, UAE",
        birthDate: "1994-02-12",
        nationality: "Indian",
        familyBackground: "Optional family details provided for relocation and dependents context."
      },
      education: [
        {
          id: "edu-1",
          institution: "University of Mumbai",
          qualification: "B.Com in Finance",
          startDate: "2011-06-01",
          endDate: "2014-05-30",
          grade: "First Class",
          semesterMarks: "Average 78%",
          certificateRef: "Degree certificate uploaded"
        }
      ],
      work: [
        {
          id: "work-1",
          company: "Orbit Freight",
          role: "Operations Executive",
          startDate: "2014-07-01",
          endDate: "2018-08-31",
          responsibilities: "Managed regional shipment reconciliations and vendor escalations.",
          achievements: "Reduced monthly exception backlog by 31% in 18 months.",
          reasonForLeaving: "Promoted into a regional analyst role at a larger employer.",
          referencePerson: "Nadir Khan, Regional Manager"
        },
        {
          id: "work-2",
          company: "Northstar Logistics",
          role: "Senior Operations Analyst",
          startDate: "2018-09-15",
          endDate: "",
          responsibilities: "Owns dashboard quality, SLA recovery plans, and compliance reporting.",
          achievements: "Launched a root-cause workflow that cut customs exceptions by 18%.",
          reasonForLeaving: "",
          referencePerson: "Elena Gruber, Director of Operations"
        }
      ],
      certifications: [
        {
          id: "cert-1",
          title: "Lean Six Sigma Green Belt",
          issuer: "IASSC",
          issueDate: "2021-03-08",
          credentialId: "IASSC-GREEN-4489"
        }
      ],
      achievements: [
        {
          id: "ach-1",
          title: "Regional Excellence Award",
          issuer: "Northstar Logistics",
          issueDate: "2023-12-15",
          description: "Recognized for operational turnaround in GCC customs queue management."
        }
      ],
      training: [
        {
          id: "train-1",
          title: "Power BI for Operations Leaders",
          provider: "Coursera",
          issueDate: "2022-04-20",
          description: "Focused on executive KPI storytelling and dashboard QA."
        }
      ],
      references: [
        {
          id: "ref-1",
          name: "Elena Gruber",
          relationship: "Current manager",
          company: "Northstar Logistics",
          email: "elena.gruber@example.com",
          phone: "+971 55 200 5501"
        }
      ],
      attachments: [
        {
          id: "att-1",
          fileName: "bcom-degree.pdf",
          category: "Degree certificate",
          sizeLabel: "184 KB",
          linkedClaim: "University of Mumbai degree"
        },
        {
          id: "att-2",
          fileName: "northstar-experience-letter.pdf",
          category: "Experience letter",
          sizeLabel: "241 KB",
          linkedClaim: "Northstar Logistics employment"
        }
      ],
      updatedAt: "2026-03-10T08:00:00.000Z"
    },
    {
      id: "cand-002",
      userId: "user-candidate-2",
      status: "draft",
      personal: {
        fullName: "Sara Bennett",
        headline: "HR Generalist",
        email: "sara.bennett@example.com",
        phone: "+1 415 555 0100",
        location: "Austin, TX",
        birthDate: "1996-07-11",
        nationality: "US",
        familyBackground: ""
      },
      education: [
        {
          id: "edu-2",
          institution: "Texas State University",
          qualification: "BBA in Human Resources",
          startDate: "2014-08-20",
          endDate: "2018-05-15",
          grade: "3.6 GPA",
          semesterMarks: "",
          certificateRef: ""
        }
      ],
      work: [
        {
          id: "work-3",
          company: "Orchard Retail",
          role: "HR Coordinator",
          startDate: "2019-01-10",
          endDate: "2021-03-30",
          responsibilities: "Supported onboarding, policy queries, and HRIS updates.",
          achievements: "Improved onboarding packet completion rates to 96%.",
          reasonForLeaving: "Career progression",
          referencePerson: "Laura Mills"
        },
        {
          id: "work-4",
          company: "PeopleCore",
          role: "HR Generalist",
          startDate: "2022-02-15",
          endDate: "",
          responsibilities: "Leads benefits administration and employee relations support.",
          achievements: "",
          reasonForLeaving: "",
          referencePerson: "Chris Rowan"
        }
      ],
      certifications: [],
      achievements: [],
      training: [],
      references: [],
      attachments: [],
      updatedAt: "2026-03-09T18:45:00.000Z"
    }
  ]
};

export const STEP_ORDER = [
  { id: "personal", label: "Personal" },
  { id: "education", label: "Education" },
  { id: "work", label: "Work history" },
  { id: "credentials", label: "Credentials" },
  { id: "references", label: "References" },
  { id: "attachments", label: "Attachments" },
  { id: "review", label: "Review" }
];

export function createEmptyListItem(type) {
  const suffix = Math.random().toString(36).slice(2, 9);
  switch (type) {
    case "education":
      return {
        id: `edu-${suffix}`,
        institution: "",
        qualification: "",
        startDate: "",
        endDate: "",
        grade: "",
        semesterMarks: "",
        certificateRef: ""
      };
    case "work":
      return {
        id: `work-${suffix}`,
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        responsibilities: "",
        achievements: "",
        reasonForLeaving: "",
        referencePerson: ""
      };
    case "certifications":
      return {
        id: `cert-${suffix}`,
        title: "",
        issuer: "",
        issueDate: "",
        credentialId: ""
      };
    case "achievements":
    case "training":
      return {
        id: `${type.slice(0, 4)}-${suffix}`,
        title: "",
        issuer: "",
        provider: "",
        issueDate: "",
        description: ""
      };
    case "references":
      return {
        id: `ref-${suffix}`,
        name: "",
        relationship: "",
        company: "",
        email: "",
        phone: ""
      };
    case "attachments":
      return {
        id: `att-${suffix}`,
        fileName: "",
        category: "",
        sizeLabel: "",
        linkedClaim: ""
      };
    default:
      return { id: suffix };
  }
}

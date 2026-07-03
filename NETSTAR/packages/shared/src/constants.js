export const LIFECYCLE_STAGES = [
  { id: "procurement", label: "Procurement", weight: 0.2 },
  { id: "designImplementation", label: "Design & Implementation", weight: 0.2 },
  { id: "operations", label: "Operations", weight: 0.3 },
  { id: "security", label: "Security", weight: 0.2 },
  { id: "phaseOut", label: "Phase-out / Lifecycle Management", weight: 0.1 }
];

export const DEVICE_CRITICALITY = {
  red: { label: "Red devices", penaltyMultiplier: 1.5 },
  orange: { label: "Orange devices", penaltyMultiplier: 1.15 },
  green: { label: "Green devices", penaltyMultiplier: 1 }
};

export const QUESTION_BANK = {
  stakeholder: [
    {
      id: "budget_alignment",
      stage: "procurement",
      prompt: "How well is network investment aligned with business priorities?",
      maxScore: 5
    },
    {
      id: "roadmap_clarity",
      stage: "designImplementation",
      prompt: "Is there a documented network strategy and target architecture roadmap?",
      maxScore: 5
    },
    {
      id: "service_resilience_priority",
      stage: "operations",
      prompt: "Do business stakeholders actively prioritize uptime and service resilience objectives?",
      maxScore: 5
    },
    {
      id: "risk_governance",
      stage: "security",
      prompt: "Is network risk governance reviewed with leadership on a regular basis?",
      maxScore: 5
    },
    {
      id: "asset_lifecycle_funding",
      stage: "phaseOut",
      prompt: "Is refresh and decommission funding planned before end-of-support milestones?",
      maxScore: 5
    }
  ],
  networkTeam: [
    {
      id: "design_standardization",
      stage: "designImplementation",
      prompt: "Are standard patterns used for routing, segmentation, and resiliency design?",
      maxScore: 5
    },
    {
      id: "backup_validation",
      stage: "operations",
      prompt: "Are configuration backups regularly tested for recovery value?",
      maxScore: 5
    },
    {
      id: "monitoring_coverage",
      stage: "operations",
      prompt: "Does monitoring cover performance, capacity, and fault visibility across the estate?",
      maxScore: 5
    },
    {
      id: "vulnerability_hygiene",
      stage: "security",
      prompt: "Is firmware and vulnerability remediation managed through a formal process?",
      maxScore: 5
    },
    {
      id: "retirement_process",
      stage: "phaseOut",
      prompt: "Is there a controlled process for secure device retirement and configuration archival?",
      maxScore: 5
    }
  ]
};

export const CHECKLIST_SECTIONS = {
  devices: [
    {
      id: "config_backup",
      stage: "operations",
      label: "Configuration backup status",
      evidenceHint: "Backup job log or recovery test record"
    },
    {
      id: "cpu_utilization",
      stage: "operations",
      label: "CPU utilization reviewed",
      evidenceHint: "Monitoring screenshots or report extracts"
    },
    {
      id: "memory_usage",
      stage: "operations",
      label: "Memory usage reviewed",
      evidenceHint: "NMS or telemetry evidence"
    },
    {
      id: "firmware_version",
      stage: "security",
      label: "Firmware version current and approved",
      evidenceHint: "Firmware inventory or maintenance record"
    }
  ],
  procurement: [
    {
      id: "purchase_dates",
      stage: "procurement",
      label: "Purchase dates documented",
      evidenceHint: "Asset register extract"
    },
    {
      id: "support_contract",
      stage: "procurement",
      label: "Support contract status tracked",
      evidenceHint: "Support contract or renewal record"
    },
    {
      id: "eol_tracking",
      stage: "phaseOut",
      label: "EOL/EOS dates tracked",
      evidenceHint: "Vendor lifecycle matrix or CMDB record"
    }
  ]
};

export const PENALTY_RULES = [
  {
    id: "red-no-backup",
    description: "No configuration backups for Red devices",
    points: -30,
    appliesTo(assessment) {
      return assessment.deviceChecklist.some(
        (device) => device.criticality === "red" && device.items.config_backup?.status === "no"
      );
    }
  },
  {
    id: "unsupported-red-firmware",
    description: "Unsupported firmware on Red devices",
    points: -25,
    appliesTo(assessment) {
      return assessment.deviceChecklist.some(
        (device) => device.criticality === "red" && device.items.firmware_version?.status === "no"
      );
    }
  },
  {
    id: "contract-gap",
    description: "Support contracts missing for scoped procurement assets",
    points: -20,
    appliesTo(assessment) {
      return assessment.procurementChecklist.some((item) => item.items.support_contract?.status === "no");
    }
  }
];

export const SCORE_LIMITS = {
  min: 1,
  max: 1000
};

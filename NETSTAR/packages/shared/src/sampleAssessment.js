export const sampleAssessment = {
  id: "demo-assessment",
  organization: {
    name: "Northwind Data Services",
    sector: "Managed Services",
    profile: "Regional enterprise with 3 campuses and 2 colocation sites"
  },
  auditor: {
    name: "Lead Network Auditor",
    email: "auditor@netstar.local"
  },
  scope: {
    title: "Enterprise Core and WAN Maturity Review",
    summary: "MVP sample for assessing lifecycle maturity with evidence-backed validation.",
    regions: ["Dubai", "Abu Dhabi"],
    deviceTotals: {
      red: 14,
      orange: 26,
      green: 41
    }
  },
  questionnaires: {
    stakeholder: {
      budget_alignment: { score: 4, note: "Investment committee reviews network projects quarterly." },
      roadmap_clarity: { score: 3, note: "Architecture roadmap exists but not fully socialized." },
      service_resilience_priority: { score: 4, note: "Critical sites have board-approved uptime targets." },
      risk_governance: { score: 3, note: "Cyber and network risks reviewed semi-annually." },
      asset_lifecycle_funding: { score: 2, note: "Refresh funding is often approved late." }
    },
    networkTeam: {
      design_standardization: { score: 3, note: "WAN templates exist but branch LAN standards vary." },
      backup_validation: { score: 2, note: "Backups run but recovery testing is inconsistent." },
      monitoring_coverage: { score: 4, note: "Core telemetry is healthy; some campus blind spots remain." },
      vulnerability_hygiene: { score: 3, note: "Firmware updates are planned but not risk-ranked." },
      retirement_process: { score: 2, note: "Decommission steps are manual and not fully tracked." }
    }
  },
  deviceChecklist: [
    {
      name: "Core Router 01",
      criticality: "red",
      evidenceCount: 3,
      items: {
        config_backup: { status: "no", note: "Backup schedule defined but last job failed." },
        cpu_utilization: { status: "yes", note: "Below 40% sustained." },
        memory_usage: { status: "yes", note: "No pressure observed." },
        firmware_version: { status: "partial", note: "Pending upgrade to approved release." }
      }
    },
    {
      name: "Campus Distribution Pair",
      criticality: "orange",
      evidenceCount: 4,
      items: {
        config_backup: { status: "yes", note: "Nightly backups retained 90 days." },
        cpu_utilization: { status: "yes", note: "Trending reviewed monthly." },
        memory_usage: { status: "yes", note: "Normal allocation." },
        firmware_version: { status: "yes", note: "Aligned with approved train." }
      }
    }
  ],
  procurementChecklist: [
    {
      name: "WAN Edge Refresh Batch",
      evidenceCount: 2,
      items: {
        purchase_dates: { status: "yes", note: "Asset registry confirms install dates." },
        support_contract: { status: "no", note: "One major circuit termination device lacks active support." },
        eol_tracking: { status: "partial", note: "Lifecycle dates available for most but not all sites." }
      }
    }
  ],
  evidence: [
    { name: "Topology Diagram", type: "diagram", stage: "designImplementation", validated: true },
    { name: "Backup Failure Screenshot", type: "screenshot", stage: "operations", validated: true },
    { name: "Support Contract PDF", type: "contract", stage: "procurement", validated: false }
  ],
  status: "in-progress"
};

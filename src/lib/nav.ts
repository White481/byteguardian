import {
  BarChart3,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  ListChecks,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Authenticated sidebar — single source of truth for app navigation */
export const APP_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Assessment", href: "/assessment", icon: ClipboardCheck },
  { label: "Assessment Results", href: "/results", icon: BarChart3 },
  { label: "AI Insights", href: "/insights", icon: Sparkles },
  { label: "Action Plan", href: "/action-plan", icon: ListChecks },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Collaborators", href: "/collaborators", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

/** Public navbar — anchors on the landing page */
export const PUBLIC_NAV = [
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Pricing", href: "/#pricing" },
  { label: "News", href: "/#news" },
  { label: "Partners", href: "/#partners" },
  { label: "Contact", href: "/#contact" },
];

/** Human-readable labels for breadcrumbs */
export const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  assessment: "Assessment",
  questionnaire: "Questionnaire",
  processing: "Processing",
  onboarding: "Onboarding",
  company: "Company Setup",
  results: "Assessment Results",
  insights: "AI Insights",
  "action-plan": "Action Plan",
  reports: "Reports",
  collaborators: "Collaborators",
  settings: "Settings",
};

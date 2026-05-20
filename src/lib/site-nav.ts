export interface SiteNavItem {
  label: string;
  href: string;
}

export const siteNavItems: SiteNavItem[] = [
  { label: "Terminal", href: "/terminal/macro-desk" },
  { label: "Execute", href: "/execute" },
  { label: "Methodology", href: "/methodology" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerCompanyLinks: SiteNavItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Methodology", href: "/methodology" },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "/in-progress" },
];

export const footerPlatformLinks: SiteNavItem[] = [
  { label: "Macro Desk", href: "/terminal/macro-desk" },
  { label: "Alpha Factory", href: "/terminal/alpha-factory" },
  { label: "Risk Desk", href: "/terminal/risk-desk" },
  { label: "Execution", href: "/terminal/execution" },
  { label: "Backtest", href: "/terminal/backtest" },
  { label: "Portfolio", href: "/terminal/portfolio" },
];

export const footerLegalLinks: SiteNavItem[] = [
  { label: "Privacy", href: "/in-progress" },
  { label: "Terms", href: "/in-progress" },
  { label: "Regulatory", href: "/in-progress" },
  { label: "Disclosures", href: "/in-progress" },
];

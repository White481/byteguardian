"""What to recommend for each question when it is answered 'no' or 'partially'.

Written by the Data/AI team as a DRAFT, based on the NIST CSF 2.0 subcategory and the
CIS Controls v8 safeguards listed in data/questions.json. Review with the cyber team.
estimatedCost is a rough band, not a price quote.
"""

KNOWLEDGE = {
    "GV.PO-01": {
        "finding": "No approved information security policy",
        "title": "Write and approve an information security policy",
        "detail": "Create a short policy covering acceptable use, passwords, data handling and incident reporting. "
                  "Have management approve it, share it with all staff, and review it every year.",
        "team": "Management / Compliance",
        "cost": "Low",
        "service": "policy_compliance",
    },
    "ID.AM-01": {
        "finding": "No complete inventory of devices",
        "title": "Build an automated asset inventory",
        "detail": "List every computer, server and network device with owner and location. "
                  "Use a discovery tool or MDM so the list stays current, and review it every quarter.",
        "team": "IT",
        "cost": "Low",
        "service": "asset_inventory",
    },
    "ID.RA-01": {
        "finding": "Vulnerabilities are not scanned regularly",
        "title": "Start regular vulnerability scanning",
        "detail": "Scan internal and internet-facing systems at least monthly, track findings in a list, "
                  "and fix critical issues first. Run a penetration test on public websites once a year.",
        "team": "IT / Security",
        "cost": "Medium",
        "service": "vulnerability_scanning",
    },
    "PR.AA-03": {
        "finding": "MFA is not enforced on key accounts",
        "title": "Turn on multi-factor authentication",
        "detail": "Require MFA for email, VPN / remote access and every admin account first, then all users. "
                  "Most cloud email services include MFA at no extra cost.",
        "team": "IT",
        "cost": "Low",
        "service": "mfa_rollout",
    },
    "PR.AT-01": {
        "finding": "Staff do not get regular security training",
        "title": "Run yearly security awareness and phishing training",
        "detail": "Train all staff at least once a year and at onboarding. Add simulated phishing emails "
                  "and track the click rate over time.",
        "team": "HR / IT",
        "cost": "Low",
        "service": "phishing_protection",
    },
    "PR.DS-11": {
        "finding": "Backups are missing, not isolated or never tested",
        "title": "Protect and test backups",
        "detail": "Back up important data automatically, keep one copy offline or immutable (separate from the main "
                  "network), and test a restore at least every quarter. This is the main defence against ransomware.",
        "team": "IT",
        "cost": "Medium",
        "service": "backup_ransomware",
    },
    "PR.PS-02": {
        "finding": "Security updates are not installed on a schedule",
        "title": "Set up patch management",
        "detail": "Install security updates within 30 days (critical ones within 7), using automatic updates or a "
                  "patch management tool. Replace systems that no longer get updates.",
        "team": "IT",
        "cost": "Low",
        "service": "patch_management",
    },
    "DE.CM-01": {
        "finding": "Logs are not collected and reviewed centrally",
        "title": "Collect logs centrally and alert on suspicious activity",
        "detail": "Send logs from firewalls, servers and cloud accounts to one place (SIEM or a managed service) "
                  "and set alerts for things like many failed logins or new admin accounts.",
        "team": "Security / IT",
        "cost": "High",
        "service": "security_monitoring",
    },
    "RS.MA-01": {
        "finding": "No tested incident response plan",
        "title": "Write an incident response plan and test it",
        "detail": "Document who to call, who decides, and the first steps for common incidents (ransomware, "
                  "account takeover, data leak), including PDPA breach notification. Run a tabletop exercise yearly.",
        "team": "Management / Security",
        "cost": "Low",
        "service": "incident_response_plan",
    },
    "RC.RP-01": {
        "finding": "No tested recovery plan with recovery time targets",
        "title": "Create a disaster recovery plan with recovery targets",
        "detail": "Decide how long each critical system can be down (RTO) and how much data you can lose (RPO). "
                  "Write the restore steps and test them at least once a year.",
        "team": "IT / Management",
        "cost": "Medium",
        "service": "disaster_recovery",
    },
    "GV.RR-02": {
        "finding": "No one is clearly responsible for cybersecurity",
        "title": "Name a cybersecurity owner",
        "detail": "Give one person or team clear responsibility for cybersecurity, with time in their job to do it, "
                  "authority to make changes, and a regular report to management.",
        "team": "Management",
        "cost": "Low",
        "service": "policy_compliance",
    },
    "GV.SC-07": {
        "finding": "Supplier and IT provider security is not checked",
        "title": "Check the security of key suppliers",
        "detail": "List suppliers that can access your systems or data, ask them about their security (or for ISO 27001 / "
                  "SOC 2 reports), add security terms to contracts, and review the most important ones every year.",
        "team": "Procurement / Security",
        "cost": "Low",
        "service": "vendor_risk",
    },
    "ID.AM-02": {
        "finding": "No complete list of software and cloud services",
        "title": "Keep a software and cloud service inventory",
        "detail": "List all installed software and cloud services (SaaS) with an owner for each. "
                  "Remove what is not needed and find unapproved services.",
        "team": "IT",
        "cost": "Low",
        "service": "asset_inventory",
    },
    "ID.AM-07": {
        "finding": "Location of important and personal data is not known",
        "title": "Map where important and personal data is stored",
        "detail": "Record which systems hold personal and business-critical data, who can access it, and how long it is kept. "
                  "This also forms the PDPA record of processing activities.",
        "team": "Compliance / IT",
        "cost": "Low",
        "service": "data_protection",
    },
    "PR.AA-05": {
        "finding": "Access rights are too broad or never reviewed",
        "title": "Apply least privilege and review access",
        "detail": "Give staff only the access their job needs, remove admin rights from daily accounts, remove access when "
                  "people leave, and review who has access to important systems every quarter.",
        "team": "IT",
        "cost": "Low",
        "service": "mfa_rollout",
    },
    "PR.DS-01": {
        "finding": "Sensitive data is not encrypted",
        "title": "Encrypt laptops, servers and cloud storage",
        "detail": "Turn on full-disk encryption (BitLocker / FileVault) on laptops and encryption for servers, databases and "
                  "cloud storage holding sensitive data. Lost laptops then do not become data breaches.",
        "team": "IT",
        "cost": "Low",
        "service": "data_protection",
    },
    "PR.IR-01": {
        "finding": "Network is not protected or separated",
        "title": "Harden the firewall and separate the network",
        "detail": "Use a firewall that blocks unneeded traffic, put servers and payment or production systems on their own "
                  "network segment, and keep guest Wi-Fi separate. Review firewall rules every year.",
        "team": "IT / Network",
        "cost": "Medium",
        "service": "network_security",
    },
    "PR.PS-05": {
        "finding": "Unapproved software can be installed",
        "title": "Block unapproved software",
        "detail": "Remove local admin rights and use application control (for example Microsoft Intune / AppLocker) "
                  "so only approved software can be installed and run.",
        "team": "IT",
        "cost": "Medium",
        "service": "endpoint_protection",
    },
    "DE.CM-09": {
        "finding": "Endpoints are not fully protected against malware",
        "title": "Deploy endpoint protection on every device",
        "detail": "Install up-to-date anti-malware or EDR on all computers and servers, manage it centrally, "
                  "and make sure someone receives and acts on its alerts.",
        "team": "IT / Security",
        "cost": "Medium",
        "service": "endpoint_protection",
    },
    "RS.CO-02": {
        "finding": "Unclear who to notify about incidents and how fast",
        "title": "Prepare an incident contact and notification list",
        "detail": "Write down who to contact during an incident (management, IT provider, insurer, lawyer, police) and the "
                  "legal deadlines — under PDPA, a personal data breach must be reported to the regulator within 72 hours.",
        "team": "Management / Compliance",
        "cost": "Low",
        "service": "incident_response_plan",
    },
}

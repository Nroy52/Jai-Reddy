import {
    Stethoscope,
    Globe,
    Cpu,
    Crown,
    ShoppingBag,
    Building,
    GraduationCap,
    Mic,
    Heart,
    Eye,
    type LucideIcon
} from 'lucide-react';

export interface Datapoint {
    id: string;
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
}

export interface KPI {
    id: string;
    title: string;
    value: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    advisorNote: string;
    datapoints: Datapoint[];
}

export interface Pillar {
    id: string;
    title: string;
    icon: LucideIcon;
    colorClass: string;
    gradientClass: string;
    kpis: KPI[];
}

const generateDatapoints = (kpiTitle: string): Datapoint[] => {
    return Array.from({ length: 10 }, (_, i) => ({
        id: `dp-${i}`,
        label: `${kpiTitle} Metric ${i + 1}`,
        value: `${Math.floor(Math.random() * 100)}%`,
        trend: Math.random() > 0.5 ? 'up' : 'down'
    }));
};

export const CEO_DASHBOARD_DATA: Pillar[] = [
    {
        id: 'pillar-1',
        title: 'Dentistry & Healthcare Innovation',
        icon: Stethoscope,
        colorClass: 'text-teal-500',
        gradientClass: 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20',
        kpis: [
            {
                id: 'kpi-1-1',
                title: 'Patient Flow Sovereignty',
                value: '1,240',
                trend: 'up',
                trendValue: '+5%',
                advisorNote: "Your inflow is steady, but there's room to grow. Strengthen referral pathways and refresh your online visibility.",
                datapoints: generateDatapoints('Patient Flow')
            },
            {
                id: 'kpi-1-2',
                title: 'Case Acceptance Ratio',
                value: '78%',
                trend: 'neutral',
                trendValue: '0%',
                advisorNote: "Patients are listening but not all are committing. Simplify treatment explanations and highlight benefits clearly.",
                datapoints: generateDatapoints('Case Acceptance')
            },
            {
                id: 'kpi-1-3',
                title: 'Implant & Surgery Success Index',
                value: '97.4%',
                trend: 'down',
                trendValue: '-2%',
                advisorNote: "A minor dip noted. Guided surgery and bone density mapping can restore stability.",
                datapoints: generateDatapoints('Implant Success')
            },
            {
                id: 'kpi-1-4',
                title: 'Chair Utilization Rate',
                value: '85%',
                trend: 'up',
                trendValue: '+3%',
                advisorNote: "Some chair time is underused. Streamline scheduling and reduce no-shows with timely reminders.",
                datapoints: generateDatapoints('Chair Utilization')
            },
            {
                id: 'kpi-1-5',
                title: 'Digital Adoption Quotient',
                value: '62%',
                trend: 'up',
                trendValue: '+8%',
                advisorNote: "Tools are strong but underused. Encourage full integration of scanning and CAD-CAM.",
                datapoints: generateDatapoints('Digital Adoption')
            },
            {
                id: 'kpi-1-6',
                title: 'Preventive Care Penetration',
                value: '45%',
                trend: 'neutral',
                trendValue: '+1%',
                advisorNote: "Preventive care is modest. Stronger recall programs will protect patients and improve loyalty.",
                datapoints: generateDatapoints('Preventive Care')
            },
            {
                id: 'kpi-1-7',
                title: 'Clinical Excellence Score',
                value: '4.9/5',
                trend: 'up',
                trendValue: '+0.1',
                advisorNote: "Reviews are excellent. Address a few negatives personally to turn critics into advocates.",
                datapoints: generateDatapoints('Clinical Excellence')
            },
            {
                id: 'kpi-1-8',
                title: 'Innovation Uptake',
                value: '3 New',
                trend: 'up',
                trendValue: '+1',
                advisorNote: "Innovation is progressing. Explore wider use of laser protocols for leadership in care.",
                datapoints: generateDatapoints('Innovation Uptake')
            },
            {
                id: 'kpi-1-9',
                title: 'Professional Mastery Hours',
                value: '120 hrs',
                trend: 'up',
                trendValue: '+15 hrs',
                advisorNote: "Training is solid. Invest in specialized workshops to elevate advanced skills.",
                datapoints: generateDatapoints('Mastery Hours')
            },
            {
                id: 'kpi-1-10',
                title: 'Net Health Contribution',
                value: 'High',
                trend: 'up',
                trendValue: 'Stable',
                advisorNote: "Your impact is visible. Expanding outreach will magnify goodwill and strengthen your legacy.",
                datapoints: generateDatapoints('Health Contribution')
            }
        ]
    },
    {
        id: 'pillar-2',
        title: 'Global Entrepreneurship',
        icon: Globe,
        colorClass: 'text-amber-500',
        gradientClass: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
        kpis: [
            {
                id: 'kpi-2-1',
                title: 'Revenue Sovereignty',
                value: '$4.2M',
                trend: 'up',
                trendValue: '+12%',
                advisorNote: "Growth is steady. Diversify income streams to fortify resilience.",
                datapoints: generateDatapoints('Revenue')
            },
            {
                id: 'kpi-2-2',
                title: 'Geographic Footprint Index',
                value: '8 Countries',
                trend: 'up',
                trendValue: '+1',
                advisorNote: "Expansion is balanced. Target one high-value market next year.",
                datapoints: generateDatapoints('Geo Footprint')
            },
            {
                id: 'kpi-2-3',
                title: 'Cross-Border Trade Volume',
                value: '$1.5M',
                trend: 'up',
                trendValue: '+8%',
                advisorNote: "Trade flows are growing. Streamline customs processes to reduce friction.",
                datapoints: generateDatapoints('Trade Volume')
            },
            {
                id: 'kpi-2-4',
                title: 'Strategic Alliance Expansion',
                value: '5 New',
                trend: 'up',
                trendValue: '+2',
                advisorNote: "Alliances are forming well. Nurture deeper partnerships with long-term potential.",
                datapoints: generateDatapoints('Alliances')
            },
            {
                id: 'kpi-2-5',
                title: 'Investor Confidence Score',
                value: '92/100',
                trend: 'up',
                trendValue: '+3',
                advisorNote: "Confidence is strong. Transparent reporting will attract larger capital.",
                datapoints: generateDatapoints('Investor Confidence')
            },
            {
                id: 'kpi-2-6',
                title: 'Portfolio Diversification Ratio',
                value: 'Balanced',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Your spread is healthy. Guard against overexposure in one sector.",
                datapoints: generateDatapoints('Diversification')
            },
            {
                id: 'kpi-2-7',
                title: 'Profitability Margin Index',
                value: '22%',
                trend: 'up',
                trendValue: '+1.5%',
                advisorNote: "Margins are good. Optimize supply chains to lift them higher.",
                datapoints: generateDatapoints('Profit Margins')
            },
            {
                id: 'kpi-2-8',
                title: 'Brand Equity Quotient',
                value: 'High',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Recognition is rising. Invest in storytelling to make your name unforgettable.",
                datapoints: generateDatapoints('Brand Equity')
            },
            {
                id: 'kpi-2-9',
                title: 'Governance Sovereignty',
                value: '100%',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Governance is sound. Formalize compliance dashboards for global investors.",
                datapoints: generateDatapoints('Governance')
            },
            {
                id: 'kpi-2-10',
                title: 'Legacy Growth Velocity',
                value: 'On Track',
                trend: 'up',
                trendValue: 'Steady',
                advisorNote: "Valuation is climbing. Aim for steady compounding rather than risky spikes.",
                datapoints: generateDatapoints('Legacy Growth')
            }
        ]
    },
    {
        id: 'pillar-3',
        title: 'IT & AI Innovation',
        icon: Cpu,
        colorClass: 'text-indigo-500',
        gradientClass: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
        kpis: [
            {
                id: 'kpi-3-1',
                title: 'AI Integration Index',
                value: '45%',
                trend: 'up',
                trendValue: '+5%',
                advisorNote: "Integration is smooth. Automate at least one new process this quarter.",
                datapoints: generateDatapoints('AI Integration')
            },
            {
                id: 'kpi-3-2',
                title: 'Automation Coverage Ratio',
                value: '30%',
                trend: 'up',
                trendValue: '+2%',
                advisorNote: "Coverage is strong. Focus on repetitive bottlenecks for next gains.",
                datapoints: generateDatapoints('Automation')
            },
            {
                id: 'kpi-3-3',
                title: 'Platform Growth Velocity',
                value: '+15%',
                trend: 'up',
                trendValue: '+3%',
                advisorNote: "User adoption is rising. Enhance onboarding for higher retention.",
                datapoints: generateDatapoints('Platform Growth')
            },
            {
                id: 'kpi-3-4',
                title: 'Data Integrity Score',
                value: '98%',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Accuracy is solid. Audit data pipelines quarterly for trustworthiness.",
                datapoints: generateDatapoints('Data Integrity')
            },
            {
                id: 'kpi-3-5',
                title: 'Innovation Cycle Time',
                value: '4 Weeks',
                trend: 'down',
                trendValue: '-1 Week',
                advisorNote: "Cycle speed is fair. Shorten testing phases without sacrificing quality.",
                datapoints: generateDatapoints('Cycle Time')
            },
            {
                id: 'kpi-3-6',
                title: 'Cyber Resilience Strength',
                value: 'High',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Defenses are strong. Regular drills will keep your guard high.",
                datapoints: generateDatapoints('Cyber Resilience')
            },
            {
                id: 'kpi-3-7',
                title: 'Predictive Power Index',
                value: '85%',
                trend: 'up',
                trendValue: '+4%',
                advisorNote: "Forecasts are accurate. Layer in more external data for sharper insights.",
                datapoints: generateDatapoints('Predictive Power')
            },
            {
                id: 'kpi-3-8',
                title: 'Multilingual Penetration',
                value: '3 Langs',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Languages are expanding. Prioritize Spanish and Mandarin next.",
                datapoints: generateDatapoints('Multilingual')
            },
            {
                id: 'kpi-3-9',
                title: 'Engagement Quotient',
                value: 'High',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Users are engaged. Introduce loyalty rewards to deepen ties.",
                datapoints: generateDatapoints('Engagement')
            },
            {
                id: 'kpi-3-10',
                title: 'ROI on Digital Investments',
                value: '18%',
                trend: 'up',
                trendValue: '+2%',
                advisorNote: "Returns are promising. Scale only the platforms showing sustained traction.",
                datapoints: generateDatapoints('ROI')
            }
        ]
    },
    {
        id: 'pillar-4',
        title: 'Leadership & Strategy',
        icon: Crown,
        colorClass: 'text-violet-500',
        gradientClass: 'bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20',
        kpis: [
            {
                id: 'kpi-4-1',
                title: 'Vision Alignment Score',
                value: '95%',
                trend: 'up',
                trendValue: '+2%',
                advisorNote: "Your team aligns well. Regular vision-sharing will strengthen unity.",
                datapoints: generateDatapoints('Vision Alignment')
            },
            {
                id: 'kpi-4-2',
                title: 'Strategic Expansion Velocity',
                value: '2 Ventures',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Expansion is steady. Bold but calculated moves will accelerate growth.",
                datapoints: generateDatapoints('Expansion Velocity')
            },
            {
                id: 'kpi-4-3',
                title: 'Leadership Excellence Quotient',
                value: '4.8/5',
                trend: 'up',
                trendValue: '+0.1',
                advisorNote: "Leadership is respected. Mentor second-line leaders to prepare successors.",
                datapoints: generateDatapoints('Leadership Excellence')
            },
            {
                id: 'kpi-4-4',
                title: 'Decision Cycle Speed',
                value: 'Fast',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Decisions are timely. Empower managers to reduce bottlenecks.",
                datapoints: generateDatapoints('Decision Speed')
            },
            {
                id: 'kpi-4-5',
                title: 'Crisis Resilience Index',
                value: 'High',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Responses are strong. Document best practices for future challenges.",
                datapoints: generateDatapoints('Crisis Resilience')
            },
            {
                id: 'kpi-4-6',
                title: 'Diplomatic Reach Score',
                value: 'High',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Connections are growing. Deepen ties with influential global partners.",
                datapoints: generateDatapoints('Diplomatic Reach')
            },
            {
                id: 'kpi-4-7',
                title: 'Talent Retention Sovereignty',
                value: '90%',
                trend: 'down',
                trendValue: '-2%',
                advisorNote: "Retention is fair. Reward loyalty with recognition and equity.",
                datapoints: generateDatapoints('Talent Retention')
            },
            {
                id: 'kpi-4-8',
                title: 'Governance Integrity',
                value: '100%',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Compliance is solid. Independent reviews will enhance credibility.",
                datapoints: generateDatapoints('Governance Integrity')
            },
            {
                id: 'kpi-4-9',
                title: 'Reputation Capital',
                value: 'Excellent',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Reputation shines. A few public engagements will amplify further.",
                datapoints: generateDatapoints('Reputation Capital')
            },
            {
                id: 'kpi-4-10',
                title: 'Legacy Fulfilment Index',
                value: 'On Track',
                trend: 'up',
                trendValue: 'Steady',
                advisorNote: "You are on track. Keep milestones visible to maintain momentum.",
                datapoints: generateDatapoints('Legacy Fulfilment')
            }
        ]
    },
    {
        id: 'pillar-5',
        title: 'Exclusive Online Market',
        icon: ShoppingBag,
        colorClass: 'text-rose-500',
        gradientClass: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20',
        kpis: [
            {
                id: 'kpi-5-1',
                title: 'Product Launch Velocity',
                value: '4/Year',
                trend: 'up',
                trendValue: '+1',
                advisorNote: "Launches are steady. Plan seasonal drops for stronger impact.",
                datapoints: generateDatapoints('Launch Velocity')
            },
            {
                id: 'kpi-5-2',
                title: 'Premium Sales Growth',
                value: '+20%',
                trend: 'up',
                trendValue: '+5%',
                advisorNote: "Luxury sales are rising. Strengthen storytelling around exclusivity.",
                datapoints: generateDatapoints('Sales Growth')
            },
            {
                id: 'kpi-5-3',
                title: 'Customer Loyalty Quotient',
                value: '85%',
                trend: 'up',
                trendValue: '+2%',
                advisorNote: "Loyalty is building. Surprise rewards will cement devotion.",
                datapoints: generateDatapoints('Customer Loyalty')
            },
            {
                id: 'kpi-5-4',
                title: 'Global Market Reach',
                value: '12 Countries',
                trend: 'up',
                trendValue: '+2',
                advisorNote: "Your presence is global. Expand logistics for faster delivery.",
                datapoints: generateDatapoints('Market Reach')
            },
            {
                id: 'kpi-5-5',
                title: 'Supply Chain Sovereignty',
                value: 'Stable',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Supply is stable. Secure backups for critical components.",
                datapoints: generateDatapoints('Supply Chain')
            },
            {
                id: 'kpi-5-6',
                title: 'Brand Prestige Score',
                value: 'High',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Prestige is climbing. Secure endorsements for higher credibility.",
                datapoints: generateDatapoints('Brand Prestige')
            },
            {
                id: 'kpi-5-7',
                title: 'Conversion Sovereignty',
                value: '3.5%',
                trend: 'up',
                trendValue: '+0.5%',
                advisorNote: "Conversions are good. Simplify checkout for higher results.",
                datapoints: generateDatapoints('Conversion Rate')
            },
            {
                id: 'kpi-5-8',
                title: 'Presentation Excellence',
                value: '5/5',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Design is admired. Introduce premium packaging for signature products.",
                datapoints: generateDatapoints('Presentation')
            },
            {
                id: 'kpi-5-9',
                title: 'Digital Traffic Index',
                value: '50k/Mo',
                trend: 'up',
                trendValue: '+5k',
                advisorNote: "Traffic is strong. Invest in SEO and influencer partnerships.",
                datapoints: generateDatapoints('Digital Traffic')
            },
            {
                id: 'kpi-5-10',
                title: 'Profit Sovereignty',
                value: '30%',
                trend: 'up',
                trendValue: '+2%',
                advisorNote: "Margins are healthy. Monitor costs to protect luxury positioning.",
                datapoints: generateDatapoints('Profit Margins')
            }
        ]
    },
    {
        id: 'pillar-6',
        title: 'Infrastructure & Smart Real Estate',
        icon: Building,
        colorClass: 'text-slate-500',
        gradientClass: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20',
        kpis: [
            {
                id: 'kpi-6-1',
                title: 'Asset Growth Index',
                value: '$50M',
                trend: 'up',
                trendValue: '+5M',
                advisorNote: "Your portfolio is growing. Target one iconic property this year.",
                datapoints: generateDatapoints('Asset Growth')
            },
            {
                id: 'kpi-6-2',
                title: 'Occupancy Sovereignty',
                value: '95%',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Occupancy is solid. Diversify tenants to reduce risks.",
                datapoints: generateDatapoints('Occupancy')
            },
            {
                id: 'kpi-6-3',
                title: 'Project Timeliness Quotient',
                value: 'On Time',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Most projects meet deadlines. Strengthen contractor accountability.",
                datapoints: generateDatapoints('Timeliness')
            },
            {
                id: 'kpi-6-4',
                title: 'Cost-Efficiency Ratio',
                value: 'Good',
                trend: 'up',
                trendValue: '+2%',
                advisorNote: "Budgets are respected. Negotiate bulk procurement for savings.",
                datapoints: generateDatapoints('Cost Efficiency')
            },
            {
                id: 'kpi-6-5',
                title: 'Green Build Index',
                value: 'Gold',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Eco scores are good. Pursue higher certifications.",
                datapoints: generateDatapoints('Green Build')
            },
            {
                id: 'kpi-6-6',
                title: 'Rental Yield Sovereignty',
                value: '6%',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Yields are steady. Explore mixed-use models for growth.",
                datapoints: generateDatapoints('Rental Yield')
            },
            {
                id: 'kpi-6-7',
                title: 'Strategic Location Score',
                value: 'Prime',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Your locations are strong. Scout emerging global hubs early.",
                datapoints: generateDatapoints('Location Score')
            },
            {
                id: 'kpi-6-8',
                title: 'Capital Appreciation Index',
                value: '+8%',
                trend: 'up',
                trendValue: '+1%',
                advisorNote: "Values are rising. Long-term holds will maximize returns.",
                datapoints: generateDatapoints('Appreciation')
            },
            {
                id: 'kpi-6-9',
                title: 'Infrastructure Expansion Rate',
                value: 'Steady',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Expansion is healthy. Phase projects to balance cash flow.",
                datapoints: generateDatapoints('Expansion Rate')
            },
            {
                id: 'kpi-6-10',
                title: 'Smart Tech Penetration',
                value: '40%',
                trend: 'up',
                trendValue: '+5%',
                advisorNote: "Smart features are growing. Prioritize energy automation systems.",
                datapoints: generateDatapoints('Smart Tech')
            }
        ]
    },
    {
        id: 'pillar-7',
        title: 'Education & Talent Development',
        icon: GraduationCap,
        colorClass: 'text-sky-500',
        gradientClass: 'bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20',
        kpis: [
            {
                id: 'kpi-7-1',
                title: 'Enrolment Growth Index',
                value: '1,500',
                trend: 'up',
                trendValue: '+10%',
                advisorNote: "Enrolments are rising. Scholarships will attract high-potential students.",
                datapoints: generateDatapoints('Enrolment')
            },
            {
                id: 'kpi-7-2',
                title: 'Skill Attainment Quotient',
                value: '90%',
                trend: 'up',
                trendValue: '+2%',
                advisorNote: "Certifications are strong. Add emerging skills like AI literacy.",
                datapoints: generateDatapoints('Skill Attainment')
            },
            {
                id: 'kpi-7-3',
                title: 'Faculty Excellence Score',
                value: '4.7/5',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Faculty quality is high. Invest in global experts for key modules.",
                datapoints: generateDatapoints('Faculty Excellence')
            },
            {
                id: 'kpi-7-4',
                title: 'Knowledge Penetration Rate',
                value: '85%',
                trend: 'up',
                trendValue: '+3%',
                advisorNote: "Completion rates are steady. Personalized mentoring will raise them.",
                datapoints: generateDatapoints('Knowledge Penetration')
            },
            {
                id: 'kpi-7-5',
                title: 'Innovation in Curriculum',
                value: '2 New',
                trend: 'up',
                trendValue: '+1',
                advisorNote: "Curriculum evolves well. Add future-focused programs annually.",
                datapoints: generateDatapoints('Curriculum Innovation')
            },
            {
                id: 'kpi-7-6',
                title: 'Alumni Success Index',
                value: 'High',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Alumni shine. Create visible networks to inspire current students.",
                datapoints: generateDatapoints('Alumni Success')
            },
            {
                id: 'kpi-7-7',
                title: 'Digital Learning Penetration',
                value: '70%',
                trend: 'up',
                trendValue: '+5%',
                advisorNote: "Digital adoption is strong. Enhance mobile-first experiences.",
                datapoints: generateDatapoints('Digital Learning')
            },
            {
                id: 'kpi-7-8',
                title: 'Global Outreach Index',
                value: '5 Partners',
                trend: 'up',
                trendValue: '+1',
                advisorNote: "Global reach is expanding. Build partnerships with overseas universities.",
                datapoints: generateDatapoints('Global Outreach')
            },
            {
                id: 'kpi-7-9',
                title: 'Research & Publication Strength',
                value: '12 Papers',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Research output is fair. Fund more applied projects for industry use.",
                datapoints: generateDatapoints('Research Strength')
            },
            {
                id: 'kpi-7-10',
                title: 'Human Capital Legacy',
                value: 'Growing',
                trend: 'up',
                trendValue: 'Steady',
                advisorNote: "Leaders are emerging. Track their progress as a measure of impact.",
                datapoints: generateDatapoints('Human Capital')
            }
        ]
    },
    {
        id: 'pillar-8',
        title: 'Writings & Podcasts',
        icon: Mic,
        colorClass: 'text-orange-500',
        gradientClass: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
        kpis: [
            {
                id: 'kpi-8-1',
                title: 'Publication Sovereignty',
                value: '3 Books',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Your words are spreading. Target global publishers next.",
                datapoints: generateDatapoints('Publications')
            },
            {
                id: 'kpi-8-2',
                title: 'Podcast Velocity',
                value: '2/Month',
                trend: 'up',
                trendValue: '+1',
                advisorNote: "Episodes are consistent. Guest collaborations will add depth.",
                datapoints: generateDatapoints('Podcast Velocity')
            },
            {
                id: 'kpi-8-3',
                title: 'Media Penetration Index',
                value: 'High',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Your voice is heard. Diversify into visual media for reach.",
                datapoints: generateDatapoints('Media Penetration')
            },
            {
                id: 'kpi-8-4',
                title: 'Audience Engagement Quotient',
                value: '10k',
                trend: 'up',
                trendValue: '+1k',
                advisorNote: "Engagement is strong. Invite feedback to grow community.",
                datapoints: generateDatapoints('Audience Engagement')
            },
            {
                id: 'kpi-8-5',
                title: 'Intellectual Impact Score',
                value: 'High',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Your influence is felt. Citations will magnify authority.",
                datapoints: generateDatapoints('Impact Score')
            },
            {
                id: 'kpi-8-6',
                title: 'Cultural Penetration Rate',
                value: 'Growing',
                trend: 'up',
                trendValue: 'Steady',
                advisorNote: "Translations are working. Add local narrators for connection.",
                datapoints: generateDatapoints('Cultural Penetration')
            },
            {
                id: 'kpi-8-7',
                title: 'Content Excellence Index',
                value: '4.9/5',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Content is strong. Keep refining for timeless quality.",
                datapoints: generateDatapoints('Content Excellence')
            },
            {
                id: 'kpi-8-8',
                title: 'Subscriber Growth Rate',
                value: '+15%',
                trend: 'up',
                trendValue: '+2%',
                advisorNote: "Subscribers are loyal. Reward them with exclusive previews.",
                datapoints: generateDatapoints('Subscriber Growth')
            },
            {
                id: 'kpi-8-9',
                title: 'Platform Diversity Score',
                value: '4 Platforms',
                trend: 'up',
                trendValue: '+1',
                advisorNote: "You are everywhere. Optimize content for each specific channel.",
                datapoints: generateDatapoints('Platform Diversity')
            },
            {
                id: 'kpi-8-10',
                title: 'Legacy of Thought',
                value: 'Enduring',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Your ideas will last. Compile key works into a master anthology.",
                datapoints: generateDatapoints('Legacy of Thought')
            }
        ]
    },
    {
        id: 'pillar-9',
        title: 'Philanthropy & Social Impact',
        icon: Heart,
        colorClass: 'text-red-500',
        gradientClass: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
        kpis: [
            {
                id: 'kpi-9-1',
                title: 'Lives Impacted Index',
                value: '50,000',
                trend: 'up',
                trendValue: '+5k',
                advisorNote: "Impact is tangible. Focus on depth of change, not just breadth.",
                datapoints: generateDatapoints('Lives Impacted')
            },
            {
                id: 'kpi-9-2',
                title: 'Donation Efficiency Ratio',
                value: '95%',
                trend: 'up',
                trendValue: '+1%',
                advisorNote: "Funds reach the needy. Maintain low overheads for trust.",
                datapoints: generateDatapoints('Efficiency')
            },
            {
                id: 'kpi-9-3',
                title: 'Community Engagement Score',
                value: 'High',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Communities are involved. Empower local leaders to sustain projects.",
                datapoints: generateDatapoints('Community Engagement')
            },
            {
                id: 'kpi-9-4',
                title: 'Volunteer Mobilization',
                value: '500',
                trend: 'up',
                trendValue: '+50',
                advisorNote: "Volunteers are active. Recognize their service to boost morale.",
                datapoints: generateDatapoints('Volunteers')
            },
            {
                id: 'kpi-9-5',
                title: 'Sustainable Project Rate',
                value: '80%',
                trend: 'up',
                trendValue: '+5%',
                advisorNote: "Projects last. Ensure exit strategies are in place for independence.",
                datapoints: generateDatapoints('Sustainability')
            },
            {
                id: 'kpi-9-6',
                title: 'Global Aid Reach',
                value: '3 Regions',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Reach is focused. Deepen impact in current regions before expanding.",
                datapoints: generateDatapoints('Global Aid')
            },
            {
                id: 'kpi-9-7',
                title: 'Partnership Synergy Index',
                value: 'Strong',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Partners align well. Joint ventures will amplify resources.",
                datapoints: generateDatapoints('Partnership Synergy')
            },
            {
                id: 'kpi-9-8',
                title: 'Social Innovation Score',
                value: 'High',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Solutions are creative. Share models with other NGOs for scale.",
                datapoints: generateDatapoints('Social Innovation')
            },
            {
                id: 'kpi-9-9',
                title: 'Transparency Quotient',
                value: '100%',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "Trust is high. Publish annual impact reports for transparency.",
                datapoints: generateDatapoints('Transparency')
            },
            {
                id: 'kpi-9-10',
                title: 'Legacy of Giving',
                value: 'Eternal',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Giving is your hallmark. Endowments will ensure it lasts forever.",
                datapoints: generateDatapoints('Legacy of Giving')
            }
        ]
    },
    {
        id: 'pillar-10',
        title: 'Strategic Visionary',
        icon: Eye,
        colorClass: 'text-emerald-500',
        gradientClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
        kpis: [
            {
                id: 'kpi-10-1',
                title: 'Future Readiness Index',
                value: 'High',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "You see ahead. Scenario planning will sharpen your foresight.",
                datapoints: generateDatapoints('Future Readiness')
            },
            {
                id: 'kpi-10-2',
                title: 'Innovation Pipeline Strength',
                value: 'Robust',
                trend: 'up',
                trendValue: 'Steady',
                advisorNote: "Ideas are flowing. Filter ruthlessly to back the winners.",
                datapoints: generateDatapoints('Innovation Pipeline')
            },
            {
                id: 'kpi-10-3',
                title: 'Market Disruption Score',
                value: 'High',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "You disrupt norms. Protect your IP to secure the advantage.",
                datapoints: generateDatapoints('Market Disruption')
            },
            {
                id: 'kpi-10-4',
                title: 'Strategic Agility Quotient',
                value: 'Fast',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "You pivot well. Keep teams lean to maintain this speed.",
                datapoints: generateDatapoints('Strategic Agility')
            },
            {
                id: 'kpi-10-5',
                title: 'Global Influence Index',
                value: 'Growing',
                trend: 'up',
                trendValue: 'Steady',
                advisorNote: "Influence is widening. Thought leadership is your key tool.",
                datapoints: generateDatapoints('Global Influence')
            },
            {
                id: 'kpi-10-6',
                title: 'Network Power Score',
                value: 'Elite',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Your network is gold. Connect others to compound value.",
                datapoints: generateDatapoints('Network Power')
            },
            {
                id: 'kpi-10-7',
                title: 'Wisdom Application Rate',
                value: 'High',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "You apply what you learn. Teach others to embed wisdom.",
                datapoints: generateDatapoints('Wisdom Application')
            },
            {
                id: 'kpi-10-8',
                title: 'Long-term Value Creation',
                value: 'High',
                trend: 'up',
                trendValue: 'Rising',
                advisorNote: "Value is compounding. Patience is your greatest asset here.",
                datapoints: generateDatapoints('Long-term Value')
            },
            {
                id: 'kpi-10-9',
                title: 'Risk Intelligence Score',
                value: 'High',
                trend: 'neutral',
                trendValue: 'Stable',
                advisorNote: "You manage risk well. Take calculated bets for big wins.",
                datapoints: generateDatapoints('Risk Intelligence')
            },
            {
                id: 'kpi-10-10',
                title: 'Visionary Legacy',
                value: 'Unfolding',
                trend: 'up',
                trendValue: 'Steady',
                advisorNote: "Your vision is taking shape. Document the journey for posterity.",
                datapoints: generateDatapoints('Visionary Legacy')
            }
        ]
    }
];

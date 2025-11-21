import triadBlueLockup from "@assets/TriadBlue-Logo-Lockup_1763606084811.png";
import businessBlueprintLogo from "@assets/BluePrint Header Logo minus io_1763756646639.png";
import hostsBlueLogo from "@assets/archive/HostsBlue Logo_1762989341854.png";
import swipesBlueLogo from "@assets/archive/SwipesBlue Logo_1762989341855.png";
import consoleBlueLogo from "@assets/ConsoleBlue-logo_1763756605648.png";
import consoleBlueDashboardButton from "@assets/ConsoleBlue dahsboard_1763759339561.png";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Zap, Shield, Globe } from "lucide-react";
import { useActiveLogo } from "@/hooks/use-active-logo";

export default function Landing() {
  const currentYear = new Date().getFullYear();
  const { logoUrl } = useActiveLogo();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container landing-row">
          <div className="landing-brand">
            <img src={logoUrl || triadBlueLockup} alt="TriadBlue Logo" />
          </div>
          <nav className="landing-nav">
            <a href="#platforms">Platforms</a>
            <a href="#blueprint">BusinessBlueprint</a>
            <a href="#hosts">HostsBlue</a>
            <a href="#swipes">SwipesBlue</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="landing-actions">
            <Link href="/demo" className="landing-cta-green" data-testid="link-demo-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px' }}>
              <img src={consoleBlueDashboardButton} alt="ConsoleBlue Dashboard" style={{ height: '40px', width: 'auto' }} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-circle"></div>
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <h1>Three Platforms.<br />One Unified Experience.</h1>
          <p className="landing-subhead">
            Diagnose your digital presence, power your infrastructure, and simplify payments—all inside a single, connected ecosystem built specifically for small and medium businesses.
          </p>
          
          <div className="landing-badges">
            <span className="landing-badge"><Zap size={16} style={{ display: 'inline', marginRight: '6px' }} />AI-Guided</span>
            <span className="landing-badge"><Shield size={16} style={{ display: 'inline', marginRight: '6px' }} />PCI Compliant</span>
            <span className="landing-badge"><CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />Secure Hosting</span>
            <span className="landing-badge"><Globe size={16} style={{ display: 'inline', marginRight: '6px' }} />Built for SMBs</span>
          </div>

          <div style={{ marginTop: '48px', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a className="landing-cta-yellow" href="https://businessblueprint.io" target="_blank" rel="noopener noreferrer">
              Start Your Blueprint
            </a>
            <a className="landing-cta-yellow" href="#platforms">
              Explore Platforms
            </a>
          </div>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* Platforms Overview */}
      <section id="platforms" className="landing-section landing-container">
        <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <h2>The Triad System</h2>
          <p className="landing-subhead">
            Your three essential dashboards—seamlessly linked—operating as one unified console for complete business management.
          </p>
        </div>
        
        <div className="landing-cards" style={{ marginTop: '48px' }}>
          <article className="landing-card">
            <a href="https://businessblueprint.io" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '20px' }}>
              <img src={businessBlueprintLogo} alt="BusinessBlueprint.io" style={{ height: '50px', width: 'auto' }} />
            </a>
            <p>
              Diagnose and prescribe your path to growth with a comprehensive Digital IQ™ score and custom strategic blueprint tailored to your business.
            </p>
            <a className="landing-mini-cta" href="#blueprint">
              Learn More <ArrowRight size={16} style={{ display: 'inline' }} />
            </a>
          </article>

          <article className="landing-card">
            <a href="https://hostsblue.com" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '20px' }}>
              <img src={hostsBlueLogo} alt="HostsBlue.com" style={{ height: '40px', width: 'auto' }} />
            </a>
            <p>
              Fast, secure cloud infrastructure—domains, SSL certificates, email, and hosting with one-click deployment and automated backups.
            </p>
            <a className="landing-mini-cta" href="#hosts">
              Learn More <ArrowRight size={16} style={{ display: 'inline' }} />
            </a>
          </article>

          <article className="landing-card">
            <a href="https://swipesblue.com" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '20px' }}>
              <img src={swipesBlueLogo} alt="SwipesBlue.com" style={{ height: '40px', width: 'auto' }} />
            </a>
            <p>
              Embedded payment processing online and in-person—subscriptions, invoices, and real-time tracking with PCI-compliant security.
            </p>
            <a className="landing-mini-cta" href="#swipes">
              Learn More <ArrowRight size={16} style={{ display: 'inline' }} />
            </a>
          </article>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* BusinessBlueprint Section */}
      <section id="blueprint" className="landing-section landing-container">
        <article className="landing-mod">
          <img src={businessBlueprintLogo} alt="BusinessBlueprint.io Platform Dashboard" />
          <div>
            <h2>BusinessBlueprint.io<br />Diagnose & Prescribe</h2>
            <ul>
              <li>Digital IQ™ report with prescriptive strategic blueprint</li>
              <li>Local SEO optimization, review management, and social media integration</li>
              <li>Flexible paths: DIY tools, managed services (MSP), or à-la-carte options</li>
              <li>Unified login with HostsBlue and SwipesBlue for seamless workflow</li>
            </ul>
            <div style={{ marginTop: '24px' }}>
              <a className="landing-cta-green" href="https://businessblueprint.io" target="_blank" rel="noopener noreferrer">
                Get Your Digital IQ™ Score
              </a>
            </div>
          </div>
        </article>
      </section>

      {/* HostsBlue Section */}
      <section id="hosts" className="landing-section landing-container">
        <article className="landing-mod">
          <img src={hostsBlueLogo} alt="HostsBlue.com Hosting Platform" />
          <div>
            <h2>HostsBlue.com<br />Power Your Presence</h2>
            <ul>
              <li>Fast, secure cloud hosting with enterprise-grade infrastructure</li>
              <li>Domain registration, DNS management, and SSL certificates</li>
              <li>Integrated email hosting with spam protection and analytics</li>
              <li>Website deployment, management, and automated daily backups</li>
            </ul>
            <div style={{ marginTop: '24px' }}>
              <a className="landing-cta-green" href="https://hostsblue.com" target="_blank" rel="noopener noreferrer">
                Launch Your Infrastructure
              </a>
            </div>
          </div>
        </article>
      </section>

      {/* SwipesBlue Section */}
      <section id="swipes" className="landing-section landing-container">
        <article className="landing-mod">
          <img src={swipesBlueLogo} alt="SwipesBlue.com Payment Platform" />
          <div>
            <h2>SwipesBlue.com<br />Simplify How You Get Paid</h2>
            <ul>
              <li>Online and in-person payment processing with unified reporting</li>
              <li>PCI-compliant architecture with bank-grade encryption</li>
              <li>Automated invoicing, subscription billing, and payment tracking</li>
              <li>Real-time analytics and seamless integration with BusinessBlueprint</li>
            </ul>
            <div style={{ marginTop: '24px' }}>
              <a className="landing-cta-green" href="https://swipesblue.com" target="_blank" rel="noopener noreferrer">
                Start Accepting Payments
              </a>
            </div>
          </div>
        </article>
      </section>

      <div className="landing-divider"></div>

      {/* Unified Flow Section */}
      <section className="landing-section landing-container">
        <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <h2>One Login. Linked Dashboards.<br />A Seamless Flow.</h2>
          <p className="landing-subhead">
            Move from visibility to infrastructure to payments without switching systems. Your business data flows automatically across all three platforms.
          </p>
        </div>
        
        <div className="landing-flow" style={{ marginTop: '48px' }}>
          <div className="landing-pill">Assess</div>
          <div className="landing-pill">Launch</div>
          <div className="landing-pill">Get Paid</div>
        </div>
      </section>

      {/* ConsoleBlue Section */}
      <section id="console" className="landing-section landing-container">
        <article className="landing-mod">
          <img src={consoleBlueLogo} alt="ConsoleBlue Development Platform" style={{ height: '50px', width: 'auto' }} />
          <div>
            <h2>ConsoleBlue<br />Where New Platforms Are Born</h2>
            <ul>
              <li>Custom SaaS development and AI-powered automation solutions</li>
              <li>Real-time data synchronization and white-label module creation</li>
              <li>Built to integrate seamlessly with Blueprint, HostsBlue, and SwipesBlue</li>
              <li>Centralized command center for managing all your TriadBlue services</li>
            </ul>
            <div style={{ marginTop: '24px' }}>
              <Link href="/login" className="landing-cta-green">
                Access ConsoleBlue Dashboard
              </Link>
            </div>
          </div>
        </article>
      </section>

      <div className="landing-divider"></div>

      {/* Value Proposition */}
      <section className="landing-section landing-container">
        <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <h2>Built for Owners Who Didn't Grow Up Online</h2>
          <p className="landing-subhead">
            We know technology can feel overwhelming. That's why we built TriadBlue to give you clarity, control, and confidence in your digital presence.
          </p>
        </div>
        
        <div className="landing-flow" style={{ marginTop: '48px' }}>
          <div className="landing-pill">Clarity</div>
          <div className="landing-pill">Control</div>
          <div className="landing-pill">Confidence</div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="landing-section landing-container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2>Frequently Asked Questions</h2>
        </div>
        
        <div className="landing-faq">
          <article className="landing-q">
            <h4>What is a Digital IQ™ score?</h4>
            <p>
              Your Digital IQ™ is a comprehensive snapshot of your online visibility, reputation, and digital readiness. We analyze dozens of factors to generate a prescriptive blueprint that shows you exactly what to improve and how.
            </p>
          </article>

          <article className="landing-q">
            <h4>How do the dashboards connect?</h4>
            <p>
              Unified login and linked data modules allow you to move seamlessly between BusinessBlueprint, HostsBlue, and SwipesBlue. Your information flows automatically—it feels like navigating pages within a single application.
            </p>
          </article>

          <article className="landing-q">
            <h4>Can I keep my current website and domain?</h4>
            <p>
              Absolutely. We can migrate your existing assets to HostsBlue infrastructure or connect them seamlessly. You maintain full ownership while gaining the benefits of our integrated platform.
            </p>
          </article>

          <article className="landing-q">
            <h4>How fast can I start accepting payments?</h4>
            <p>
              With SwipesBlue, most businesses can activate and begin processing payments within 24 hours, pending standard compliance review. We handle all the PCI complexity so you don't have to.
            </p>
          </article>

          <article className="landing-q">
            <h4>Do you offer done-for-me services?</h4>
            <p>
              Yes. We offer DIY tools for hands-on owners, fully managed services (MSP) for those who want expert support, and à-la-carte options for specific needs. You choose the level of involvement that works for you.
            </p>
          </article>

          <article className="landing-q">
            <h4>What makes TriadBlue different from other platforms?</h4>
            <p>
              Most platforms force you to piece together solutions from multiple vendors. TriadBlue gives you strategy, infrastructure, and payments in one connected system—built specifically for SMBs who want clarity without complexity.
            </p>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-logo-row" style={{ justifyContent: 'center' }}>
            <img src={businessBlueprintLogo} alt="BusinessBlueprint.io" />
            <img src={hostsBlueLogo} alt="HostsBlue.com" />
            <img src={swipesBlueLogo} alt="SwipesBlue.com" />
          </div>
          <p style={{ marginTop: '24px', fontSize: '0.9rem' }}>
            © {currentYear} TriadBlue. PCI Compliant • SSL Secure • Cloud Hosting • NMI Powered
          </p>
          <p style={{ marginTop: '12px', fontSize: '0.85rem' }}>
            <a href="https://businessblueprint.io/privacy" style={{ marginRight: '16px' }}>Privacy Policy</a>
            <a href="https://businessblueprint.io/terms" style={{ marginRight: '16px' }}>Terms of Service</a>
            <a href="mailto:support@triadblue.com">Contact Support</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

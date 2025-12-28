import triadBlueLockup from "@assets/TriadBlue-Logo-Lockup_1763606084811.png";
import businessBlueprintLogo from "@assets/BluePrint Header Logo minus io_1763756646639.png";
import hostsBlueLogo from "@assets/archive/HostsBlue Logo_1762989341854.png";
import swipesBlueLogo from "@assets/archive/SwipesBlue Logo_1762989341855.png";
import consoleBlueLogo from "@assets/ConsoleBlue-logo_1763756605648.png";
import consoleBlueDashboardButton from "@assets/ConsoleBlue dahsboard_1763759506138.png";
import relationshipsLogo from "@assets/__relationships_1766879925886.png";
import siteInspectorIcon from "@assets/SiteInspectorAgentIcon_1766861472435.png";
import promptBuilderLogo from "@assets/PromptBuilderLogo_1766878027777.png";
import localBlueLogo from "@assets/localblue_1766878739928.png";
import commverseLogo from "@assets/__commverse_bundle_logo_1766878686842.png";
import { ArrowRight, CheckCircle2, Zap, Shield, Globe, Construction, Clipboard, FileText, Bot, Users } from "lucide-react";
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
            <a href="#development">Development</a>
            <a href="/apps">Products</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="landing-actions">
            <a href="/login" className="landing-cta-green" data-testid="link-dashboard-login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px' }}>
              <img src={consoleBlueDashboardButton} alt="ConsoleBlue Dashboard" style={{ height: '40px', width: 'auto' }} />
            </a>
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
              Elevate local and small businesses through improved Local SEO performance in their markets. We Assess. We Prescribe. You Grow.
            </p>
            <a className="landing-mini-cta" href="#blueprint" data-testid="link-blueprint-learn-more">
              Learn More <ArrowRight size={16} style={{ display: 'inline' }} />
            </a>
          </article>

          <article className="landing-card" style={{ position: 'relative' }}>
            <span style={{ 
              position: 'absolute', 
              top: '12px', 
              right: '12px', 
              background: '#f59e0b', 
              color: '#000', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '0.7rem', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Construction size={12} /> Under Construction
            </span>
            <a href="https://hostsblue.com" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '20px' }}>
              <img src={hostsBlueLogo} alt="HostsBlue.com" style={{ height: '50px', width: 'auto' }} />
            </a>
            <p>
              Custom website builder, domain registration, transfer, and purchasing. Native platform hosting with WPMUDev partnership.
            </p>
            <a className="landing-mini-cta" href="#hosts" data-testid="link-hosts-learn-more">
              Learn More <ArrowRight size={16} style={{ display: 'inline' }} />
            </a>
          </article>

          <article className="landing-card" style={{ position: 'relative' }}>
            <span style={{ 
              position: 'absolute', 
              top: '12px', 
              right: '12px', 
              background: '#f59e0b', 
              color: '#000', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '0.7rem', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Construction size={12} /> Under Construction
            </span>
            <a href="https://swipesblue.com" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '20px' }}>
              <img src={swipesBlueLogo} alt="SwipesBlue.com" style={{ height: '50px', width: 'auto' }} />
            </a>
            <p>
              Proprietary payment processing with custom checkout pages and shopping carts. White-label affiliate program available.
            </p>
            <a className="landing-mini-cta" href="#swipes" data-testid="link-swipes-learn-more">
              Learn More <ArrowRight size={16} style={{ display: 'inline' }} />
            </a>
          </article>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* BusinessBlueprint Section */}
      <section id="blueprint" className="landing-section landing-container">
        <article className="landing-mod">
          <img src={businessBlueprintLogo} alt="BusinessBlueprint.io Platform Dashboard" style={{ height: '80px', width: 'auto' }} />
          <div>
            <h2>BusinessBlueprint.io<br />We Assess. We Prescribe. You Grow.</h2>
            <p style={{ marginBottom: '16px', color: '#9ca3af' }}>
              Elevate local and small businesses through improved Local SEO performance in their markets.
            </p>
            <h4 style={{ marginBottom: '12px', color: '#60a5fa' }}>A Blueprint to Your Growth:</h4>
            <ul>
              <li><Clipboard size={16} style={{ display: 'inline', marginRight: '8px', color: '#3b82f6' }} />Step 1: Complete Your Digital IQ Assessment</li>
              <li><FileText size={16} style={{ display: 'inline', marginRight: '8px', color: '#3b82f6' }} />Step 2: Prescribed Blueprint — custom action plan with SEO, content strategy, and revenue-focused steps</li>
              <li>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={localBlueLogo} alt="/localblue" style={{ height: '20px', width: 'auto' }} />
                  Step 3: Listings management + reputation building for stronger local visibility
                </span>
              </li>
              <li><Bot size={16} style={{ display: 'inline', marginRight: '8px', color: '#10b981' }} />Step 4: CoachBlue — 24/7 AI business coach guiding you through every step</li>
              <li>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={commverseLogo} alt="/commverse" style={{ height: '20px', width: 'auto' }} />
                  Step 5: Complete communication suite — /send, /inbox, /livechat, /content
                </span>
              </li>
            </ul>
            <p style={{ marginTop: '16px', fontSize: '0.9rem', color: '#9ca3af' }}>
              <strong>Technology:</strong> Business IQ Scanner powered by Google Business Intelligence
            </p>
            <div style={{ marginTop: '24px' }}>
              <a className="landing-cta-green" href="https://businessblueprint.io" target="_blank" rel="noopener noreferrer" data-testid="button-get-digital-iq">
                Get Your Digital IQ™ Score
              </a>
            </div>
          </div>
        </article>
      </section>

      {/* HostsBlue Section */}
      <section id="hosts" className="landing-section landing-container">
        <article className="landing-mod" style={{ position: 'relative' }}>
          <span style={{ 
            position: 'absolute', 
            top: '16px', 
            right: '16px', 
            background: '#f59e0b', 
            color: '#000', 
            padding: '6px 12px', 
            borderRadius: '6px', 
            fontSize: '0.8rem', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Construction size={14} /> Under Construction
          </span>
          <img src={hostsBlueLogo} alt="HostsBlue.com Hosting Platform" style={{ height: '80px', width: 'auto' }} />
          <div>
            <h2>HostsBlue.com<br />Power Your Presence</h2>
            <ul>
              <li>Custom website builder with drag-and-drop functionality</li>
              <li>Domain registration, transfer, and purchasing</li>
              <li>Native platform hosting for BusinessBlueprint users</li>
              <li>Partnership with WPMUDev.com for external hosting needs</li>
            </ul>
            <div style={{ marginTop: '24px' }}>
              <a className="landing-cta-green" href="https://hostsblue.com" target="_blank" rel="noopener noreferrer" data-testid="button-launch-infrastructure">
                Launch Your Infrastructure
              </a>
            </div>
          </div>
        </article>
      </section>

      {/* SwipesBlue Section */}
      <section id="swipes" className="landing-section landing-container">
        <article className="landing-mod" style={{ position: 'relative' }}>
          <span style={{ 
            position: 'absolute', 
            top: '16px', 
            right: '16px', 
            background: '#f59e0b', 
            color: '#000', 
            padding: '6px 12px', 
            borderRadius: '6px', 
            fontSize: '0.8rem', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Construction size={14} /> Under Construction
          </span>
          <img src={swipesBlueLogo} alt="SwipesBlue.com Payment Platform" style={{ height: '80px', width: 'auto' }} />
          <div>
            <h2>SwipesBlue.com<br />Simplify How You Get Paid</h2>
            <ul>
              <li>Proprietary payment processing — online and in-person</li>
              <li>Custom checkout pages and shopping carts</li>
              <li>White-label affiliate program for partners</li>
              <li>PCI-compliant architecture with bank-grade encryption</li>
            </ul>
            <p style={{ marginTop: '16px', fontSize: '0.9rem', color: '#60a5fa', fontWeight: '500' }}>
              Strategic Commitment: All TriadBlue businesses use SwipesBlue exclusively — no third-party gateways
            </p>
            <div style={{ marginTop: '24px' }}>
              <a className="landing-cta-green" href="https://swipesblue.com" target="_blank" rel="noopener noreferrer" data-testid="button-start-payments">
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

      <div className="landing-divider"></div>

      {/* Development Tools Section */}
      <section id="development" className="landing-section landing-container">
        <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <h2>Development Tools</h2>
          <p className="landing-subhead">
            The internal infrastructure powering the TriadBlue ecosystem — where platforms are built, managed, and optimized.
          </p>
        </div>
        
        <div className="landing-cards" style={{ marginTop: '48px' }}>
          <article className="landing-card">
            <a href="https://businessblueprint.io/relationships" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '20px' }}>
              <img src={relationshipsLogo} alt="/relationships" style={{ height: '40px', width: 'auto' }} />
            </a>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>businessblueprint.io/relationships</p>
            <p>
              <Users size={16} style={{ display: 'inline', marginRight: '6px', color: '#10b981' }} />
              Premier CRM — the hub for customer journey information. Single source of truth for all apps, incorporating every BusinessBlueprint feature.
            </p>
            <a className="landing-mini-cta" href="https://businessblueprint.io/relationships" target="_blank" rel="noopener noreferrer" data-testid="link-relationships">
              Learn More <ArrowRight size={16} style={{ display: 'inline' }} />
            </a>
          </article>

          <article className="landing-card">
            <a href="https://agentinspector.dev" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '20px' }}>
              <img src={siteInspectorIcon} alt="SiteInspector" style={{ height: '50px', width: 'auto' }} />
            </a>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>agentinspector.dev</p>
            <p>
              QA and evaluation tool powered by DeepSeek.com AI. Evaluates website development progress and provides actionable feedback on completion requirements.
            </p>
            <a className="landing-mini-cta" href="https://agentinspector.dev" target="_blank" rel="noopener noreferrer" data-testid="link-siteinspector">
              Learn More <ArrowRight size={16} style={{ display: 'inline' }} />
            </a>
          </article>

          <article className="landing-card">
            <a href="https://aiprompt.builders" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '20px' }}>
              <img src={promptBuilderLogo} alt="AIPrompt.Builders" style={{ height: '50px', width: 'auto' }} />
            </a>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>aiprompt.builders</p>
            <p>
              Prompt building application powered by Claude from Anthropic. Developed to support and enhance the broader TriadBlue ecosystem.
            </p>
            <a className="landing-mini-cta" href="https://aiprompt.builders" target="_blank" rel="noopener noreferrer" data-testid="link-aipromptbuilders">
              Learn More <ArrowRight size={16} style={{ display: 'inline' }} />
            </a>
          </article>

          <article className="landing-card">
            <a href="https://console.blue" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '20px' }}>
              <img src={consoleBlueLogo} alt="Console.Blue" style={{ height: '50px', width: 'auto' }} />
            </a>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>console.blue</p>
            <p>
              Internal operations interface — the central nervous system for the entire ecosystem. Enables seamless global integration across all platforms.
            </p>
            <a href="/demo" className="landing-mini-cta" data-testid="link-consoleblue">
              Access Demo <ArrowRight size={16} style={{ display: 'inline' }} />
            </a>
          </article>
        </div>
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

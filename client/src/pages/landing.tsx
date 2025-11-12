import triadBlueLockup from "@assets/triadblue-lockup.png";
import businessBlueprintLockup from "@assets/businessblueprint-lockup.png";
import hostsBlueLockup from "@assets/hostsblue-lockup.png";
import swipesBlueLockup from "@assets/swipesblue-lockup.png";
import consoleBlueLockup from "@assets/consoleblue-lockup.png";
import { Link } from "wouter";

export default function Landing() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container landing-row">
          <div className="landing-brand">
            <img src={triadBlueLockup} alt="TriadBlue" />
            <strong>TriadBlue</strong>
          </div>
          <nav className="landing-nav">
            <a href="#blueprint">BusinessBlueprint</a>
            <a href="#hosts">HostsBlue</a>
            <a href="#swipes">SwipesBlue</a>
            <a href="#console">ConsoleBlue</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="landing-actions">
            <Link href="/login" className="landing-cta">
              Dashboard Login
            </Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-circle"></div>
        <div className="landing-container">
          <h1>Three Platforms. One Experience.</h1>
          <p className="landing-subhead">
            Diagnose &amp; prescribe your digital Blueprint, power your presence, and simplify how you get paid—inside a single, connected system built for SMBs.
          </p>
          <div className="landing-badges">
            <span className="landing-badge">AI‑Guided</span>
            <span className="landing-badge">PCI Compliant</span>
            <span className="landing-badge">Secure Hosting</span>
            <span className="landing-badge">Built for SMBs</span>
          </div>
          <div className="landing-logo-row">
            <img src={businessBlueprintLockup} alt="BusinessBlueprint.io" />
            <img src={hostsBlueLockup} alt="HostsBlue.com" />
            <img src={swipesBlueLockup} alt="SwipesBlue.com" />
          </div>
          <div style={{ marginTop: '22px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a className="landing-cta" href="https://businessblueprint.io" target="_blank" rel="noopener noreferrer">
              Start Your Blueprint
            </a>
            <a className="landing-cta landing-secondary" href="#system">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      <div className="landing-divider"></div>

      <section id="system" className="landing-section landing-container">
        <h2>The Triad System</h2>
        <p className="landing-subhead">Your three essential dashboards—linked together—so it feels like one multi‑page console.</p>
        <div className="landing-cards">
          <div className="landing-card">
            <h3>BusinessBlueprint.io</h3>
            <p>Diagnose &amp; prescribe your path to growth with a Digital IQ™ score and a custom Blueprint.</p>
            <a className="landing-mini-cta" href="#blueprint">Open Dashboard ▶</a>
          </div>
          <div className="landing-card">
            <h3>HostsBlue.com</h3>
            <p>Fast, secure infrastructure—domains, SSL, email, and hosting with one‑click deploy &amp; backups.</p>
            <a className="landing-mini-cta" href="#hosts">Open Dashboard ▶</a>
          </div>
          <div className="landing-card">
            <h3>SwipesBlue.com</h3>
            <p>Embedded payments online &amp; in‑person—subscriptions, invoices, and real‑time tracking.</p>
            <a className="landing-mini-cta" href="#swipes">Open Dashboard ▶</a>
          </div>
        </div>
      </section>

      <div className="landing-divider"></div>

      <section id="blueprint" className="landing-section landing-container landing-mod">
        <img src={businessBlueprintLockup} alt="BusinessBlueprint.io" />
        <div>
          <h2>BusinessBlueprint.io — Diagnose &amp; Prescribe</h2>
          <ul>
            <li>Digital IQ™ report &amp; prescriptive Blueprint</li>
            <li>Local SEO, Reviews, Social add‑ons</li>
            <li>DIY → MSP paths; unified login with HostsBlue &amp; SwipesBlue</li>
          </ul>
          <div style={{ marginTop: '14px' }}>
            <a className="landing-cta" href="https://businessblueprint.io" target="_blank" rel="noopener noreferrer">
              Get Your Digital IQ™
            </a>
          </div>
        </div>
      </section>

      <section id="hosts" className="landing-section landing-container landing-mod">
        <img src={hostsBlueLockup} alt="HostsBlue.com" />
        <div>
          <h2>HostsBlue.com — Power Your Presence</h2>
          <ul>
            <li>Fast, secure cloud hosting</li>
            <li>Domains, DNS &amp; SSL • Integrated email</li>
            <li>Website deploy, management &amp; backups</li>
          </ul>
          <div style={{ marginTop: '14px' }}>
            <a className="landing-cta" href="https://hostsblue.com" target="_blank" rel="noopener noreferrer">
              Power Your Hosting
            </a>
          </div>
        </div>
      </section>

      <section id="swipes" className="landing-section landing-container landing-mod">
        <img src={swipesBlueLockup} alt="SwipesBlue.com" />
        <div>
          <h2>SwipesBlue.com — Simplify How You Get Paid</h2>
          <ul>
            <li>Online &amp; in‑person payment processing</li>
            <li>PCI‑compliant architecture</li>
            <li>Invoices, subscriptions &amp; real‑time tracking</li>
          </ul>
          <div style={{ marginTop: '14px' }}>
            <a className="landing-cta" href="https://swipesblue.com" target="_blank" rel="noopener noreferrer">
              Accept Payments
            </a>
          </div>
        </div>
      </section>

      <div className="landing-divider"></div>

      <section className="landing-section landing-container">
        <h2>One Login. Linked Dashboards. A Seamless Flow.</h2>
        <p className="landing-subhead">Move from visibility → infrastructure → payments without switching systems.</p>
        <div className="landing-flow">
          <div className="landing-pill">Assess</div>
          <div className="landing-pill">Launch</div>
          <div className="landing-pill">Get Paid</div>
        </div>
      </section>

      <section id="console" className="landing-section landing-container landing-mod">
        <img src={consoleBlueLockup} alt="ConsoleBlue" />
        <div>
          <h2>ConsoleBlue — Where New Platforms Are Born</h2>
          <ul>
            <li>Custom SaaS &amp; AI automations</li>
            <li>Real‑time data &amp; white‑label modules</li>
            <li>Built to plug into Blueprint, HostsBlue &amp; SwipesBlue</li>
          </ul>
          <div style={{ marginTop: '14px' }}>
            <Link href="/login" className="landing-cta">
              Access Dashboard
            </Link>
          </div>
        </div>
      </section>

      <div className="landing-divider"></div>

      <section className="landing-section landing-container">
        <h2>Built for Owners Who Didn't Grow Up Online</h2>
        <div className="landing-flow">
          <div className="landing-pill">Clarity</div>
          <div className="landing-pill">Control</div>
          <div className="landing-pill">Confidence</div>
        </div>
      </section>

      <section id="faq" className="landing-section landing-container">
        <h2>FAQ</h2>
        <div className="landing-faq">
          <div className="landing-q">
            <h4>What is a Digital IQ™ score?</h4>
            <p>Your snapshot of online visibility, reputation and readiness—used to generate your prescriptive Blueprint.</p>
          </div>
          <div className="landing-q">
            <h4>How do the dashboards connect?</h4>
            <p>Unified login and linked modules let you move between BusinessBlueprint, HostsBlue and SwipesBlue like one multi‑page console.</p>
          </div>
          <div className="landing-q">
            <h4>Can I keep my current site/domain?</h4>
            <p>Yes. We can migrate or connect existing assets to HostsBlue infrastructure.</p>
          </div>
          <div className="landing-q">
            <h4>How fast can I start taking payments?</h4>
            <p>With SwipesBlue, most businesses can activate and begin processing in as little as a day, pending compliance review.</p>
          </div>
          <div className="landing-q">
            <h4>Do you offer done‑for‑me services?</h4>
            <p>Yes—DIY, Managed (MSP), and À‑la‑Carte paths are available.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-logo-row">
            <img src={businessBlueprintLockup} alt="BusinessBlueprint.io" />
            <img src={hostsBlueLockup} alt="HostsBlue.com" />
            <img src={swipesBlueLockup} alt="SwipesBlue.com" />
          </div>
          <p style={{ marginTop: '12px', color: '#9aa3ff' }}>
            © {currentYear} TriadBlue. PCI • SSL • Cloud Hosting • NMI Powered
          </p>
        </div>
      </footer>
    </div>
  );
}

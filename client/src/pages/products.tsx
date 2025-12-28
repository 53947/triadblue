import { Link } from "wouter";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import triadBlueLockup from "@assets/TriadBlue-Logo-Lockup_1763606084811.png";
import relationshipsLogo from "@assets/__relationships_1766879925886.png";
import relationshipsIcon from "@assets/__relationships_1766879158723.png";
import localBlueLogo from "@assets/localblue_1766878739928.png";
import listingsLogo from "@assets/listings_1766878739926.png";
import reputationLogo from "@assets/reputation_1766878739929.png";
import commverseLogo from "@assets/__commverse_bundle_logo_1766878686842.png";
import sendLogo from "@assets/send_1766878706842.png";
import inboxLogo from "@assets/inbox_1766878706844.png";
import livechatLogo from "@assets/livechat_1766878706844.png";
import contentLogo from "@assets/content_1766878706844.png";
import mealPrepProLogo from "@assets/MealPrepPro_1766881427942.png";
import { useActiveLogo } from "@/hooks/use-active-logo";

export default function Products() {
  const currentYear = new Date().getFullYear();
  const { logoUrl } = useActiveLogo();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container landing-row">
          <div className="landing-brand">
            <Link href="/">
              <img src={logoUrl || triadBlueLockup} alt="TriadBlue Logo" />
            </Link>
          </div>
          <nav className="landing-nav">
            <Link href="/">Home</Link>
            <a href="#free">Free</a>
            <a href="#bundles">Bundles</a>
            <a href="#apps">Apps</a>
          </nav>
          <div className="landing-actions">
            <Link href="/" className="landing-mini-cta" data-testid="link-back-home">
              <ArrowLeft size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero" style={{ paddingBottom: '48px' }}>
        <div className="landing-circle"></div>
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <h1>Products & Pricing</h1>
          <p className="landing-subhead">
            Complete tools for local business growth — from free assessments to full-featured bundles.
          </p>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* FREE TIER */}
      <section id="free" className="landing-section landing-container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ color: '#10b981' }}>Free Tier</h2>
          <p className="landing-subhead">Get started at no cost</p>
        </div>

        <div className="landing-cards">
          <article className="landing-card" style={{ border: '2px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Sparkles size={32} style={{ color: '#10b981' }} />
              <div>
                <h3 style={{ margin: 0 }}>Digital IQ Assessment</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Free Business Intelligence Tool</p>
              </div>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '12px' }}>Free</p>
            <p>Discover your business opportunities with a comprehensive digital footprint analysis.</p>
            <a className="landing-cta-green" href="https://businessblueprint.io" target="_blank" rel="noopener noreferrer" data-testid="button-start-assessment" style={{ marginTop: '16px', display: 'inline-block' }}>
              Start Assessment
            </a>
          </article>

          <article className="landing-card" style={{ border: '2px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img src={relationshipsIcon} alt="/relationships" style={{ height: '40px', width: 'auto' }} />
              <div>
                <img src={relationshipsLogo} alt="/relationships" style={{ height: '24px', width: 'auto' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Starter</p>
              </div>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '12px' }}>Free</p>
            <p>Contacts, companies, scheduler — your CRM foundation at no cost.</p>
            <a className="landing-cta-green" href="https://businessblueprint.io/relationships" target="_blank" rel="noopener noreferrer" data-testid="button-get-started-relationships" style={{ marginTop: '16px', display: 'inline-block' }}>
              Get Started
            </a>
          </article>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* CUSTOMER RELATIONSHIPS */}
      <section className="landing-section landing-container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2>Customer Relationships</h2>
          <p className="landing-subhead">Your premier CRM solution</p>
        </div>

        <div className="landing-cards" style={{ justifyContent: 'center' }}>
          <article className="landing-card" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img src={relationshipsIcon} alt="/relationships" style={{ height: '40px', width: 'auto' }} />
              <div>
                <img src={relationshipsLogo} alt="/relationships" style={{ height: '24px', width: 'auto' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Performance</p>
              </div>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '12px' }}>$29<span style={{ fontSize: '1rem', color: '#9ca3af' }}>/mo</span></p>
            <p>Full CRM capabilities — the hub for customer journey information and single source of truth for all apps.</p>
            <a className="landing-cta-yellow" href="https://businessblueprint.io/relationships" target="_blank" rel="noopener noreferrer" data-testid="button-upgrade-relationships" style={{ marginTop: '16px', display: 'inline-block' }}>
              Learn More
            </a>
          </article>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* AI COACH */}
      <section className="landing-section landing-container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2>AI Business Coach</h2>
          <p className="landing-subhead">24/7 guidance for your growth journey</p>
        </div>

        <div className="landing-cards" style={{ justifyContent: 'center' }}>
          <article className="landing-card" style={{ maxWidth: '400px', border: '2px solid #8b5cf6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Sparkles size={32} style={{ color: '#8b5cf6' }} />
              <div>
                <h3 style={{ margin: 0 }}>CoachBlue</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>AI Business Coach</p>
              </div>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '12px' }}>$99<span style={{ fontSize: '1rem', color: '#9ca3af' }}>/mo</span></p>
            <p>AI-powered coaching that tutors you on product usage, data interpretation, and successful strategies.</p>
            <a className="landing-cta-yellow" href="https://businessblueprint.io" target="_blank" rel="noopener noreferrer" data-testid="button-get-coachblue" style={{ marginTop: '16px', display: 'inline-block' }}>
              Learn More
            </a>
          </article>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* BUNDLES */}
      <section id="bundles" className="landing-section landing-container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2>Bundles</h2>
          <p className="landing-subhead">Save money with our bundled solutions</p>
        </div>

        {/* LocalBlue Bundle */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <img src={localBlueLogo} alt="LocalBlue Bundle" style={{ height: '40px', width: 'auto' }} />
            <span style={{ background: '#3b82f6', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
              $59/mo — Save $21!
            </span>
          </div>
          <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '24px' }}>Includes both applications below</p>
          
          <div className="landing-cards" style={{ justifyContent: 'center' }}>
            <article className="landing-card" style={{ maxWidth: '280px' }}>
              <img src={listingsLogo} alt="/listings" style={{ height: '30px', width: 'auto', marginBottom: '12px' }} />
              <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '8px' }}>$40/mo individually</p>
              <p>Multi-channel consistency management for optimal SEO across the internet.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: '#10b981' }}>
                <Check size={16} /> Included in bundle
              </div>
            </article>

            <article className="landing-card" style={{ maxWidth: '280px' }}>
              <img src={reputationLogo} alt="/reputation" style={{ height: '30px', width: 'auto', marginBottom: '12px' }} />
              <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '8px' }}>$40/mo individually</p>
              <p>Ratings and reviews management for stronger local visibility.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: '#10b981' }}>
                <Check size={16} /> Included in bundle
              </div>
            </article>
          </div>
        </div>

        {/* CommVerse Bundle */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <img src={commverseLogo} alt="CommVerse Bundle" style={{ height: '40px', width: 'auto' }} />
            <span style={{ background: '#f97316', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
              $99/mo — Save $41!
            </span>
          </div>
          <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '24px' }}>Complete communications universe — includes all 4 applications below</p>
          
          <div className="landing-cards" style={{ justifyContent: 'center' }}>
            <article className="landing-card" style={{ maxWidth: '220px' }}>
              <img src={sendLogo} alt="/send" style={{ height: '30px', width: 'auto', marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', color: '#9ca3af', marginBottom: '8px' }}>$35/mo</p>
              <p style={{ fontSize: '0.9rem' }}>Email/SMS campaign management</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: '#10b981', fontSize: '0.85rem' }}>
                <Check size={14} /> Included
              </div>
            </article>

            <article className="landing-card" style={{ maxWidth: '220px' }}>
              <img src={inboxLogo} alt="/inbox" style={{ height: '30px', width: 'auto', marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', color: '#9ca3af', marginBottom: '8px' }}>$35/mo</p>
              <p style={{ fontSize: '0.9rem' }}>Universal communications hub</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: '#10b981', fontSize: '0.85rem' }}>
                <Check size={14} /> Included
              </div>
            </article>

            <article className="landing-card" style={{ maxWidth: '220px' }}>
              <img src={livechatLogo} alt="/livechat" style={{ height: '30px', width: 'auto', marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', color: '#9ca3af', marginBottom: '8px' }}>$35/mo</p>
              <p style={{ fontSize: '0.9rem' }}>Website chat widget</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: '#10b981', fontSize: '0.85rem' }}>
                <Check size={14} /> Included
              </div>
            </article>

            <article className="landing-card" style={{ maxWidth: '220px' }}>
              <img src={contentLogo} alt="/content" style={{ height: '30px', width: 'auto', marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', color: '#9ca3af', marginBottom: '8px' }}>$35/mo</p>
              <p style={{ fontSize: '0.9rem' }}>Social media scheduling</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: '#10b981', fontSize: '0.85rem' }}>
                <Check size={14} /> Included
              </div>
            </article>
          </div>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* SUBSCRIPTION APPS */}
      <section id="apps" className="landing-section landing-container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2>Subscription Apps</h2>
          <p className="landing-subhead">Standalone applications built by TriadBlue</p>
        </div>

        <div className="landing-cards" style={{ justifyContent: 'center' }}>
          <article className="landing-card" style={{ maxWidth: '320px' }}>
            <a href="https://mealpreppro.kitchen" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '16px' }}>
              <img src={mealPrepProLogo} alt="MealPrepPro" style={{ height: '40px', width: 'auto' }} />
            </a>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>mealpreppro.kitchen</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9ca3af', marginBottom: '12px' }}>Pricing TBD</p>
            <p>Meal prep planning application for health-conscious individuals and families.</p>
            <a className="landing-mini-cta" href="https://mealpreppro.kitchen" target="_blank" rel="noopener noreferrer" data-testid="link-mealpreppro">
              Visit Site
            </a>
          </article>

          <article className="landing-card" style={{ maxWidth: '320px' }}>
            <a href="https://listit.blue" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '16px' }}>
              <h3 style={{ color: '#3b82f6', margin: 0 }}>ListIt</h3>
            </a>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>listit.blue</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9ca3af', marginBottom: '12px' }}>Pricing TBD</p>
            <p>List management application for organized task tracking and productivity.</p>
            <a className="landing-mini-cta" href="https://listit.blue" target="_blank" rel="noopener noreferrer" data-testid="link-listit">
              Visit Site
            </a>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <p style={{ fontSize: '0.9rem' }}>
            © {currentYear} TriadBlue. All products and pricing subject to change.
          </p>
          <p style={{ marginTop: '12px', fontSize: '0.85rem' }}>
            <Link href="/" style={{ marginRight: '16px' }}>Home</Link>
            <a href="https://businessblueprint.io/privacy" style={{ marginRight: '16px' }}>Privacy Policy</a>
            <a href="https://businessblueprint.io/terms" style={{ marginRight: '16px' }}>Terms of Service</a>
            <a href="mailto:support@triadblue.com">Contact Support</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

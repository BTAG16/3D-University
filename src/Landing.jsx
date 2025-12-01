import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronRight, Play, Check, Menu, X, Star, Globe, Shield, Zap } from 'lucide-react';
import { InteractiveMap } from './components/InteractiveMap';
import { MagneticButton } from './components/ui/MagneticButton';
import { FEATURES, STATS, TESTIMONIALS, PRICING } from './constants';
import './Landing.css';

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Custom Cursor Logic
  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: 'white', overflow: 'hidden' }}>
      
      {/* Progress Bar */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(to right, var(--primary), var(--accent))',
          transformOrigin: '0%',
          zIndex: 50,
          scaleX
        }}
      />

      {/* Custom Cursor Follower (Subtle Glow) */}
      <div 
        style={{ 
          position: 'fixed',
          width: '600px',
          height: '600px',
          background: 'rgba(102, 126, 234, 0.2)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: -1,
          left: mousePosition.x - 300, 
          top: mousePosition.y - 300,
          transition: 'transform 0.1s ease-out',
          mixBlendMode: 'screen'
        }} 
      />

      {/* Navigation */}
      <nav className="navbar">
        <div className="container" style={{ height: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2" style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '-0.025em' }}>
            <div style={{ width: '2rem', height: '2rem', background: 'linear-gradient(to top right, var(--primary), var(--accent))', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '1.125rem' }}>C</span>
            </div>
            <span>Campus Explorer</span>
          </div>

          {/* Desktop Nav */}
          <div className="md-flex items-center gap-8" style={{ display: 'none' }}>
            {/* The md-flex class in CSS handles display:flex on desktop, overriding style display:none */}
            <a href="#features" className="nav-link">Features</a>
            <a href="#benefits" className="nav-link">Benefits</a>
            <a href="#testimonials" className="nav-link">Stories</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <MagneticButton variant="outline" className="text-xs" style={{ padding: '0.5rem 1.5rem' }}>
              Sign In
            </MagneticButton>
            <MagneticButton className="text-xs" style={{ padding: '0.5rem 1.5rem' }}>
              Get Started
            </MagneticButton>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md-hidden" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md-hidden"
            style={{ position: 'fixed', inset: 0, zIndex: 30, backgroundColor: 'var(--bg-dark)', paddingTop: '6rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
          >
            <div className="flex flex-col gap-6" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
              <a href="#features" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>Features</a>
              <a href="#benefits" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>Benefits</a>
              <a href="#testimonials" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>Testimonials</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>Pricing</a>
              <hr style={{ borderColor: '#1f2937' }} />
              <MagneticButton className="justify-center" style={{ width: '100%' }}>Get Started Free</MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="hero-section container">
        <div className="grid grid-cols-1 lg-grid-cols-2 gap-12 items-center">
          <div style={{ position: 'relative', zIndex: 10 }}>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md-text-7xl font-extrabold"
              style={{ lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}
            >
              Explore Campus <br />
              <span className="heading-gradient">
                In a New Dimension
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted md-text-xl"
              style={{ marginBottom: '2rem', maxWidth: '32rem', lineHeight: 1.625, fontSize: '1.125rem' }}
            >
              Empower students with immersive 3D maps, real-time navigation, and instant room search. The digital twin your university deserves.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex"
              style={{ flexWrap: 'wrap', gap: '1rem' }}
            >
              <MagneticButton onClick={() => navigate("/admin/login")}>
                Get Started Free <ChevronRight size={16} />
              </MagneticButton>
              <MagneticButton variant="outline"  onClick={() => navigate("/demo")}>
                <Play size={16} fill="currentColor" /> Try Demo
              </MagneticButton>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-4 text-muted text-sm"
              style={{ marginTop: '3rem' }}
            >
              <div className="flex" style={{ marginLeft: '0.75rem' }}>
                {[1, 2, 3, 4].map((i) => (
                  <img key={i} src={`https://picsum.photos/40/40?random=${i}`} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '2px solid var(--bg-dark)', marginLeft: '-0.75rem' }} alt="User" />
                ))}
              </div>
              <p>Trusted by 500+ universities worldwide</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
            style={{ position: 'relative', zIndex: 10 }}
          >
            <InteractiveMap />
          </motion.div>
        </div>

        {/* Background Beams */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '1000px', height: '500px', background: 'rgba(102, 126, 234, 0.2)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none', zIndex: -10, mixBlendMode: 'screen', opacity: 0.5 }} />
      </section>

      {/* Features Grid */}
      <section id="features" className="section-padding" style={{ position: 'relative' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '5rem' }}>
            <h2 className="text-3xl md-text-5xl font-bold" style={{ marginBottom: '1.5rem' }}>Everything you need to <br/> navigate the future</h2>
            <p className="text-muted" style={{ maxWidth: '42rem', margin: '0 auto' }}>Full-stack campus mapping infrastructure designed for scale.</p>
          </div>

          <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card feature-card"
                style={{ padding: '2rem', borderRadius: '1rem', transition: 'border-color 0.3s' }}
              >
                <div className="feature-icon-wrapper" style={{ color: feature.color }}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold" style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{feature.title}</h3>
                <p className="text-muted text-sm" style={{ lineHeight: 1.625 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="section-padding" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))' }}>
        <div className="container grid grid-cols-1 lg-grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ position: 'relative' }}
          >
            <div className="animate-pulse-slow" style={{ position: 'absolute', inset: '-1rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', borderRadius: '0.75rem', filter: 'blur(24px)', opacity: 0.2 }}></div>
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000" 
              alt="Students using app" 
              style={{ position: 'relative', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', zIndex: 10, width: '100%', display: 'block' }}
            />
            {/* Floating Widgets */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="glass-card"
              style={{ position: 'absolute', right: '-2rem', bottom: '-2rem', padding: '1rem', borderRadius: '0.75rem', zIndex: 20, width: '12rem' }}
            >
              <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#4ade80' }}></div>
                <span className="text-xs font-bold">Class in 10 min</span>
              </div>
              <div className="text-xs text-muted">Route optimized for lowest walking time.</div>
            </motion.div>
          </motion.div>
          
          <div style={{ paddingLeft: '2rem' }}>
            <h2 className="text-3xl md-text-4xl font-bold" style={{ marginBottom: '2rem' }}>Why top universities choose us</h2>
            <div className="flex flex-col gap-6">
              {[
                { title: "Increase Student Engagement", desc: "Interactive maps gamify the campus discovery process." },
                { title: "Reduce Administrative Load", desc: "Automated timetables reduce 'where is my class' emails." },
                { title: "Accessibility Compliance", desc: "Native support for wheelchair-friendly routing." },
                { title: "Real-time Event Updates", desc: "Push temporary closures or event locations instantly." },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'rgba(102, 126, 234, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.25rem' }}>
                    <Check size={16} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 className="font-bold" style={{ fontSize: '1.125rem' }}>{item.title}</h4>
                    <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{ marginTop: '2.5rem' }}>
              <MagneticButton>Schedule a Consultation</MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <div className="container grid grid-cols-2 md-grid-cols-4 gap-8">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div 
                className="text-4xl md-text-5xl font-extrabold" 
                style={{ 
                  background: 'linear-gradient(to bottom, white, rgba(255,255,255,0.5))', 
                  WebkitBackgroundClip: 'text', 
                  backgroundClip: 'text', 
                  color: 'transparent',
                  marginBottom: '0.5rem' 
                }}
              >
                {stat.value}{stat.suffix}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section-padding" style={{ overflow: 'hidden' }}>
        <div className="container text-center" style={{ marginBottom: '4rem' }}>
          <h2 className="text-3xl md-text-5xl font-bold">Loved by admins & students</h2>
        </div>
        
        <div style={{ position: 'relative' }}>
          {/* Gradient Masks */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '8rem', background: 'linear-gradient(to right, var(--bg-dark), transparent)', zIndex: 10 }}></div>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '8rem', background: 'linear-gradient(to left, var(--bg-dark), transparent)', zIndex: 10 }}></div>

          {/* Marquee */}
          <motion.div 
            className="flex gap-6"
            style={{ width: 'max-content' }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
              <div key={`${t.id}-${idx}`} className="glass-card" style={{ width: '400px', padding: '2rem', borderRadius: '1rem', flexShrink: 0 }}>
                <div className="flex gap-1" style={{ marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#eab308" color="#eab308" />)}
                </div>
                <p style={{ fontSize: '1.125rem', color: '#d1d5db', marginBottom: '1.5rem', lineHeight: 1.6 }}>"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.author} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }} />
                  <div>
                    <div className="font-bold">{t.author}</div>
                    <div className="text-xs text-muted">{t.role}, {t.university}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding container">
        <div className="text-center" style={{ marginBottom: '5rem' }}>
          <h2 className="text-3xl md-text-5xl font-bold" style={{ marginBottom: '1rem' }}>Transparent Pricing</h2>
          <p className="text-muted">Choose the plan that fits your campus size.</p>
        </div>

        <div className="grid grid-cols-1 md-grid-cols-3 gap-8" style={{ alignItems: 'flex-start' }}>
          {PRICING.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={tier.recommended ? '' : 'glass-card'}
              style={{ 
                position: 'relative', 
                padding: '2rem', 
                borderRadius: '1.5rem', 
                background: tier.recommended ? 'linear-gradient(to bottom, rgba(102, 126, 234, 0.2), rgba(102, 126, 234, 0.05))' : undefined,
                border: tier.recommended ? '1px solid rgba(102, 126, 234, 0.5)' : undefined
              }}
            >
              {tier.recommended && (
                <div style={{ position: 'absolute', top: '-1rem', left: '50%', transform: 'translateX(-50%)', padding: '0.25rem 1rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recommended
                </div>
              )}
              <h3 className="text-2xl font-bold" style={{ marginBottom: '0.5rem' }}>{tier.name}</h3>
              <div className="text-4xl font-extrabold" style={{ marginBottom: '1rem' }}>{tier.price}</div>
              <p className="text-muted text-sm" style={{ marginBottom: '2rem' }}>{tier.description}</p>
              
              <ul className="flex flex-col gap-4" style={{ marginBottom: '2rem' }}>
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm" style={{ color: '#d1d5db' }}>
                    <Check size={16} color="var(--primary)" /> {f}
                  </li>
                ))}
              </ul>

              <MagneticButton 
                variant={tier.recommended ? 'primary' : 'outline'} 
                className="justify-center"
                style={{ width: '100%' }}
              >
                Choose {tier.name}
              </MagneticButton>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding" style={{ position: 'relative', overflow: 'hidden', padding: '0 1.5rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(102, 126, 234, 0.1)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')", opacity: 0.2 }}></div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-dark), transparent, transparent)' }}></div>
        </div>
        
        <div className="container text-center" style={{ position: 'relative', zIndex: 10, maxWidth: '56rem' }}>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-4xl md-text-6xl font-extrabold"
            style={{ marginBottom: '2rem' }}
          >
            Ready to transform your campus?
          </motion.h2>
          <p className="text-xl text-muted" style={{ marginBottom: '2.5rem', maxWidth: '42rem', margin: '0 auto 2.5rem' }}>
            Join the forward-thinking universities that are redefining student navigation today.
          </p>
          <MagneticButton style={{ padding: '1.25rem 2.5rem', fontSize: '1.125rem' }}>
            Start Your Free Trial
          </MagneticButton>
          
          <div className="flex justify-center" style={{ marginTop: '3rem', flexWrap: 'wrap', gap: '2rem', fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>
            <span className="flex items-center gap-2"><Globe size={16} /> GDPR Compliant</span>
            <span className="flex items-center gap-2"><Shield size={16} /> Enterprise Security</span>
            <span className="flex items-center gap-2"><Zap size={16} /> 99.9% Uptime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '3rem', paddingBottom: '3rem', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
        <div className="container">
          
          <div className="flex flex-col md-flex justify-between items-center" style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-xs" style={{ color: '#4b5563', marginBottom: '1rem' }}>
              © {new Date().getFullYear()} Campus Explorer Inc. All rights reserved.
            </div>
            <div className="flex gap-6">
              <div style={{ width: '1.25rem', height: '1.25rem', backgroundColor: '#1f2937', borderRadius: '50%', cursor: 'pointer' }}></div>
              <div style={{ width: '1.25rem', height: '1.25rem', backgroundColor: '#1f2937', borderRadius: '50%', cursor: 'pointer' }}></div>
              <div style={{ width: '1.25rem', height: '1.25rem', backgroundColor: '#1f2937', borderRadius: '50%', cursor: 'pointer' }}></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
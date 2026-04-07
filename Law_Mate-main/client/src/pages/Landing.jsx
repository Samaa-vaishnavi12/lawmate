import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Button, Navbar, Nav, Card, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import {
    FaBalanceScale, FaUserShield, FaGavel, FaSearch, FaRobot,
    FaFileContract, FaHistory, FaFolderOpen, FaShieldAlt,
    FaSignInAlt, FaUserPlus, FaTachometerAlt, FaComments,
    FaFilePdf, FaBookOpen, FaEnvelope, FaPhone, FaArrowRight,
    FaMapMarkerAlt, FaTwitter, FaLinkedin, FaGithub, FaChevronUp,
    FaStar, FaQuoteLeft, FaCheckCircle, FaLock, FaBrain, FaFileAlt
} from 'react-icons/fa';
import LegalHeroImage from '../components/LegalHeroImage';
import './Landing.css';

const stats = [
    { number: '8+', label: 'Laws Covered' },
    { number: '2400+', label: 'Legal Sections' },
    { number: '3', label: 'User Roles' },
    { number: '100%', label: 'Free to Use' },
];

const testimonials = [
    { name: 'Rajesh Kumar', role: 'Police Sub-Inspector', text: 'Law Mate transformed how our station handles FIR drafting. What used to take hours now takes minutes with perfect section mapping.', stars: 5 },
    { name: 'Priya Sharma', role: 'Law Student', text: 'The AI chat is incredibly accurate. I can search any legal concept in plain language and get proper section references instantly.', stars: 5 },
    { name: 'Advocate Mohan', role: 'Senior Lawyer', text: 'The document analysis feature saves me enormous time during case preparation. Highly recommended for legal professionals.', stars: 5 },
];

const Landing = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [navScrolled, setNavScrolled] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const heroRef = useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const handleScroll = () => {
            setNavScrolled(window.scrollY > 60);
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const features = [
        { icon: <FaRobot />, title: 'AI Legal Chat', desc: 'Ask in plain language, get precise section citations from IPC, CrPC, and 6 more laws instantly.', route: user ? '/chat' : '/login', color: '#4e54c8', badge: 'Most Popular' },
        { icon: <FaSearch />, title: 'Document Analysis', desc: 'Upload any legal document — get instant AI-powered summaries and relevant section mapping.', route: user ? '/analysis' : '/login', color: '#8f94fb', badge: 'AI Powered' },
        { icon: <FaFileContract />, title: 'FIR Generator', desc: 'Auto-draft legally precise FIRs with correct IPC sections based on incident descriptions.', route: user ? '/generator' : '/login', color: '#ff007f', badge: 'Police Use' },
        { icon: <FaBookOpen />, title: 'Law Database', desc: 'Unified, searchable database of IPC, CrPC, CPC, IEA, MVA, HMA, IDA and NIA.', route: user ? '/dashboard' : '/login', color: '#00b4d8', badge: '2400+ Sections' },
        { icon: <FaHistory />, title: 'Search History', desc: 'All your legal queries saved automatically. Resume research exactly where you left off.', route: user ? '/saved-queries' : '/login', color: '#06d6a0', badge: 'Smart Save' },
        { icon: <FaLock />, title: 'Secure & Private', desc: 'JWT-authenticated sessions, role-based access, and encrypted storage for all your data.', route: user ? '/dashboard' : '/register', color: '#ffd166', badge: 'Enterprise Grade' },
    ];

    const publicFeatures = [
        { icon: <FaShieldAlt />, title: 'Know Your Rights', desc: 'Search any legal section in plain Tamil or English.', route: user ? '/chat' : '/register' },
        { icon: <FaGavel />, title: 'AI Legal Guidance', desc: 'Get instant answers on legal procedures and rights.', route: user ? '/chat' : '/register' },
        { icon: <FaFolderOpen />, title: 'Saved Queries', desc: 'Build your personal legal research library.', route: user ? '/saved-queries' : '/register' },
        { icon: <FaBrain />, title: 'Document Analyzer', desc: 'Upload documents for AI-powered legal insights.', route: user ? '/analysis' : '/register' },
    ];

    const policeFeatures = [
        { icon: <FaFileContract />, title: 'Smart FIR Drafting', desc: 'Auto-maps IPC sections based on incident description.', route: user ? '/generator' : '/login' },
        { icon: <FaHistory />, title: 'FIR History', desc: 'Searchable database of all drafted and filed reports.', route: user ? '/fir-history' : '/login' },
        { icon: <FaSearch />, title: 'Live Law Lookup', desc: 'Instantly verify sections and punishments on the field.', route: user ? '/chat' : '/login' },
        { icon: <FaFileAlt />, title: 'Document Generator', desc: 'Auto-generate all standard police documents.', route: user ? '/generator' : '/login' },
    ];

    return (
        <div className="landing-container">

            {/* ── Navbar ── */}
            <Navbar expand="lg" className={`lm-nav fixed-top ${navScrolled ? 'lm-nav--scrolled' : ''}`}>
                <Container>
                    <Navbar.Brand as={Link} to="/" className="lm-brand">
                        <FaBalanceScale className="lm-brand__icon" />
                        <span>Law<span className="lm-brand__accent">Mate</span></span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="main-nav" />
                    <Navbar.Collapse id="main-nav">
                        <Nav className="ms-auto align-items-center gap-1">
                            {['features', 'roles', 'testimonials', 'contact'].map(s => (
                                <Nav.Link key={s} onClick={() => scrollTo(s)} className="lm-nav__link">
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </Nav.Link>
                            ))}
                            {user ? (
                                <Button className="lm-btn lm-btn--primary ms-3" onClick={() => navigate('/dashboard')}>
                                    <FaTachometerAlt /> Dashboard
                                </Button>
                            ) : (
                                <div className="d-flex gap-2 ms-3">
                                    <Button className="lm-btn lm-btn--ghost" onClick={() => navigate('/login')}>
                                        <FaSignInAlt /> Login
                                    </Button>
                                    <Button className="lm-btn lm-btn--primary" onClick={() => navigate('/register')}>
                                        <FaUserPlus /> Register
                                    </Button>
                                </div>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* ── Hero ── */}
            <section className="lm-hero" ref={heroRef}>
                <div className="lm-hero__bg-shapes">
                    <div className="lm-shape lm-shape--1" />
                    <div className="lm-shape lm-shape--2" />
                    <div className="lm-shape lm-shape--3" />
                </div>
                <Container className="position-relative">
                    <Row className="align-items-center min-vh-100 py-5">
                        <Col lg={6} className="lm-hero__content">
                            <div className="lm-hero__badge">
                                <FaBalanceScale /> India's First AI Legal Assistant
                            </div>
                            <h1 className="lm-hero__title">
                                Justice Made <span className="lm-gradient-text">Accessible</span> for Everyone
                            </h1>
                            <p className="lm-hero__sub">
                                Law Mate brings AI-powered legal assistance to citizens and law enforcement.
                                Search 2400+ sections across 8 laws in plain language — instantly.
                            </p>
                            <div className="lm-hero__actions">
                                <Button className="lm-btn lm-btn--primary lm-btn--lg" onClick={() => navigate(user ? '/dashboard' : '/register')}>
                                    <FaUserPlus /> Get Started Free
                                </Button>
                                <Button className="lm-btn lm-btn--outline lm-btn--lg" onClick={() => navigate(user ? '/chat' : '/login')}>
                                    <FaRobot /> Try AI Chat
                                </Button>
                            </div>
                            <div className="lm-hero__stats">
                                {stats.map((s, i) => (
                                    <div key={i} className="lm-hero__stat">
                                        <span className="lm-hero__stat-num">{s.number}</span>
                                        <span className="lm-hero__stat-label">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </Col>
                        <Col lg={6} className="d-none d-lg-flex justify-content-center lm-hero__visual">
                            <div className="lm-hero__image-wrap">
                                <img
                                    src="https://fusionaier.org/wp-content/uploads/2025/08/shutterstock_2528230105-1024x512.jpg"
                                    alt="AI Legal Services - Lady Justice"
                                    className="lm-hero__img"
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ── Features ── */}
            <section id="features" className="lm-section lm-section--light">
                <Container>
                    <div className="lm-section__header">
                        <span className="lm-section__tag">Capabilities</span>
                        <h2 className="lm-section__title">Everything You Need for Legal Research</h2>
                        <p className="lm-section__sub">Professional-grade tools powered by AI and a comprehensive Indian law database.</p>
                    </div>
                    <Row className="g-4">
                        {features.map((f, i) => (
                            <Col md={6} lg={4} key={i}>
                                <div className="lm-feature-card" onClick={() => navigate(f.route)}>
                                    <div className="lm-feature-card__badge">{f.badge}</div>
                                    <div className="lm-feature-card__icon" style={{ background: f.color + '18', color: f.color }}>
                                        {f.icon}
                                    </div>
                                    <h5 className="lm-feature-card__title">{f.title}</h5>
                                    <p className="lm-feature-card__desc">{f.desc}</p>
                                    <div className="lm-feature-card__cta" style={{ color: f.color }}>
                                        Explore <FaArrowRight size={11} />
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ── Roles ── */}
            <section id="roles" className="lm-section lm-section--dark-gradient">
                <Container>
                    <div className="lm-section__header lm-section__header--light">
                        <span className="lm-section__tag lm-section__tag--light">User Roles</span>
                        <h2 className="lm-section__title text-white">Built for Every Stakeholder</h2>
                        <p className="lm-section__sub" style={{ color: 'rgba(255,255,255,0.7)' }}>Specialized toolsets for citizens and law enforcement professionals.</p>
                    </div>
                    <Row className="g-4">
                        {/* Public Card */}
                        <Col lg={6}>
                            <div className="lm-role-card lm-role-card--public">
                                <div className="lm-role-card__header">
                                    <div className="lm-role-card__icon-wrap">
                                        <FaBalanceScale size={36} />
                                    </div>
                                    <div>
                                        <h3 className="lm-role-card__title">For Citizens</h3>
                                        <p className="lm-role-card__sub">Legal Empowerment for the Public</p>
                                    </div>
                                </div>
                                <div className="lm-role-card__features">
                                    {publicFeatures.map((f, i) => (
                                        <div key={i} className="lm-role-feature" onClick={() => navigate(f.route)}>
                                            <div className="lm-role-feature__icon lm-role-feature__icon--public">{f.icon}</div>
                                            <div>
                                                <div className="lm-role-feature__title">{f.title} <FaArrowRight size={9} className="ms-1 opacity-50" /></div>
                                                <div className="lm-role-feature__desc">{f.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button className="lm-btn lm-btn--primary w-100 mt-3" onClick={() => navigate(user ? '/dashboard' : '/register')}>
                                    <FaUserPlus /> {user ? 'Open Dashboard' : 'Register as Citizen'}
                                </Button>
                            </div>
                        </Col>

                        {/* Police Card */}
                        <Col lg={6}>
                            <div className="lm-role-card lm-role-card--police">
                                <div className="lm-role-card__header">
                                    <div className="lm-role-card__icon-wrap lm-role-card__icon-wrap--police">
                                        <FaUserShield size={36} />
                                    </div>
                                    <div>
                                        <h3 className="lm-role-card__title">For Law Enforcement</h3>
                                        <p className="lm-role-card__sub">Modernising Police Operations</p>
                                    </div>
                                </div>
                                <div className="lm-role-card__features">
                                    {policeFeatures.map((f, i) => (
                                        <div key={i} className="lm-role-feature" onClick={() => navigate(f.route)}>
                                            <div className="lm-role-feature__icon lm-role-feature__icon--police">{f.icon}</div>
                                            <div>
                                                <div className="lm-role-feature__title">{f.title} <FaArrowRight size={9} className="ms-1 opacity-50" /></div>
                                                <div className="lm-role-feature__desc">{f.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button className="lm-btn lm-btn--police w-100 mt-3" onClick={() => navigate(user ? '/dashboard' : '/login')}>
                                    <FaSignInAlt /> {user ? 'Open Dashboard' : 'Login as Officer'}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ── Testimonials ── */}
            <section id="testimonials" className="lm-section lm-section--light">
                <Container>
                    <div className="lm-section__header">
                        <span className="lm-section__tag">Testimonials</span>
                        <h2 className="lm-section__title">Trusted by Legal Professionals</h2>
                        <p className="lm-section__sub">What our users say about Law Mate.</p>
                    </div>
                    <Row className="g-4">
                        {testimonials.map((t, i) => (
                            <Col md={4} key={i}>
                                <div className="lm-testimonial">
                                    <FaQuoteLeft className="lm-testimonial__quote" />
                                    <p className="lm-testimonial__text">"{t.text}"</p>
                                    <div className="lm-testimonial__stars">
                                        {[...Array(t.stars)].map((_, j) => <FaStar key={j} />)}
                                    </div>
                                    <div className="lm-testimonial__author">
                                        <div className="lm-testimonial__avatar">{t.name[0]}</div>
                                        <div>
                                            <div className="lm-testimonial__name">{t.name}</div>
                                            <div className="lm-testimonial__role">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ── CTA Banner ── */}
            {!user && (
                <section className="lm-cta">
                    <Container className="text-center">
                        <h2 className="lm-cta__title">Start Your Legal Journey Today</h2>
                        <p className="lm-cta__sub">Join thousands of citizens and officers who rely on Law Mate every day.</p>
                        <div className="lm-cta__actions">
                            <Button className="lm-btn lm-btn--white lm-btn--lg" onClick={() => navigate('/register')}>
                                <FaUserPlus /> Create Free Account
                            </Button>
                            <Button className="lm-btn lm-btn--outline-white lm-btn--lg" onClick={() => navigate('/login')}>
                                <FaSignInAlt /> Sign In
                            </Button>
                        </div>
                        <div className="lm-cta__trust">
                            {['No credit card required', 'Instant access', 'Free forever'].map((t, i) => (
                                <span key={i}><FaCheckCircle className="me-1" />{t}</span>
                            ))}
                        </div>
                    </Container>
                </section>
            )}

            {/* ── Contact ── */}
            <section id="contact" className="lm-section lm-section--white">
                <Container>
                    <div className="lm-section__header">
                        <span className="lm-section__tag">Contact</span>
                        <h2 className="lm-section__title">Get in Touch</h2>
                        <p className="lm-section__sub">Our team is here to help you navigate Indian law.</p>
                    </div>
                    <Row className="justify-content-center g-4">
                        {[
                            { icon: <FaEnvelope size={24} />, label: 'Email Us', value: 'info@lawmate.ai', href: 'mailto:info@lawmate.ai', color: '#4e54c8' },
                            { icon: <FaPhone size={24} />, label: 'Call Us', value: '+91 000 000 0000', href: 'tel:+910000000000', color: '#8f94fb' },
                            { icon: <FaMapMarkerAlt size={24} />, label: 'Location', value: 'Chennai, Tamil Nadu', href: '#', color: '#ff007f' },
                            { icon: <FaComments size={24} />, label: 'Live Chat', value: 'Chat with AI now', href: null, color: '#06d6a0', action: () => navigate(user ? '/chat' : '/login') },
                        ].map((c, i) => (
                            <Col md={3} sm={6} key={i}>
                                <div className="lm-contact-card" onClick={c.action || (() => c.href !== '#' && window.open(c.href))}>
                                    <div className="lm-contact-card__icon" style={{ background: c.color + '15', color: c.color }}>{c.icon}</div>
                                    <h6 className="lm-contact-card__label">{c.label}</h6>
                                    <p className="lm-contact-card__value">{c.value}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ── Footer ── */}
            <footer className="lm-footer">
                <Container>
                    <Row className="g-4 py-5 align-items-start">

                        {/* Brand */}
                        <Col lg={5} md={12}>
                            <div className="lm-footer__brand mb-3">
                                <FaBalanceScale className="lm-footer__brand-icon" />
                                <span className="lm-footer__brand-name">Law<span>Mate</span></span>
                            </div>
                            <p className="lm-footer__tagline">India's AI-powered legal assistant for citizens and law enforcement. Search 2400+ sections instantly.</p>
                            <div className="lm-footer__social">
                                {[{ icon: <FaTwitter />, href: '#' }, { icon: <FaLinkedin />, href: '#' }, { icon: <FaGithub />, href: '#' }]
                                    .map((s, i) => <a key={i} href={s.href} className="lm-footer__social-link">{s.icon}</a>)}
                            </div>
                        </Col>

                        {/* Quick Links */}
                        <Col lg={3} sm={6}>
                            <h6 className="lm-footer__col-title">Quick Links</h6>
                            <ul className="lm-footer__links">
                                {[
                                    { label: 'AI Chat', route: user ? '/chat' : '/login' },
                                    { label: 'Document Analysis', route: user ? '/analysis' : '/login' },
                                    { label: 'FIR Generator', route: user ? '/generator' : '/login' },
                                    { label: 'Saved Searches', route: user ? '/saved-queries' : '/login' },
                                    { label: user ? 'Dashboard' : 'Register Free', route: user ? '/dashboard' : '/register' },
                                ].map((l, i) => (
                                    <li key={i}>
                                        <span className="lm-footer__link" onClick={() => navigate(l.route)}>{l.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </Col>

                        {/* Contact */}
                        <Col lg={4} sm={6}>
                            <h6 className="lm-footer__col-title">Contact</h6>
                            <ul className="lm-footer__links lm-footer__links--contact">
                                <li><FaEnvelope /><a href="mailto:info@lawmate.ai">info@lawmate.ai</a></li>
                                <li><FaPhone /><a href="tel:+910000000000">+91 000 000 0000</a></li>
                                <li><FaMapMarkerAlt />Chennai, Tamil Nadu</li>
                            </ul>
                            <div className="lm-footer__laws-row mt-3">
                                {['IPC','CrPC','CPC','IEA','MVA','HMA','IDA','NIA'].map(law => (
                                    <Badge key={law} className="lm-footer__law-badge" onClick={() => navigate(user ? '/chat' : '/login')}>{law}</Badge>
                                ))}
                            </div>
                        </Col>
                    </Row>

                    <div className="lm-footer__bottom">
                        <span className="lm-footer__copyright">© {new Date().getFullYear()} LawMate. Built with <FaGavel className="mx-1" /> for Indian Justice.</span>
                        <span className="lm-footer__bottom-links">
                            <span onClick={() => scrollTo('features')}>Privacy</span>
                            <span onClick={() => scrollTo('features')}>Terms</span>
                            <span onClick={() => scrollTo('contact')}>Support</span>
                        </span>
                    </div>
                </Container>
            </footer>

            {/* ── Scroll to Top Button ── */}
            {showScrollTop && (
                <button className="lm-scroll-top" onClick={scrollTop} aria-label="Scroll to top">
                    <FaChevronUp />
                </button>
            )}


        </div>
    );
};

export default Landing;

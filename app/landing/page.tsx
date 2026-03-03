'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import './landing.css';

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`landing-reveal ${className}`}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [visible, setVisible] = useState(false);
  const recipesCounter = useCountUp(1000, 2000);
  const speedCounter = useCountUp(30, 1500);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="landing-page">
      {/* Noise overlay */}
      <div className="landing-noise" />

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-container nav-inner">
          <Link href="/landing" className="logo">
            <span className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
              </svg>
            </span>
            <span className="logo-text">Meal<span className="logo-bold">Mate</span></span>
          </Link>
          <div className="nav-links">
            <a href="#features">Можливості</a>
            <a href="#how-it-works">Як працює</a>
            <a href="#benefits">Переваги</a>
            <Link href="/pricing" className="nav-link">Тарифи</Link>
            <Link href="/login" className="nav-cta">Увійти</Link>
          </div>
          <Link href="/login" className="nav-cta-mobile">Увійти</Link>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className={`hero ${visible ? 'hero-visible' : ''}`}>
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="landing-container hero-inner">
          <div className="hero-content">
            <div className="hero-badge hero-badge-shimmer">
              <span className="hero-badge-dot" />
              Твій AI шеф-кухар
            </div>
            <h1 className="hero-title">
              Не знаєш, що <em>приготувати? 🍳</em>
            </h1>
            <p className="hero-subtitle">
              Скажи, що є в холодильнику — AI за 30 секунд видасть рецепт
              з покроковими інструкціями. Ніяких складних інгредієнтів,
              тільки те, що під рукою.
            </p>
            <div className="hero-actions">
              <Link href="/register" className="btn-primary btn-large">
                Спробувати зараз 🚀
              </Link>
              <a href="#features" className="btn-ghost">
                Як це працює? ↓
              </a>
            </div>
          </div>
          <div className="hero-scroll-hint">
            <span>Scroll</span>
            <div className="hero-scroll-line" />
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="features-section">
        <div className="landing-container">
          <RevealSection>
            <div className="gold-separator" />
            <div className="section-header">
              <span className="section-label">Можливості</span>
              <h2 className="section-title">Забудь питання <em>&laquo;що сьогодні готувати?&raquo;</em></h2>
            </div>
          </RevealSection>

          {/* Feature Row 1 — Image left, text right */}
          <RevealSection>
            <div className="feature-row">
              <div className="feature-image feature-image-tilt feature-reveal-left">
                <img
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
                  alt="AI recipe generation"
                  loading="lazy"
                />
              </div>
              <div className="feature-text feature-reveal-right">
                <span className="feature-number">01</span>
                <h3>Рецепт з того, що є</h3>
                <p>
                  Відкрили холодильник — а там курка, рис і пара овочів?
                  AI миттєво створить страву з покроковими інструкціями,
                  калорійністю та часом. Не треба бігти в магазин.
                </p>
                <div className="feature-details">
                  <span>GPT-4</span>
                  <span>30 секунд</span>
                  <span>КБЖУ</span>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Feature Row 2 — Text left, image right */}
          <RevealSection>
            <div className="feature-row feature-row-reverse">
              <div className="feature-image feature-image-tilt feature-reveal-right">
                <img
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80"
                  alt="Meal planning"
                  loading="lazy"
                />
              </div>
              <div className="feature-text feature-reveal-left">
                <span className="feature-number">02</span>
                <h3>План на тиждень за хвилину</h3>
                <p>
                  Більше не ламати голову щовечора. AI складе меню на 1–7 днів,
                  врахує алергії та бюджет, і одразу згенерує список покупок.
                  Один раз — і тиждень без стресу.
                </p>
                <div className="feature-details">
                  <span>1–7 днів</span>
                  <span>Список покупок</span>
                  <span>Бюджет</span>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Feature Row 3 — Image left, text right */}
          <RevealSection>
            <div className="feature-row">
              <div className="feature-image feature-image-tilt feature-reveal-left">
                <img
                  src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80"
                  alt="Smart fridge"
                  loading="lazy"
                />
              </div>
              <div className="feature-text feature-reveal-right">
                <span className="feature-number">03</span>
                <h3>Нічого не пропадає</h3>
                <p>
                  Додайте продукти з холодильника — AI запам&apos;ятає та
                  запропонує рецепти саме з них. Менше викинутої їжі,
                  більше смачних відкриттів.
                </p>
                <div className="feature-details">
                  <span>Zero waste</span>
                  <span>Економія</span>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════ FULL-BLEED QUOTE ═══════════ */}
      <section className="quote-section">
        <div className="quote-bg" />
        <div className="quote-overlay" />
        <RevealSection className="landing-container quote-inner">
          <blockquote>
            <p>&ldquo;Найкраща страва — та, що зроблена з любов&apos;ю і з того, що є&rdquo;</p>
          </blockquote>
          <div className="quote-stats">
            <div className="quote-stat">
              <span className="quote-stat-number" ref={recipesCounter.ref}>{recipesCounter.count}+</span>
              <span className="quote-stat-label">унікальних рецептів</span>
            </div>
            <div className="quote-stat-divider" />
            <div className="quote-stat">
              <span className="quote-stat-number">GPT-4</span>
              <span className="quote-stat-label">AI модель</span>
            </div>
            <div className="quote-stat-divider" />
            <div className="quote-stat">
              <span className="quote-stat-number" ref={speedCounter.ref}>{speedCounter.count}с</span>
              <span className="quote-stat-label">генерація</span>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="steps-section">
        <div className="landing-container">
          <RevealSection>
            <div className="gold-separator" />
            <div className="section-header">
              <span className="section-label">Як працює</span>
              <h2 className="section-title">Три кроки до <em>смачної вечері</em></h2>
            </div>
          </RevealSection>
          <RevealSection>
            <div className="steps-grid stagger-on-reveal">
              <div className="step-card">
                <div className="step-num">01</div>
                <h3>Скажи, що є вдома</h3>
                <p>Обери продукти з холодильника, тип страви та кухню — або просто напиши &laquo;хочу щось з курки&raquo;.</p>
                <div className="step-line" />
              </div>
              <div className="step-card">
                <div className="step-num">02</div>
                <h3>AI створює рецепт</h3>
                <p>За 30 секунд отримаєш повний рецепт з КБЖУ, часом та кроками. Саме під твої смаки.</p>
                <div className="step-line" />
              </div>
              <div className="step-card">
                <div className="step-num">03</div>
                <h3>Готуй і насолоджуйся</h3>
                <p>Покрокові інструкції з таймером. Сподобалось? Зберігай в улюблене. Не вистачає продуктів? Замовляй доставку.</p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════ BENEFITS ═══════════ */}
      <section id="benefits" className="benefits-section">
        <div className="landing-container">
          <RevealSection>
            <div className="gold-separator" />
            <div className="section-header">
              <span className="section-label">Переваги</span>
              <h2 className="section-title">Чому тисячі людей <em>вже готують з нами</em></h2>
            </div>
          </RevealSection>
          <RevealSection>
          <div className="benefits-grid stagger-on-reveal">
            <div className="benefit-item">
              <div className="benefit-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <h3>30 секунд замість 30 хвилин</h3>
                <p>Забудь безкінечний скрол рецептів. AI видасть ідеальний варіант одразу.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 12l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3>Все йде в справу</h3>
                <p>Той кабачок, що тижнень лежить? AI знайде, куди його подіти. Менше сміття — більше страв.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </div>
              <div>
                <h3>Їж смачно і без зайвого</h3>
                <p>КБЖУ рахується автоматично. Алергії, дієти, обмеження — AI все врахує.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <div>
                <h3>Продукти — до дверей</h3>
                <p>Не вистачає інгредієнтів? Замов з Zakaz.ua прямо з рецепту в один клік.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                </svg>
              </div>
              <div>
                <h3>Готуй як шеф</h3>
                <p>Покрокові інструкції з таймером. Навіть якщо ти тільки вчишся — вийде круто.</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div>
                <h3>Знає твій смак</h3>
                <p>Чим більше готуєш — тим краще AI розуміє, що тобі подобається. Як особистий шеф-кухар.</p>
              </div>
            </div>
          </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="cta-overlay" />
        <RevealSection className="landing-container cta-inner">
          <h2>Сьогодні вже <em>щось смачне?</em></h2>
          <p>
            Приєднуйся — і забудь вічне питання &laquo;що приготувати&raquo;.
            Перший рецепт вже через 30 секунд.
          </p>
          <Link href="/register" className="btn-primary btn-large">
            Почати безкоштовно
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </RevealSection>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div className="footer-brand">
            <span className="logo-mark logo-mark-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
              </svg>
            </span>
            <span className="logo-text">Meal<span className="logo-bold">Mate</span></span>
          </div>
          <div className="footer-links">
            <a href="#features">Можливості</a>
            <a href="#how-it-works">Як працює</a>
            <a href="#benefits">Переваги</a>
            <Link href="/pricing">Тарифи</Link>
          </div>
          <div className="footer-copy">
            &copy; {new Date().getFullYear()} MealMate
          </div>
        </div>
      </footer>
    </div>
  );
}

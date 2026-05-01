"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BarChart3, CheckCircle2, ChevronRight,
  Globe, LineChart, Shield, Users, Zap,
  MessageCircle, HeartHandshake, TrendingUp,
  Star, Quote
} from "lucide-react";

// --- Animations ---
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, on };
}

function Reveal({ children, delay = 0, className = "" }) {
  const { ref, on } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// --- Brand Tokens ---
// Primary: Deep Teal (#0d9488) -> Darker Teal (#0f766e)
// Accent: Vibrant Coral (#f43f5e)
// Background: Soft Sand/Cream for a warm, human feel (#fafaf9)

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d9488] shadow-md shadow-teal-500/20">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">Lumino.</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            { label: "Why us?", id: "why-us" },
            { label: "Solutions", id: "solutions" },
            { label: "Real Results", id: "testimonials" },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" })}
              className="text-[14px] font-semibold text-slate-600 transition-colors hover:text-[#0d9488]"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block text-[14px] font-semibold text-slate-600 hover:text-slate-900">
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-[#0d9488] px-5 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-0.5 hover:bg-[#0f766e] hover:shadow-teal-500/40"
          >
            Start listening free
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fafaf9] pt-32 pb-24 lg:pt-48 lg:pb-32">
      {/* Warm Background Shapes */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 h-[600px] w-[600px] rounded-full bg-teal-100/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 h-[500px] w-[500px] rounded-full bg-rose-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          
          <div className="max-w-2xl">
            <Reveal delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 shadow-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-[#f43f5e] animate-pulse" />
                <span className="text-[12px] font-bold tracking-wide text-teal-800 uppercase">Built for human connection</span>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.1]">
                Your customers are talking. <br />
                <span className="text-[#0d9488]">Are you listening?</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Forget robotic, boring surveys that no one fills out. Lumino helps you capture <strong>real, authentic feedback</strong> in real-time. We turn customer voices into actionable decisions so you can build exactly what they need.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#f43f5e] px-8 py-4 text-base font-bold text-white shadow-xl shadow-rose-500/20 transition-all hover:-translate-y-0.5 hover:bg-[#e11d48]"
                >
                  Create your first survey
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-slate-800 border border-slate-200 shadow-sm transition-all hover:bg-slate-50"
                >
                  View live dashboard
                </Link>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                  ].map((src, i) => (
                    <img key={i} src={src} alt="User" className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm" />
                  ))}
                </div>
                <p>
                  <span className="font-bold text-slate-800">2,000+</span> business owners trust us to grow.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="relative hidden lg:block">
            {/* Real human photography to build trust */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Business owners discussing feedback" 
                className="w-full rounded-2xl object-cover"
              />
              {/* Floating UI Elements over the image */}
              <div className="absolute -left-6 bottom-12 rounded-2xl bg-white p-4 shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Response</p>
                  <p className="text-lg font-black text-slate-900">"We love the new menu!"</p>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const problems = [
    {
      title: "Real-time, actionable data",
      desc: "You make decisions today, not next month. Watch feedback stream into your dashboard live, allowing you to react to unhappy customers before they leave reviews.",
      icon: <Users className="h-6 w-6 text-[#0d9488]" />
    },
    {
      title: "Surveys people actually finish",
      desc: "Customers hate 20-page forms. Our surveys are gorgeously designed, mobile-first, and feel like a modern chat, resulting in up to 3x higher completion rates.",
      icon: <HeartHandshake className="h-6 w-6 text-[#f43f5e]" />
    },
    {
      title: "AI that does the heavy lifting",
      desc: "You don't have time to read 500 reviews. Our AI instantly surfaces the 3 biggest pain points, saving you hours of manual reading while maintaining complete accuracy.",
      icon: <Zap className="h-6 w-6 text-amber-500" />
    }
  ];

  return (
    <section id="why-us" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 className="text-base font-bold text-[#0d9488] tracking-widest uppercase">The Lumino Difference</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              We understand real business needs.
            </p>
            <p className="mt-4 text-lg text-slate-600">
              You aren't looking for a "data collection tool". You are looking for a way to make your customers happier. We built our platform entirely around that goal.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {problems.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 150} className="flex flex-col border-t-2 border-slate-100 pt-8 hover:border-[#0d9488] transition-colors">
                <dt className="flex items-center gap-x-3 text-xl font-bold leading-7 text-slate-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 shadow-inner">
                    {feature.icon}
                  </div>
                  {feature.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-relaxed text-slate-600">
                  <p className="flex-auto">{feature.desc}</p>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="bg-[#0f172a] py-24 sm:py-32 relative overflow-hidden">
      {/* Geometric background patterns */}
      <div className="absolute top-0 right-0 -mx-20 -my-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mx-20 -my-20 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl leading-tight">
              Enterprise-grade security, <br/>
              <span className="text-[#0d9488]">small-business simplicity.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              Your customers trust you with their honest thoughts. You need to trust the platform that stores them. We treat your data as sacred.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { title: "Bank-level Encryption", desc: "Data is encrypted in transit and at rest using AES-256." },
                { title: "Privacy First", desc: "We never, ever sell your customer data to third parties." },
                { title: "Reliable Infrastructure", desc: "99.99% uptime guaranteed. We don't drop responses." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="rounded-full bg-teal-900/50 p-1.5 mt-1">
                    <Shield className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{item.title}</h3>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Diverse team analyzing data"
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    {
      body: "We opened a new cafe location and used Lumino to gather opening-week feedback. It took 3 minutes to set up. Knowing exactly what the neighborhood thought instantly gave us the confidence to tweak our menu immediately.",
      author: "Elena Rodriguez",
      role: "Cafe Owner",
      img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      body: "I was drowning in spreadsheet feedback. Lumino's AI summary completely changed how we run our weekly meetings. It feels like having a dedicated analyst on the team summarizing everything perfectly.",
      author: "David Chen",
      role: "Product Manager",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      body: "The surveys look so professional and the UI is incredibly smooth. My clients actually compliment the forms I send them. That level of polish reflects incredibly well on my own brand.",
      author: "Sarah Jenkins",
      role: "Agency Director",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    }
  ];

  return (
    <section id="testimonials" className="bg-[#fafaf9] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <Reveal>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Don't just take our word for it.
            </h2>
          </Reveal>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={review.author} delay={i * 100}>
                <div className="flex h-full flex-col justify-between rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
                  <div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-base leading-relaxed text-slate-600">"{review.body}"</p>
                  </div>
                  <div className="mt-6 flex items-center gap-x-4 border-t border-slate-100 pt-6">
                    <img className="h-12 w-12 rounded-full object-cover" src={review.img} alt={review.author} />
                    <div>
                      <div className="font-bold text-slate-900">{review.author}</div>
                      <div className="text-sm text-slate-500">{review.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10">
        <Reveal>
          <div className="rounded-3xl bg-[#0d9488] px-6 py-16 sm:p-20 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
            <h2 className="relative z-10 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to truly understand your customers?
            </h2>
            <p className="relative z-10 mx-auto mt-6 max-w-xl text-lg text-teal-100">
              Join thousands of businesses making smarter decisions every single day. Setup takes exactly 3 minutes.
            </p>
            <div className="relative z-10 mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-full bg-white px-8 py-4 text-base font-bold text-teal-900 shadow-xl transition-all hover:scale-105 hover:bg-teal-50"
              >
                Get Started for Free
              </Link>
            </div>
            <p className="relative z-10 mt-6 text-sm text-teal-200">No credit card required. Cancel anytime.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { Footer } from "@/components/dashboard/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-teal-200 selection:text-teal-900">
      <LandingNav />
      <Hero />
      <WhyUs />
      <TrustSection />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

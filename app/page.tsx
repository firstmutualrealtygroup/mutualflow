import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  FileText,
  Mail,
  CheckCircle,
  Shield,
  ArrowRight,
  Home,
  BarChart3,
  Clock,
  Star,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">MutualFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition">Features</a>
            <a href="#stages" className="hover:text-gray-900 transition">How It Works</a>
            <a href="#about" className="hover:text-gray-900 transition">About</a>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Sign In
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Star className="w-3 h-3" />
            First Mutual Realty Group — Exclusive Platform
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
            Real Estate
            <span className="block text-blue-400">Transactions,</span>
            <span className="block text-white">Simplified.</span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            MutualFlow is the all-in-one transaction management platform built exclusively
            for First Mutual Realty Group — track every deal, every stage, every client,
            all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base shadow-lg shadow-blue-900/40"
            >
              Access Your Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3.5 rounded-xl transition text-base border border-white/20"
            >
              See How It Works
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
            {[
              { value: "4", label: "Transaction Stages" },
              { value: "100%", label: "Paperless" },
              { value: "1", label: "Platform for All" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-blue-300 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transaction Roadmap Section */}
      <section id="stages" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
              The Process
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Every Transaction, Step by Step
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              From accepted offer to closing day — your clients always know exactly where
              they stand with our visual 4-stage roadmap.
            </p>
          </div>

          {/* Stage Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                icon: "🔍",
                title: "Due Diligence",
                color: "blue",
                bg: "bg-blue-50",
                border: "border-blue-200",
                text: "text-blue-700",
                desc: "Inspect the property and ensure 100% satisfaction with its condition. Renegotiate if any habitability concerns arise.",
              },
              {
                step: "02",
                icon: "📊",
                title: "Appraisal",
                color: "purple",
                bg: "bg-purple-50",
                border: "border-purple-200",
                text: "text-purple-700",
                desc: "A licensed appraiser confirms the property value aligns with the purchase price. Protects your client's investment.",
              },
              {
                step: "03",
                icon: "🏦",
                title: "Loan Contingency",
                color: "orange",
                bg: "bg-orange-50",
                border: "border-orange-200",
                text: "text-orange-700",
                desc: "Final loan approval by the underwriter. All outstanding conditions are satisfied before moving forward.",
              },
              {
                step: "04",
                icon: "🎉",
                title: "Close of Escrow",
                color: "green",
                bg: "bg-green-50",
                border: "border-green-200",
                text: "text-green-700",
                desc: "Time to celebrate! Review and sign closing documents. Hand over the keys to your client's new home.",
              },
            ].map((stage, i) => (
              <div
                key={stage.step}
                className={`${stage.bg} border ${stage.border} rounded-2xl p-5 relative`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{stage.icon}</span>
                  <span className={`text-xs font-bold ${stage.text} opacity-40`}>
                    Step {stage.step}
                  </span>
                </div>
                <h3 className={`font-bold text-base ${stage.text} mb-2`}>
                  {stage.title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">{stage.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 z-10 w-4 h-4 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                    <ArrowRight className="w-2 h-2 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auto Email callout */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Automatic Client Notifications
              </h3>
              <p className="text-gray-500 text-sm">
                When you advance a transaction to the next stage, MutualFlow automatically
                sends your client a beautifully designed email explaining the new stage,
                complete with a visual roadmap — so they always feel informed and confident.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
              Platform Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything Your Team Needs
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              A complete toolkit designed for how First Mutual Realty Group actually works.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-5 h-5 text-blue-600" />,
                bg: "bg-blue-50",
                title: "Client CRM",
                desc: "Capture every client's contact details, address, notes, and assigned agent. Search, filter, and stay organized effortlessly.",
              },
              {
                icon: <FileText className="w-5 h-5 text-purple-600" />,
                bg: "bg-purple-50",
                title: "Transaction Tracking",
                desc: "Manage purchase and sale transactions with a clear visual roadmap. Always know which stage each deal is in.",
              },
              {
                icon: <Mail className="w-5 h-5 text-indigo-600" />,
                bg: "bg-indigo-50",
                title: "Automated Emails",
                desc: "Stage-based email campaigns are sent automatically to clients with professional HTML templates and visual roadmaps.",
              },
              {
                icon: <Home className="w-5 h-5 text-orange-600" />,
                bg: "bg-orange-50",
                title: "Document Management",
                desc: "Upload and organize purchase agreements, disclosures, and supporting documents — categorized and searchable.",
              },
              {
                icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                bg: "bg-green-50",
                title: "Task Management",
                desc: "Assign tasks per transaction with priority levels. Track what's done and what still needs attention.",
              },
              {
                icon: <Shield className="w-5 h-5 text-slate-600" />,
                bg: "bg-slate-50",
                title: "Broker Oversight",
                desc: "Edgar can view all agents' clients and transactions, manage the team, and approve completed deals.",
              },
              {
                icon: <BarChart3 className="w-5 h-5 text-pink-600" />,
                bg: "bg-pink-50",
                title: "Office Dashboard",
                desc: "At-a-glance stats: total clients, active transactions, completed deals, and agent performance.",
              },
              {
                icon: <Clock className="w-5 h-5 text-teal-600" />,
                bg: "bg-teal-50",
                title: "Transaction History",
                desc: "A complete record of every deal — who managed it, which stage it reached, what documents were filed.",
              },
              {
                icon: <Building2 className="w-5 h-5 text-blue-700" />,
                bg: "bg-blue-50",
                title: "Role-Based Access",
                desc: "Each agent logs in to their own secure portal. The broker has full management access to the entire office.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-100 transition"
              >
                <div
                  className={`w-10 h-10 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Office Section */}
      <section id="about" className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            First Mutual Realty Group
          </h2>
          <p className="text-blue-100/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            MutualFlow was built exclusively for our team — a purpose-built platform that
            reflects how we work, how we communicate, and how we take care of our clients
            from the first offer acceptance to handing over the keys.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: "🏡",
                title: "Buyer Representation",
                desc: "Guide buyers through every stage with confidence and clear communication.",
              },
              {
                icon: "📋",
                title: "Seller Representation",
                desc: "Manage seller transactions with the same attention to detail and transparency.",
              },
              {
                icon: "🤝",
                title: "Team Collaboration",
                desc: "Broker oversight with individual agent accountability — the best of both worlds.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left"
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-blue-200/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base shadow-lg shadow-blue-900/40"
          >
            Sign In to Your Portal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">MutualFlow</span>
            <span className="text-slate-600">·</span>
            <span className="text-sm">First Mutual Realty Group</span>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} First Mutual Realty Group. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

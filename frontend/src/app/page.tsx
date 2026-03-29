import Link from "next/link";
import {
  Plane,
  Users,
  DollarSign,
  EyeOff,
  ListTodo,
  Gift,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Group Planning",
    desc: "Create groups for any occasion and invite your friends to plan together.",
  },
  {
    icon: EyeOff,
    title: "Hidden Members",
    desc: "Hide the birthday person from gift discussions and expense splits.",
  },
  {
    icon: DollarSign,
    title: "Smart Splits",
    desc: "Split expenses fairly with flexible options for every situation.",
  },
  {
    icon: ListTodo,
    title: "Task Assignment",
    desc: "Assign tasks, set deadlines, and get notified when things get done.",
  },
  {
    icon: Plane,
    title: "Trip Itineraries",
    desc: "Plan day-by-day with maps, time slots, and AI-generated suggestions.",
  },
  {
    icon: Gift,
    title: "Gift Board",
    desc: "Collect gift ideas, vote on favorites, and track contributions.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">Planova</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Now in beta
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight tracking-tight">
            Plan together,
            <br />
            <span className="text-primary">celebrate together</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-xl mx-auto leading-relaxed">
            The easiest way to organise birthday surprises, plan trips, split
            expenses, and coordinate with your group — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Start Planning Free
            </Link>
            <Link
              href="/login"
              className="border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-violet-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground">
              Everything you need to plan as a group
            </h2>
            <p className="text-muted-foreground mt-2">
              No more scattered WhatsApp messages and forgotten Splitwise
              entries.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="bg-white rounded-xl border border-border p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <feat.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feat.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Ready to start planning?
          </h2>
          <p className="text-muted-foreground mt-2">
            Create your first plan in under a minute. It&apos;s free.
          </p>
          <Link
            href="/register"
            className="inline-block mt-6 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-semibold text-primary">Planova</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

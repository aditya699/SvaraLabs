import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AudioWaveform, ArrowRight } from "lucide-react";

export default function Layout() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Floating pill navbar — same pattern as portfolio */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div
          className={`max-w-4xl mx-auto mt-3 sm:mt-4 flex items-center justify-between rounded-full border border-border px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 shadow-nav ${
            scrolled
              ? "bg-white/95 backdrop-blur-md"
              : "bg-white/80 backdrop-blur-sm"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <AudioWaveform className="w-4 h-4 text-gold" />
            </div>
            <span className="font-serif text-lg text-brown">Svara Labs</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-gold/15 text-brown-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Beta
            </span>
          </div>
        </div>
      </motion.nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <AudioWaveform className="w-5 h-5 text-gold" />
            <span className="font-serif text-lg text-brown">Svara Labs</span>
          </Link>
          <p className="text-xs text-brown-muted">
            &copy; {new Date().getFullYear()} Svara Labs. Built with{" "}
            <span className="text-red-400">&#10084;</span> in India.
          </p>
        </div>
      </footer>
    </div>
  );
}

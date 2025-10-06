import { Leaf, Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-primary text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-full p-2">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">SwachhAI</h3>
                <p className="text-xs">स्वच्छ भारत</p>
              </div>
            </div>
            <p className="text-sm opacity-90">
              AI-powered waste management for a cleaner, greener India.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:underline opacity-90 hover:opacity-100">Home</Link></li>
              <li><Link to="/leaderboard" className="hover:underline opacity-90 hover:opacity-100">Leaderboard</Link></li>
              <li><Link to="/contact" className="hover:underline opacity-90 hover:opacity-100">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Citizens</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/auth?type=citizen" className="hover:underline opacity-90 hover:opacity-100">Citizen Login</Link></li>
              <li><Link to="/dashboard" className="hover:underline opacity-90 hover:opacity-100">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:scale-110 transition-transform">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:scale-110 transition-transform">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:scale-110 transition-transform">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:scale-110 transition-transform">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm opacity-90">
          <p>© 2025 SwachhAI | Clean & Green for Atmanirbhar Bharat 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}

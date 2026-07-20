// ============================================================
// Footer — bottom section for public pages
// ============================================================
import { Link } from 'react-router-dom'
import { Zap, Globe, MessageSquare, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12 mt-auto">
      <div className="container-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-electric-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              EV ChargeHub
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Find, book, and manage electric vehicle charging stations across India.
              Powering the green revolution, one charge at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Find Stations', href: '/stations' },
                { label: 'How It Works', href: '/about' },
                { label: 'Pricing', href: '/about' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Legal</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms & Conditions', href: '/terms' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} EV ChargeHub. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

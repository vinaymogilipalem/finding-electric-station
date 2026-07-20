import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Your message has been sent successfully! We will get back to you shortly.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="container-xl py-12 px-4">
      <div className="max-w-3xl mx-auto text-center mb-16 flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
          Contact <span className="text-gradient">EV ChargeHub</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
          Have questions or feedback? We'd love to hear from you. Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
        {/* Contact info */}
        <div className="flex flex-col gap-6 text-left">
          <h2 className="text-2xl font-bold dark:text-white">Get in Touch</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            If you are a station host looking to onboard your chargers, or an EV owner experiencing an issue with your booking, we are here to help.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm dark:text-white">Email Address</h4>
                <p className="text-xs text-gray-500 mt-0.5">support@evchargehub.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm dark:text-white">Phone Support</h4>
                <p className="text-xs text-gray-500 mt-0.5">+91 98765 43210 (Mon-Sat, 9AM - 6PM)</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm dark:text-white">Headquarters</h4>
                <p className="text-xs text-gray-500 mt-0.5">80 Feet Road, 6th Block, Koramangala, Bangalore - 560095</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card p-6 shadow-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="label" htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                required
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                required
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="label" htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                required
                className="input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Query about onboarding"
              />
            </div>
            <div>
              <label className="label" htmlFor="message">Message</label>
              <textarea
                id="message"
                required
                rows={4}
                className="input scrollbar-thin"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your query here..."
              />
            </div>

            <button type="submit" className="btn-primary w-full py-2.5 rounded-xl font-medium mt-2 flex justify-center items-center gap-2">
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactPage

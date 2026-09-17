'use client';
import { useState } from 'react';
import { FadeIn, SlideUp } from "@/components/ui/FadeIn";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you shortly.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <FadeIn>
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-6">
              Contact <span className="text-gold-500 italic font-light">Us</span>
            </h1>
            <p className="text-gray-600 mb-8">
              We'd love to hear from you. Please fill out the form below or reach out to us using the contact details provided.
            </p>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-bold uppercase tracking-widest text-sm mb-1">Email</h3>
                <p>support@herhighness.com</p>
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-widest text-sm mb-1">Phone</h3>
                <p>+91 98765 43210</p>
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-widest text-sm mb-1">Address</h3>
                <p>123 Jewelry Lane, Diamond District,<br />Mumbai, Maharashtra 400001, India</p>
              </div>
            </div>
          </FadeIn>

          <SlideUp delay={0.2}>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Name</label>
                <input required type="text" id="name" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-gold-500 transition-colors" />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email</label>
                <input required type="email" id="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-gold-500 transition-colors" />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Message</label>
                <textarea required id="message" rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-gold-500 transition-colors"></textarea>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-gray-900 text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-gold-600 transition-colors disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </SlideUp>
        </div>
      </main>
    </div>
  );
}

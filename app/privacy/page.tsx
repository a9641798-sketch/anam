import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">

      <main className="flex-1 pt-48 pb-32 px-4">
        <div className="max-w-3xl mx-auto space-y-16">
          <FadeIn className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-medium text-gray-900 uppercase tracking-widest mb-6">Privacy Policy</h1>
            <p className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em]">Last Updated: March 2024</p>
          </FadeIn>

          <section className="space-y-12">
            <article className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b border-gold-100 pb-4">1. Collection of Information</h2>
              <p className="text-gray-500 font-medium leading-relaxed tracking-wide">
                At Her Highness, we value your privacy. We collect personal information such as your name, email address, phone number, and shipping details when you place an order or create an account. This information is used solely to process your orders and provide a personalized shopping experience.
              </p>
            </article>

            <article className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b border-gold-100 pb-4">2. Security of Payments</h2>
              <p className="text-gray-500 font-medium leading-relaxed tracking-wide">
                We use Cashfree, a leading secure payment gateway, to handle all financial transactions. Your credit card and bank details are encrypted and never stored on our servers. We prioritize your financial security and follow industry-standard protocols.
              </p>
            </article>

            <article className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b border-gold-100 pb-4">3. Use of Cookies</h2>
              <p className="text-gray-500 font-medium leading-relaxed tracking-wide">
                Our website uses cookies to enhance your browsing experience, remember your preferences, and maintain items in your shopping cart. You can choose to disable cookies in your browser settings, though this may limit some functionalities of our store.
              </p>
            </article>

            <article className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b border-gold-100 pb-4">4. Sharing with Third Parties</h2>
              <p className="text-gray-500 font-medium leading-relaxed tracking-wide">
                We do not sell or trade your personal information to third parties. We only share necessary data with trusted service providers (like shipping companies and payment processors) to fulfill your requests.
              </p>
            </article>

            <article className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b border-gold-100 pb-4">5. Contact Us</h2>
              <p className="text-gray-500 font-medium leading-relaxed tracking-wide">
                If you have any questions regarding this Privacy Policy or how we handle your data, please contact our support team at <span className="text-gold-600 font-bold">support@herhighness.com</span>.
              </p>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}

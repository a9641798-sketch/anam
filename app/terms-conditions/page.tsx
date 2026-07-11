import Navbar from "@/components/Navbar";
import { FadeIn, SlideUp } from "@/components/ui/FadeIn";

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar cartCount={0} />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <FadeIn>
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-8 text-center">
              Terms & <span className="text-gold-500 italic font-light">Conditions</span>
            </h1>
            
            <div className="prose prose-sm md:prose-base max-w-none text-gray-700 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <SlideUp delay={0.1}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="mb-6">
                  By accessing and placing an order with Her Highness, you confirm that you are in agreement with and bound by the terms of service contained in the Terms & Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and Her Highness.
                </p>
              </SlideUp>

              <SlideUp delay={0.2}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">2. Copyright & Intellectual Property</h2>
                <p className="mb-6">
                  All images, text, designs, graphics, and other content on this website are the property of Her Highness. You may not copy, reproduce, distribute, or create derivative works from this content without our express written permission.
                </p>
              </SlideUp>

              <SlideUp delay={0.3}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">3. Products and Pricing</h2>
                <p className="mb-6">
                  All products are subject to availability. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change.
                </p>
              </SlideUp>

              <SlideUp delay={0.4}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">4. Governing Law</h2>
                <p className="mb-6">
                  These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                </p>
              </SlideUp>
            </div>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}

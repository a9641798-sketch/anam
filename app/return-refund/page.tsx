import Navbar from "@/components/Navbar";
import { FadeIn, SlideUp } from "@/components/ui/FadeIn";

export default function ReturnRefundPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar cartCount={0} />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <FadeIn>
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-8 text-center">
              Return & <span className="text-gold-500 italic font-light">Refund</span> Policy
            </h1>
            
            <div className="prose prose-sm md:prose-base max-w-none text-gray-700">
              <SlideUp delay={0.1}>
                <section className="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">1. Return Conditions</h2>
                  <p className="mb-4">
                    At Her Highness, we maintain a strict quality check. <strong>Returns are only accepted for damaged or wrong items delivered.</strong> We do not accept returns for buyer's remorse or sizing issues (unless we sent the wrong size).
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>The product must be unused and in its original condition.</li>
                    <li>The original packaging, tags, and protective materials must be intact.</li>
                  </ul>
                </section>
              </SlideUp>

              <SlideUp delay={0.2}>
                <section className="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">2. Mandatory Unboxing Video</h2>
                  <p className="mb-4">
                    To claim a return or replacement for a damaged or missing item, an <strong>unboxing video is strictly required</strong>. 
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>The video must show the parcel unopened from all sides before opening.</li>
                    <li>The video must be continuous and unedited, showing the opening of the package and the defect clearly.</li>
                    <li>Claims without a valid unboxing video will be rejected.</li>
                  </ul>
                </section>
              </SlideUp>

              <SlideUp delay={0.3}>
                <section className="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">3. Exchange & Refund Process</h2>
                  <p className="mb-4">
                    If your return request is approved based on the unboxing video, you must initiate the exchange or return within the stated period (typically 3 days from delivery).
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Once we receive the returned item, it will undergo a thorough quality inspection.</li>
                    <li>Refunds or exchanges will only be processed <strong>after the inspection is successful</strong>.</li>
                    <li>Approved refunds will be credited back to the original payment method within 5-7 business days.</li>
                  </ul>
                </section>
              </SlideUp>
            </div>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}

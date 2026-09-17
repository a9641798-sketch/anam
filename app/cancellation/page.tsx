import { FadeIn, SlideUp } from "@/components/ui/FadeIn";

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <FadeIn>
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-8 text-center">
              Cancellation <span className="text-gold-500 italic font-light">Policy</span>
            </h1>
            
            <div className="prose prose-sm md:prose-base max-w-none text-gray-700 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <SlideUp delay={0.1}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">Order Cancellation</h2>
                <p className="mb-4">
                  We understand that sometimes you might change your mind. You can cancel your order under the following conditions:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li>Orders can only be cancelled before they are dispatched.</li>
                  <li>Once an order is shipped and a tracking number is generated, it cannot be cancelled.</li>
                  <li>To request a cancellation, please contact our support team immediately with your Order ID.</li>
                </ul>
              </SlideUp>

              <SlideUp delay={0.2}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">Refunds for Cancelled Orders</h2>
                <p>
                  If you cancel your order before it is dispatched, we will process a full refund to your original payment method. Please allow 5-7 business days for the amount to reflect in your account.
                </p>
              </SlideUp>
            </div>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}

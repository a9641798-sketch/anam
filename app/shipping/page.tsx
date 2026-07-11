import Navbar from "@/components/Navbar";
import { FadeIn, SlideUp } from "@/components/ui/FadeIn";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar cartCount={0} />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <FadeIn>
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-8 text-center">
              Shipping <span className="text-gold-500 italic font-light">Policy</span>
            </h1>
            
            <div className="prose prose-sm md:prose-base max-w-none text-gray-700 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <SlideUp delay={0.1}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">Processing Time</h2>
                <p className="mb-6">
                  All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
                </p>
              </SlideUp>

              <SlideUp delay={0.2}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">Shipping Rates & Delivery Estimates</h2>
                <p className="mb-4">Shipping charges for your order will be calculated and displayed at checkout.</p>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li><strong>Standard Shipping:</strong> 3-5 business days.</li>
                  <li><strong>Express Shipping:</strong> 1-2 business days (Available in select pincodes).</li>
                  <li>Free standard shipping on orders over ₹999.</li>
                </ul>
              </SlideUp>

              <SlideUp delay={0.3}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">Shipment Confirmation & Order Tracking</h2>
                <p>
                  You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours. You can also track your order on our Track Order page.
                </p>
              </SlideUp>
            </div>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}

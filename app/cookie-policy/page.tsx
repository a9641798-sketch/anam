import { FadeIn, SlideUp } from "@/components/ui/FadeIn";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <FadeIn>
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-8 text-center">
              Cookie <span className="text-gold-500 italic font-light">Policy</span>
            </h1>
            
            <div className="prose prose-sm md:prose-base max-w-none text-gray-700 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <SlideUp delay={0.1}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">What Are Cookies</h2>
                <p className="mb-6">
                  As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.
                </p>
              </SlideUp>

              <SlideUp delay={0.2}>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4">How We Use Cookies</h2>
                <p className="mb-4">
                  We use cookies for a variety of reasons detailed below:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li><strong>Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration.</li>
                  <li><strong>Orders processing related cookies:</strong> This site offers e-commerce or payment facilities and some cookies are essential to ensure that your order is remembered between pages so that we can process it properly.</li>
                  <li><strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it.</li>
                </ul>
              </SlideUp>
            </div>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { FadeIn, SlideUp } from "@/components/ui/FadeIn";

const faqs = [
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 3-5 business days. Express shipping is available for select areas and takes 1-2 business days."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Currently, we only ship within India. We plan to expand internationally soon!"
  },
  {
    question: "What is your return policy?",
    answer: "We only accept returns for items that are delivered damaged or if you received the wrong item. An unboxing video is strictly required to process any damage claims."
  },
  {
    question: "How can I track my order?",
    answer: "You can track your order using the 'Track Order' page by entering your Order ID and the email address used during checkout."
  },
  {
    question: "Are your jewelry pieces pure gold/silver?",
    answer: "Our pieces are premium artificial jewelry made from high-grade alloys, elegantly crafted to simulate the look of real precious metals."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 uppercase tracking-wider mb-4">
              Frequently Asked <span className="text-gold-500 italic font-light">Questions</span>
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-sm">Everything you need to know</p>
          </FadeIn>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <SlideUp key={index} delay={index * 0.1}>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                  >
                    <span className="font-bold text-gray-900">{faq.question}</span>
                    <span className={`transform transition-transform text-gold-500 ${openIndex === index ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

import { FadeIn, SlideUp } from '@/components/ui/FadeIn';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-gold-200/40 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <Link href="/" className="font-heading text-xl md:text-2xl font-bold tracking-[0.2em] text-gold-600 uppercase">
            HER HIGHNESS
          </Link>
          <nav className="flex gap-6 md:gap-10">
            <Link href="/" className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-600 hover:text-gold-600 transition-colors">Home</Link>
            <Link href="/shop" className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-600 hover:text-gold-600 transition-colors">Shop</Link>
            <Link href="/about" className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gold-600 transition-colors">About</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-4 bg-gradient-to-b from-white to-[#FDFBF7]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <FadeIn>
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-gold-500 mb-4 block">Our Story</span>
            <h1 className="font-heading text-5xl md:text-7xl font-medium text-gray-900 leading-tight uppercase tracking-tight">The Zenith of <br/><span className="italic text-gold-600">Elegance</span></h1>
          </FadeIn>
          <SlideUp delay={0.2}>
            <p className="text-gray-500 text-lg md:text-xl font-medium tracking-wide leading-relaxed max-w-2xl mx-auto">
              Her Highness was born from a singular vision: to bring the luxury and prestige of high-fashion jewelry to every woman without compromise.
            </p>
          </SlideUp>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-4 border-y border-gold-100/50 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl border border-gold-100">
            <img 
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1000" 
              alt="Craftsmanship" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gold-900/10 mix-blend-overlay"></div>
          </div>
          <div className="space-y-12">
            <div className="space-y-6">
               <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-widest">Masterful Craftsmanship</h2>
               <div className="w-16 h-[2px] bg-gold-500"></div>
            </div>
            <p className="text-gray-500 text-lg leading-relaxed font-medium tracking-wide">
              We believe that jewelry is more than an accessory; it is an extension of one's persona. Our pieces are meticulously crafted using premium materials that mirror the brilliance of diamonds and the luster of pure gold.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed font-medium tracking-wide">
              Every curve, every stone, and every intricate detail is inspected to ensure it meets the royal standards of 'Her Highness'. We bridge the gap between artificial and authentic, creating icons of beauty that last a lifetime.
            </p>
            <div className="pt-8">
               <Link href="/shop" className="inline-flex items-center gap-4 bg-gray-900 text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl hover:-translate-y-1">
                 Explore Collection
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 px-4 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
             <h2 className="font-heading text-4xl font-medium text-gray-900 uppercase tracking-widest mb-6">Our Core Values</h2>
             <div className="w-24 h-[1px] bg-gold-200 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { title: 'Exclusivity', desc: 'Each design is curated to ensure you stand out in every room you enter.' },
              { title: 'Quality', desc: 'We never compromise on materials, ensuring skin-friendly and durable luxury.' },
              { title: 'Elegance', desc: 'Inspired by royalty, our aesthetic remains timeless and sophisticated.' }
            ].map((value, idx) => (
              <SlideUp key={value.title} delay={idx * 0.1} className="text-center space-y-6">
                <div className="text-gold-500 text-4xl mb-4 italic">0{idx + 1}</div>
                <h3 className="font-heading text-xl font-bold text-gray-900 uppercase tracking-[0.2em]">{value.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed tracking-wide px-4">
                  {value.desc}
                </p>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

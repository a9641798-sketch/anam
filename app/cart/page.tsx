'use client';

import { supabase } from '@/lib/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type CartItem = {
  id: string; // Product ID
  name: string;
  price: number;
  quantity: number;
  image: string;
};

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: Review, 2: Shipping, 3: Payment
  
  // Customer & Delivery Address details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [codConfig, setCodConfig] = useState<{ extra_charge: number }>({ extra_charge: 0 });

  useEffect(() => {
    // Fetch COD config
    async function fetchSettings() {
      const { data } = await supabase!
        .from('site_settings')
        .select('value')
        .eq('id', 'cod_config')
        .single();
      if (data) setCodConfig(data.value as any);
    }
    fetchSettings();
    // Load local storage cart — key must match what shop/product pages write
    const saved = localStorage.getItem('cart');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setCart(parsed);
        // Validate cart items against database
        validateCartItems(parsed);
      } catch (e) {
        console.error("Cart loading error:", e);
      }
    }
    setLoading(false);
  }, []);

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const validateCartItems = async (items: CartItem[]) => {
    if (items.length === 0) return;
    
    const ids = items.map(i => i.id).filter(id => UUID_REGEX.test(id));
    if (ids.length === 0) {
      saveCart([]);
      return;
    }

    const { data: validProducts, error } = await supabase!
      .from('products')
      .select('id')
      .in('id', ids);

    if (!error && validProducts) {
      const validIds = new Set(validProducts.map(p => p.id));
      const filtered = items.filter(item => validIds.has(item.id));
      
      if (filtered.length !== items.length) {
        console.warn("Removing invalid products from cart:", items.length - filtered.length);
        saveCart(filtered);
      }
    } else if (error) {
      console.error("Cart validation error:", error);
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (id: string) => {
    saveCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    saveCart(cart.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const codExtraCharge = paymentMethod === 'cod' ? codConfig.extra_charge : 0;
  const totalAmount = subtotal + codExtraCharge;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setProcessing(true);
    
    try {
      // 1. Create Order
      const { data: order, error: orderError } = await supabase!.from('orders').insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        house_no: houseNo,
        street_address: streetAddress,
        landmark: landmark,
        pincode: pincode,
        state: state,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'unpaid' : 'unpaid', // Initial state but explicit
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending' 
      }).select().single();

      if (orderError || !order) {
        console.error("Order Insert Error:", orderError);
        throw new Error('Could not create order');
      }

      // 2. Final Product Validation & Item Mapping
      const productIds = cart.map(item => item.id.trim()).filter(id => UUID_REGEX.test(id));
      
      if (productIds.length === 0) {
         throw new Error('Your cart contains invalid products. Please clear your cart and try again.');
      }

      const { data: verifiedProducts, error: verificationError } = await supabase!
        .from('products')
        .select('id')
        .in('id', productIds);
      
      if (verificationError) {
         console.error("Product Verification Error:", verificationError);
         throw new Error("Failed to verify cart products before checkout.");
      }

      const verifiedIds = new Set(verifiedProducts?.map(p => p.id) || []);
      const validItems = cart.filter(item => verifiedIds.has(item.id.trim()));

      if (validItems.length === 0) {
        // Since we already created an order but all items are invalid, we should ideally mark the order as failed or delete it.
        await supabase!.from('orders').delete().eq('id', order.id);
        throw new Error('All products in your cart are no longer available. Please refresh the shop.');
      }

      const orderItems = validItems.map(item => ({
        order_id: order.id,
        product_id: item.id.trim(),
        quantity: item.quantity,
        price_at_time: item.price
      }));

      console.log("--- SECURE CHECKOUT DIAGNOSTICS ---");
      console.log("Order ID:", order.id);
      console.log("Verified IDs count:", verifiedIds.size);
      console.log("Order Items Payload:", JSON.stringify(orderItems, null, 2));

      const { error: itemsError } = await supabase!.from('order_items').insert(orderItems);
      if (itemsError) {
        console.error("Order Items Insert Failed:", itemsError.message, itemsError.details);
        // If it fails, we should still delete the order fragment or tell the user
        throw new Error(`Could not add items: ${itemsError.message}`);
      }

      // 3. Clear cart
      localStorage.removeItem('cart');
      
      // 4. Redirect
      if (paymentMethod === 'cod') {
        router.push(`/checkout/${order.id}/success`);
      } else {
        router.push(`/checkout/${order.id}`);
      }
      
    } catch (err) {
      console.error(err);
      alert('Checkout failed. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-gold-200/40 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <Link href="/" className="font-heading text-xl md:text-2xl font-bold tracking-[0.2em] text-gold-600 uppercase">
            Her Highness
          </Link>
          <nav className="flex gap-6 md:gap-10">
            <Link href="/" className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-600 hover:text-gold-600 transition-colors">Home</Link>
            <Link href="/shop" className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-600 hover:text-gold-600 transition-colors">Shop</Link>
            <Link href="/cart" className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gold-600 transition-colors">Cart</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 flex-1 w-full">
        {/* Step Indicator */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-between relative">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gold-100 -translate-y-1/2 z-0"></div>
             {[1, 2, 3].map((s) => (
                <div key={s} className="relative z-10 flex flex-col items-center">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm transition-all duration-500 
                    ${activeStep >= s ? 'bg-gold-500 border-gold-500 text-white shadow-lg scale-110' : 'bg-white border-gold-200 text-gray-300'}`}>
                      {s}
                   </div>
                   <span className={`text-[9px] uppercase tracking-widest font-bold mt-3 transition-colors duration-500 ${activeStep >= s ? 'text-gold-600' : 'text-gray-300'}`}>
                      {s === 1 ? 'Review' : s === 2 ? 'Shipping' : 'Payment'}
                   </span>
                </div>
             ))}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 w-full">
            <p className="text-gray-500 mb-8 tracking-widest uppercase text-sm font-semibold">Your royal cart is empty.</p>
            <Link href="/shop" className="inline-block bg-white border border-gold-300 text-gold-600 hover:bg-gold-500 hover:border-gold-500 hover:text-white px-10 py-4 rounded-full uppercase tracking-[0.2em] text-xs font-bold transition-all shadow-[0_4px_14px_rgba(212,175,55,0.15)]">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
            
            {/* Main Content Column */}
            <div className="lg:col-span-12 xl:col-span-8">
              
              {/* STEP 1: CART REVIEW */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="font-heading text-2xl font-bold text-gray-900 uppercase tracking-widest">Review Your Items</h2>
                    <div className="h-[1px] flex-1 bg-gold-100"></div>
                  </div>
                  {cart.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-6 bg-white p-4 sm:p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gold-100/50">
                      <div className="w-full sm:w-24 sm:h-24 md:w-32 md:h-32 aspect-square sm:aspect-auto rounded-xl bg-[#FCFBF8] border border-gold-50 overflow-hidden shrink-0 relative">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-contain p-2" />
                        ) : (
                          <div className="w-full h-full bg-gray-50"></div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-heading text-lg font-semibold text-gray-900 tracking-wide uppercase mb-1">{item.name}</h3>
                            <p className="text-gold-600 font-bold tracking-wider">₹{item.price.toFixed(2)}</p>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2 shrink-0">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border border-gray-100 rounded-full bg-[#fafafa] p-1 w-full sm:w-auto justify-between">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-6 sm:px-4 py-2 sm:py-1 text-gray-400 font-bold hover:text-gray-900">&minus;</button>
                            <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-6 sm:px-4 py-2 sm:py-1 text-gray-400 font-bold hover:text-gray-900">&#43;</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-8 flex justify-end">
                    <button onClick={() => setActiveStep(2)} className="bg-gold-500 hover:bg-gold-600 text-white px-12 py-5 rounded-full uppercase tracking-[0.2em] text-xs font-bold transition-all shadow-lg">
                       Continue to Shipping &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SHIPPING DETAILS */}
              {activeStep === 2 && (
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.05)] border border-gold-100/50 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-10">
                    <h2 className="font-heading text-2xl font-bold text-gray-900 uppercase tracking-widest">Delivery Address</h2>
                    <div className="h-[1px] flex-1 bg-gold-100"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-4">
                       <h3 className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2">Recipient Info</h3>
                       <input required type="text" placeholder="Full Name" className="w-full border border-gray-100 rounded-xl px-4 py-4 focus:ring-1 focus:ring-gold-400 bg-[#FCFBF8] text-sm" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input required type="email" placeholder="Email Address" className="w-full border border-gray-100 rounded-xl px-4 py-4 focus:ring-1 focus:ring-gold-400 bg-[#FCFBF8] text-sm" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                         <input required type="tel" placeholder="Phone Number" className="w-full border border-gray-100 rounded-xl px-4 py-4 focus:ring-1 focus:ring-gold-400 bg-[#FCFBF8] text-sm" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                       </div>
                    </div>
                    <div className="col-span-2 space-y-4 mt-6">
                       <h3 className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2">Shipping Destination</h3>
                       <input required type="text" placeholder="House/Flat No." className="w-full border border-gray-100 rounded-xl px-4 py-4 focus:ring-1 focus:ring-gold-400 bg-[#FCFBF8] text-sm" value={houseNo} onChange={e => setHouseNo(e.target.value)} />
                       <input required type="text" placeholder="Street/Area" className="w-full border border-gray-100 rounded-xl px-4 py-4 focus:ring-1 focus:ring-gold-400 bg-[#FCFBF8] text-sm" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} />
                       <input type="text" placeholder="Landmark (Optional)" className="w-full border border-gray-100 rounded-xl px-4 py-4 focus:ring-1 focus:ring-gold-400 bg-[#FCFBF8] text-sm" value={landmark} onChange={e => setLandmark(e.target.value)} />
                       <div className="grid grid-cols-2 gap-4">
                         <input required type="text" placeholder="Pincode" className="w-full border border-gray-100 rounded-xl px-4 py-4 focus:ring-1 focus:ring-gold-400 bg-[#FCFBF8] text-sm" value={pincode} onChange={e => setPincode(e.target.value)} />
                         <select required className="w-full border border-gray-100 rounded-xl px-4 py-4 focus:ring-1 focus:ring-gold-400 bg-[#FCFBF8] text-sm appearance-none" value={state} onChange={e => setState(e.target.value)}>
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                       </div>
                    </div>
                  </div>
                  <div className="pt-12 flex justify-between items-center">
                    <button onClick={() => setActiveStep(1)} className="text-[10px] uppercase tracking-widest text-gray-400 font-bold hover:text-gold-600 transition-colors border-b border-gray-200 hover:border-gold-300 pb-1">
                       &larr; Back to Items
                    </button>
                    <button 
                      onClick={() => {
                        if (customerName && customerEmail && customerPhone && houseNo && streetAddress && pincode && state) setActiveStep(3);
                        else alert("Please fill in all required shipping details.");
                      }} 
                      className="bg-gold-500 hover:bg-gold-600 text-white px-12 py-5 rounded-full uppercase tracking-[0.2em] text-xs font-bold transition-all shadow-lg"
                    >
                       Choose Payment &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT METHOD */}
              {activeStep === 3 && (
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.05)] border border-gold-100/50 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-10">
                    <h2 className="font-heading text-2xl font-bold text-gray-900 uppercase tracking-widest">Select Payment Method</h2>
                    <div className="h-[1px] flex-1 bg-gold-100"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <button 
                        onClick={() => setPaymentMethod('online')}
                        className={`p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group
                        ${paymentMethod === 'online' ? 'border-gold-500 bg-gold-50/30' : 'border-gray-100 hover:border-gold-200'}`}
                     >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors 
                          ${paymentMethod === 'online' ? 'border-gold-500 bg-gold-500 text-white' : 'border-gray-300'}`}>
                           {paymentMethod === 'online' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 uppercase tracking-widest">Online Payment</h4>
                          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">UPI, Cards, Netbanking</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                           <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09h-2.82l-2.09-2.09h2.09l-1-1 1.42-1.42 1 1h2.82l2.09 2.09zM18 10h-2l-1-1-1.42 1.42 1 1H10v2h4.59l-1 1 1.42 1.42 1-1H18v-2.84z"></path></svg>
                        </div>
                     </button>

                     <button 
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group
                        ${paymentMethod === 'cod' ? 'border-gold-500 bg-gold-50/30' : 'border-gray-100 hover:border-gold-200'}`}
                     >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors 
                          ${paymentMethod === 'cod' ? 'border-gold-500 bg-gold-500 text-white' : 'border-gray-300'}`}>
                           {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 uppercase tracking-widest">Cash on Delivery</h4>
                          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">Pay when your order arrives</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                           <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v4H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-11 4c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm3 2c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1z"></path></svg>
                        </div>
                     </button>
                  </div>

                  <div className="mt-12 pt-12 border-t border-gold-100">
                    <p className="text-[10px] text-center text-gray-400 tracking-widest uppercase mb-10">By placing your order, you agree to our Terms of Service & Privacy Policy</p>
                    <div className="flex justify-between items-center">
                      <button onClick={() => setActiveStep(2)} className="text-[10px] uppercase tracking-widest text-gray-400 font-bold hover:text-gold-600 transition-colors border-b border-gray-200 hover:border-gold-300 pb-1">
                         &larr; Back to Shipping
                      </button>
                      <button 
                        onClick={handleCheckout} 
                        disabled={processing}
                        className={`px-16 py-5 rounded-full uppercase tracking-[0.2em] text-xs font-bold transition-all text-white
                          ${processing ? 'bg-gray-400' : 'bg-gold-500 hover:bg-gold-600 shadow-[0_12px_24px_-8px_rgba(212,175,55,0.5)]'}`}
                      >
                        {processing ? 'Processing...' : paymentMethod === 'cod' ? 'Confirm Royal Order' : 'Complete Online Payment'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Summary Column */}
            <div className="lg:col-span-12 xl:col-span-4">
              <div className="bg-white p-8 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.05)] border border-gold-100/50 xl:sticky xl:top-32">
                <h2 className="font-heading text-xl font-bold text-gray-900 mb-6 uppercase tracking-[0.1em] border-b border-gold-100 pb-4">Bill Summary</h2>
                
                <div className="space-y-4 mb-8 text-sm tracking-wider font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-gray-900">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600 uppercase text-xs font-bold tracking-widest">Complimentary</span>
                  </div>
                  {paymentMethod === 'cod' && codConfig.extra_charge > 0 && (
                    <div className="flex justify-between animate-in fade-in slide-in-from-right-2">
                       <span className="flex items-center gap-1.5">
                          COD Extra Charge
                          <div className="group relative">
                             <svg className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-gray-900 text-white text-[8px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center uppercase tracking-tighter">
                                Additional fee handling Cash on Delivery
                             </div>
                          </div>
                       </span>
                       <span className="text-gray-900">₹{codConfig.extra_charge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gold-100/50 pt-4 font-bold text-lg text-gray-900">
                    <span className="uppercase tracking-[0.1em]">Grand Total</span>
                    <span className="text-gold-600 font-extrabold">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {activeStep > 1 && (
                  <div className="p-4 bg-gold-50/50 rounded-xl border border-gold-100 mb-4 animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Shipping To:</span>
                    </div>
                    <p className="text-[10px] text-gray-600 font-semibold uppercase leading-tight">
                       {customerName}<br/>
                       {houseNo}, {streetAddress}<br/>
                       {state}, {pincode}
                    </p>
                  </div>
                )}
                
                <div className="text-[9px] text-center text-gray-300 tracking-[0.2em] font-bold uppercase mt-8 border-t border-gold-50 pt-6">
                   Secure Transaction Verified ✦
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Warm Premium Footer */}
      <footer className="bg-white text-gray-900 py-20 border-t border-gold-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <Link href="/" className="font-heading text-3xl md:text-4xl font-semibold tracking-[0.1em] text-gold-600 mb-6 uppercase drop-shadow-sm">
            Her Highness
          </Link>
          <div className="w-16 h-[2px] bg-gold-300 mb-6"></div>
          <p className="text-gray-500 text-xs md:text-sm tracking-widest uppercase leading-relaxed max-w-lg mb-12 font-medium">
            The zenith of artificial jewelry design. Redefining elegance through masterful craftsmanship and premium materials.
          </p>
          <div className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold">
            &copy; {new Date().getFullYear()} Her Highness. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

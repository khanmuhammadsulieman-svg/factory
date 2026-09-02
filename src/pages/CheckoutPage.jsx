import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle2, HandCoins, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import useSettings from '@/hooks/useSettings';
import { pkr } from '@/lib/money';

const PAKISTAN_CITIES = [
  "Abbottabad", "Attock", "Bahawalnagar", "Bahawalpur", "Bhakkar", "Burewala", "Chakwal", "Chiniot", "Dadu", "Dera Ghazi Khan", "Dera Ismail Khan", "Faisalabad", "Gojra", "Gujranwala", "Gujrat", "Hafizabad", "Hyderabad", "Islamabad", "Jacobabad", "Jalalpur", "Jatlan", "Jhang", "Jhelum", "Kamoke", "Karachi", "Kasur", "Khairpur", "Khanewal", "Khanpur", "Kohat", "Kot Adu", "Lahore", "Larkana", "Mandi Bahauddin", "Mardan", "Mianwali", "Mingora", "Mirpur Khas", "Multan", "Muridke", "Muzaffargarh", "Nawabshah", "Nowshera", "Okara", "Pakpattan", "Peshawar", "Quetta", "Rahim Yar Khan", "Rawalpindi", "Sadiqabad", "Sahiwal", "Sargodha", "Sheikhupura", "Shikarpur", "Sialkot", "Sukkur", "Swabi", "Tando Adam", "Tando Allahyar", "Turbat", "Vehari", "Wazirabad"
];

const CheckoutPage = () => {
  const { items, subtotal, clear } = useCart();
  const settings = useSettings();

  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setActiveUser(user);
        setForm((f) => ({
          ...f,
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || user.user_metadata?.mobile || '',
          address: user.user_metadata?.address || '',
          city: user.user_metadata?.city || ''
        }));
      }
    });
  }, []);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  const [payment, setPayment] = useState('cod');
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [submitError, setSubmitError] = useState('');

  const deliveryFee = form.city === '' ? 0 : 200;
  const total = subtotal + deliveryFee;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.address.trim()) errs.address = 'Delivery address is required';
    if (!form.city.trim()) errs.city = 'Please select a city';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setPlacing(true);
    setSubmitError('');

    if (payment === 'card') {
      await redirectToSubdomainCheckout();
    } else {
      await saveOrderToDatabase({ payment_status: 'pending', gateway: 'COD', tracker: '' });
    }
  };

  const redirectToSubdomainCheckout = async () => {
    try {
      const currentTotal = total;
      const userId = activeUser?.id || null;

      let recordId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      const orderPayload = {
        id: recordId,
        customer_name: form.name,
        customer_id: userId,
        customer_email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        notes: form.notes || '',
        items: items,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: currentTotal,
        payment_method: 'Online Card',
        payment_status: 'pending',
        gateway_tracker: '',
        status: 'new'
      };

      try {
        const { data, error } = await supabase.from('orders').insert([orderPayload]).select().single();
        if (error) console.warn('Supabase order sync notice:', error.message);
        else if (data?.id) recordId = data.id;
      } catch (dbErr) {
        console.warn('Supabase order sync error:', dbErr);
      }

      const localOrders = JSON.parse(localStorage.getItem('fos_customer_orders') || '[]');
      const newOrderObj = {
        id: recordId,
        created: new Date().toISOString(),
        payment_method: 'Online Card',
        total: currentTotal,
        items: JSON.stringify(items),
        customer_email: form.email,
        customer_id: userId
      };
      localStorage.setItem('fos_customer_orders', JSON.stringify([newOrderObj, ...localOrders]));

      clear();

      window.location.href = `https://checkout.factoryoutletshoes.store?amount=${currentTotal.toFixed(2)}&orderId=${recordId}&email=${encodeURIComponent(form.email)}&name=${encodeURIComponent(form.name)}`;

    } catch (err) {
      console.error('Subdomain redirect error:', err);
      setSubmitError('Could not initialize secure checkout redirect.');
      setPlacing(false);
    }
  };

  const saveOrderToDatabase = async (paymentDetails) => {
    try {
      const currentTotal = total;
      const userId = activeUser?.id || null;

      let recordId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      const orderPayload = {
        id: recordId,
        customer_name: form.name,
        customer_id: userId,
        customer_email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        notes: form.notes || '',
        items: items,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: currentTotal,
        payment_method: paymentDetails.gateway,
        payment_status: paymentDetails.payment_status,
        gateway_tracker: paymentDetails.tracker,
        status: 'new'
      };

      try {
        const { data, error } = await supabase.from('orders').insert([orderPayload]).select().single();
        if (error) console.warn('Supabase sync fallback for COD:', error.message);
        else if (data?.id) recordId = data.id;
      } catch (dbErr) {
        console.warn('Supabase sync fallback error:', dbErr);
      }

      const localOrders = JSON.parse(localStorage.getItem('fos_customer_orders') || '[]');
      const newOrderObj = {
        id: recordId,
        created: new Date().toISOString(),
        payment_method: paymentDetails.gateway,
        total: currentTotal,
        items: JSON.stringify(items),
        customer_email: form.email,
        customer_id: userId
      };
      localStorage.setItem('fos_customer_orders', JSON.stringify([newOrderObj, ...localOrders]));

      clear();
      setOrderId(recordId);
      setPlacing(false);
    } catch (err) {
      console.error('Order creation error:', err);
      setSubmitError('Failed to submit order to database. Please check your details and try again.');
      setPlacing(false);
    }
  };

  if (orderId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Helmet><title>Order Confirmed | Factory Outlet Shoes</title></Helmet>
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-card border p-8 rounded-2xl shadow-sm space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">Thank you for shopping with us. Your order ID is <span className="font-mono font-semibold text-foreground">{orderId}</span>.</p>
            <p className="text-xs text-muted-foreground">We have sent your confirmation details to <span className="font-medium text-foreground">{form.email}</span>.</p>

            <div className="flex gap-3 mt-4">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/my-orders">View My Orders</Link>
              </Button>
              <Button asChild className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet><title>Checkout | Factory Outlet Shoes</title></Helmet>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">

        <h1 className="text-2xl font-bold mb-6">Complete Your Order</h1>

        {submitError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-200">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6 bg-card border p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold border-b pb-3">Shipping Details</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={set('name')} placeholder="Full Name" required />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={form.phone} onChange={set('phone')} placeholder="03001234567" required />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <Input id="address" value={form.address} onChange={set('address')} placeholder="House/Street, Area" required />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <select
                  id="city"
                  value={form.city}
                  onChange={set('city')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>Select your city</option>
                  {PAKISTAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea id="notes" value={form.notes} onChange={set('notes')} placeholder="Special instructions for delivery" />
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h2 className="text-lg font-semibold">Payment Method</h2>
              <RadioGroup value={payment} onValueChange={setPayment} className="space-y-3">

                <div className="flex items-center space-x-3 border p-3 rounded-lg cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex items-center space-x-2 cursor-pointer flex-1">
                    <HandCoins className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Cash on Delivery (COD)</p>
                      <p className="text-xs text-muted-foreground">Pay cash when your parcel arrives</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border p-3 rounded-lg cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Online Card Payment</p>
                      <p className="text-xs text-muted-foreground">Pay securely via our dedicated gateway subdomain</p>
                    </div>
                  </Label>
                </div>

              </RadioGroup>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border p-6 rounded-xl shadow-sm space-y-4">
              <h2 className="text-lg font-semibold border-b pb-3">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{pkr(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipment Charges</span>
                  <span className="text-primary font-semibold">
                    {form.city === '' ? 'Select City' : pkr(deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">{pkr(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={placing || form.city === ''}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 hover:bg-primary/90"
              >
                {placing ? 'Processing...' : payment === 'card' ? 'Proceed to Secure Payment' : 'Place Order'}
              </Button>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;

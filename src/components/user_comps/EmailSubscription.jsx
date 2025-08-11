import { useState } from 'react';
import { HiOutlineMail } from 'react-icons/hi';
import { FaCheck } from 'react-icons/fa';
import { FiShield } from 'react-icons/fi';

function EmailSubscription() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  const resetSubscription = () => {
    setIsSubscribed(false);
  };

  return (
    <section className="w-full px-4 py-10 md:px-10 lg:px-20 bg-[#fefafc]">
      <div className="max-w-4xl mx-auto text-center">
        {!isSubscribed ? (
          <>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <HiOutlineMail className="text-main-color text-2xl" />
              Subscribe for Updates
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get exclusive offers and fragrance drops in your inbox
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full sm:w-64 px-4 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-full focus:outline-none focus:border-main-color transition"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 text-sm bg-main-color text-white rounded-full hover:bg-main-color/90 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </div>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>

            <div className="mt-3 text-xs text-gray-500 flex items-center justify-center gap-1">
              <FiShield className="text-sm" />
              <span>No spam — unsubscribe anytime</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center items-center mb-3">
              <FaCheck className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Subscribed Successfully!
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Check your inbox for exclusive offers
            </p>
            <button
              onClick={resetSubscription}
              className="text-sm border border-main-color text-main-color px-4 py-1.5 rounded-full hover:bg-main-color hover:text-white transition"
            >
              Subscribe Another
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default EmailSubscription;

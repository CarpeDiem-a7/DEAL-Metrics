import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DealHub India - Best Price Comparison & Deals",
  description:
    "Compare prices across Amazon India, Flipkart, Myntra, and more. Get instant alerts, discover bank offers, and earn affiliate rewards.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">💰 DealHub</div>
          </div>
          <div className="flex gap-4">
            <Link href="/deals" className="text-gray-700 hover:text-blue-600">
              Deals
            </Link>
            <Link href="/compare" className="text-gray-700 hover:text-blue-600">
              Compare
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Find the Best Deals Across India
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Compare prices on Amazon India, Flipkart, Myntra, and 5+ more
          platforms. Get instant price alerts and earn affiliate rewards.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-semibold">Real-time Comparison</h3>
            <p className="text-gray-600 text-sm">
              Compare prices across all platforms instantly
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl">🔔</div>
            <h3 className="text-lg font-semibold">Price Alerts</h3>
            <p className="text-gray-600 text-sm">
              Get notified when prices drop below your target
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl">💸</div>
            <h3 className="text-lg font-semibold">Earn Rewards</h3>
            <p className="text-gray-600 text-sm">
              Earn affiliate commissions on every purchase
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center mb-8">
          <Link
            href="/deals"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Explore Deals
          </Link>
          <Link
            href="/extension"
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
          >
            Install Extension
          </Link>
        </div>

        {/* Platform Logos */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <p className="text-gray-600 mb-6 font-semibold">
            We compare prices on:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              "Amazon",
              "Flipkart",
              "Myntra",
              "Ajio",
              "Croma",
              "Nykaa",
              "Meesho",
              "FirstCry",
              "Tata Cliq",
              "Reliance",
            ].map((platform) => (
              <div
                key={platform}
                className="text-center text-gray-700 font-semibold"
              >
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose DealHub?
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">📱 Chrome Extension</h3>
              <p className="text-gray-700 mb-4">
                Get instant price comparisons while shopping. Our extension
                automatically detects products and shows you better deals.
              </p>
              <Link
                href="/extension"
                className="text-blue-600 font-semibold hover:underline"
              >
                Download Now →
              </Link>
            </div>

            <div className="bg-green-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">💰 Earn Rewards</h3>
              <p className="text-gray-700 mb-4">
                Every purchase through our affiliate links earns you rewards.
                Convert them to cash or use for future shopping.
              </p>
              <Link
                href="/affiliate"
                className="text-green-600 font-semibold hover:underline"
              >
                Learn More →
              </Link>
            </div>

            <div className="bg-purple-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">🏦 Bank Offers</h3>
              <p className="text-gray-700 mb-4">
                Get exclusive bank and card offers. Find the best payment
                methods for maximum savings.
              </p>
              <Link
                href="/offers"
                className="text-purple-600 font-semibold hover:underline"
              >
                View Offers →
              </Link>
            </div>

            <div className="bg-yellow-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">📊 Price History</h3>
              <p className="text-gray-700 mb-4">
                Track price trends over time. See if you're getting a real deal
                with our price history charts.
              </p>
              <Link
                href="/compare"
                className="text-yellow-600 font-semibold hover:underline"
              >
                Compare Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Saving Today</h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of Indian shoppers saving money every day
          </p>
          <Link
            href="/signup"
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold"
          >
            Sign Up Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">DealHub</h3>
              <p className="text-gray-400 text-sm">
                Find the best deals across India's top e-commerce platforms.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>
                  <Link href="/deals">Deals</Link>
                </li>
                <li>
                  <Link href="/compare">Compare</Link>
                </li>
                <li>
                  <Link href="/offers">Bank Offers</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/affiliate">Affiliate Program</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms of Service</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2026 DealHub India. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Made with ❤️ for Indian shoppers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

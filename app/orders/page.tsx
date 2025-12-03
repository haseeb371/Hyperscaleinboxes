"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";

interface PublicOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  packageType: "byod" | "full";
  numberOfDomains: number;
  totalAccounts: number;
  status: string;
  progressStatus: string;
  progressPercentage: number;
  createdAt: string;
}

export default function OrdersPage() {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setHasSearched(true);

    if (!email.trim() && !orderId.trim()) {
      setError("Please enter an email or an order ID.");
      return;
    }

    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (email.trim()) params.append("email", email.trim());
      if (orderId.trim()) params.append("orderId", orderId.trim());

      const res = await fetch(`/api/orders/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to search orders");
      }

      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to search orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)",
      }}
    >
      <Navigation />

      <div className="container mx-auto px-6 lg:px-20 py-24 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            <span className="font-normal">Your</span>{" "}
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              Order History
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
            Enter the email you used at checkout to see all of your orders, or paste an order ID if
            you only want to look up a specific purchase.
          </p>
        </div>

        {/* Search Card */}
        <form
          onSubmit={handleSearch}
          className="rounded-3xl border px-6 py-6 md:px-8 md:py-7 mb-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-5 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Email address used at checkout
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 focus:outline-none text-white placeholder-gray-500"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderColor: "rgba(255,255,255,0.12)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 110, 64, 0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
              <p className="mt-2 text-[11px] text-gray-500">
                Shows <span className="text-orange-300">all</span> orders placed with this email.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Order ID (optional)
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Full ID or last 6–8 characters"
                className="w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 focus:outline-none text-white placeholder-gray-500"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderColor: "rgba(255,255,255,0.12)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 110, 64, 0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
              <p className="mt-2 text-[11px] text-gray-500">
                Optional. Use when you only want to see{" "}
                <span className="text-orange-300">one specific</span> order.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-[11px] md:text-xs text-gray-500 max-w-md">
              We only show high‑level order details and delivery progress – no billing or payment
              data is displayed here.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300"
              style={{
                background: isLoading
                  ? "rgba(255, 110, 64, 0.5)"
                  : "linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching orders…
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search orders
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-xs md:text-sm text-orange-300 font-medium">
              {error}
            </p>
          )}
        </form>

        {/* Results */}
        {!isLoading && hasSearched && orders.length === 0 && !error && (
          <div
            className="rounded-3xl border px-6 py-10 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(15,23,42,0.98) 100%)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div className="mx-auto mb-4 w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(15,23,42,1)",
              }}
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h2 className="text-sm md:text-base font-semibold text-white mb-2">
              No orders found
            </h2>
            <p className="text-xs md:text-sm text-gray-400 max-w-sm mx-auto">
              Double‑check the email or order ID you entered. If you’ve used a
              different email at checkout, try searching with that instead.
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-3xl border px-5 py-5 md:px-6 md:py-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] tracking-wide text-gray-400">
                      Order ID
                    </p>
                    <p className="text-xs md:text-sm font-mono text-gray-100 break-all">
                      {order.orderId}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {order.customerEmail}
                    </p>
                  </div>
                  <div className="text-left md:text-right space-y-1">
                    <p className="text-[11px] tracking-wide text-gray-400">
                      Placed on
                    </p>
                    <p className="text-xs md:text-sm text-gray-100">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1">Package</p>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{
                        background:
                          order.packageType === "full"
                            ? "rgba(248, 113, 113, 0.2)"
                            : "rgba(59, 130, 246, 0.18)",
                        color:
                          order.packageType === "full"
                            ? "#fecaca"
                            : "#bfdbfe",
                        border:
                          order.packageType === "full"
                            ? "1px solid rgba(248, 113, 113, 0.4)"
                            : "1px solid rgba(59, 130, 246, 0.4)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mr-1.5"
                        style={{
                          background:
                            order.packageType === "full"
                              ? "#fb923c"
                              : "#60a5fa",
                        }}
                      />
                      {order.packageType === "full" ? "Full Package" : "BYOD"}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1">Domains</p>
                    <p className="text-xs md:text-sm text-gray-100">
                      {order.numberOfDomains}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1">Accounts</p>
                    <p className="text-xs md:text-sm text-gray-100">
                      {order.totalAccounts}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1">Status</p>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
                      style={{
                        background: "rgba(31, 41, 55, 0.95)",
                        color: "#e5e7eb",
                        border: "1px solid rgba(55, 65, 81, 1)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-400" />
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-gray-400">
                      Delivery progress
                    </p>
                    <p className="text-[11px] text-gray-300 font-medium">
                      {order.progressPercentage}% complete
                    </p>
                  </div>
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(31, 41, 55, 1)" }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${order.progressPercentage}%`,
                        background:
                          "linear-gradient(to right, #22c55e, #a3e635)",
                      }}
                    ></div>
                  </div>
                  {order.progressStatus && (
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {order.progressStatus}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



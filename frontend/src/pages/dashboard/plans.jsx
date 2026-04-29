// ✅ Samruddhi ✨ Plans page with current plan highlight + remaining days

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlans, createOrder } from "../../api/subscriptionService";
import { getPlanBenefits } from "../../api/planBenefits";
import { useSubscription } from "../../hook/useSubscription";

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // ✅ Samruddhi ✨ getting subscription + remaining days
  const { subscription, remainingDays } = useSubscription();

  const location = useLocation();
  const isForced = location.state?.forced;

  useEffect(() => {
    getPlans()
      .then((data) => setPlans(data.results || data))
      .catch((err) => {
        console.error("Failed to load plans:", err);
      });
  }, []);

  const handleBuy = async (plan) => {
    if (!plan || plan.price <= 0) return;

    try {
      setLoadingId(plan.id);

      const order = await createOrder(plan.id);

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        order_id: order.order_id,
        name: "TrackIntake",
        description: `${plan.name} Plan`,
        handler: () => {
          window.location.href = "/dashboard"; // ✅ redirect after purchase
        },
        theme: { color: "#ff7a18" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Create order failed:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      
      {isForced && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded mb-6 text-center">
          ⚠️ You’ll need to purchase a plan before you can proceed.
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-gray-500">
          Upgrade anytime to unlock premium health features
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.plan?.id === plan.id;
          const isFeatured = plan.name?.toLowerCase() === "go";
          const benefits = getPlanBenefits(plan);

          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-6 shadow-sm transition-all duration-300 ${
                // ✅ Samruddhi ✨ highlight current plan
                isCurrentPlan
                  ? "border-orange-500 ring-2 ring-orange-400 bg-orange-50"
                  : isFeatured
                  ? "border-orange-500 ring-2 ring-orange-400"
                  : ""
              }`}
            >
              {/* Recommended badge */}
              {isFeatured && !isCurrentPlan && (
                <div className="text-center text-sm text-orange-600 font-semibold mb-2">
                  Recommended
                </div>
              )}

              {/* Plan Name */}
              <h2
                className={`text-xl font-semibold text-center ${
                  isCurrentPlan ? "text-orange-600" : ""
                }`}
              >
                {plan.name}
              </h2>

              {/* Price */}
              <div className="text-center my-4">
                <span className="text-3xl font-bold">₹{plan.price}</span>
                {plan.price > 0 && (
                  <span className="text-sm"> /{plan.duration_days} days</span>
                )}

                {/* ✅ Samruddhi ✨ Remaining Days */}
                {isCurrentPlan && (
                  <p className="mt-2 text-center text-sm text-gray-400 font-semibold">
                     {remainingDays} days remaining
                  </p>
                )}
              </div>

              {/* Benefits */}
              <ul className="text-sm space-y-2 mb-6">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    ✔ {benefit}
                  </li>
                ))}
              </ul>

              {/* Button */}
              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-2 rounded-lg font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  disabled={loadingId === plan.id}
                  onClick={() => handleBuy(plan)}
                  className="w-full py-2 rounded-lg font-semibold bg-orange-500 text-white hover:bg-orange-600"
                >
                  {loadingId === plan.id ? "Processing..." : "Buy Now"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlansPage;
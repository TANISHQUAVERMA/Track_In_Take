import { useNavigate } from "react-router-dom";
import { useSubscription } from "../../hook/useSubscription";
import { useEffect, useState } from "react";
import { getPlans } from "../../api/subscriptionService";
import { getPlanBenefits } from "../../api/planBenefits";

export default function UpgradeCard() {
  const navigate = useNavigate();
  const { subscription, loading } = useSubscription();
  const [upgradePlan, setUpgradePlan] = useState(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const plans = await getPlans(token);
        const paidPlans = plans.filter(p => p.price > 0);

        const cheapestPaidPlan = paidPlans.sort(
          (a, b) => a.price - b.price
        )[0];

        setUpgradePlan(cheapestPaidPlan);
      } catch (err) {
        console.error("Failed to load plans", err);
      }
    };

    loadPlans();
  }, []);

  if (loading || !upgradePlan) return null;

  const isFreePlan =
    !subscription || subscription.plan?.price === 0;

  // Hide for paid users
  if (!isFreePlan) return null;

  const benefits = getPlanBenefits(upgradePlan);

  return (
    <div className="mx-4 my-6 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-white p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <span className="inline-block mb-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
          FREE PLAN
        </span>

        <h3 className="text-lg font-semibold text-gray-900">
          Unlock {upgradePlan.name} Plan Benefits
        </h3>

        <p className="mt-1 text-sm text-gray-600 max-w-xl">
          Upgrade to the{" "}
          <span className="font-medium text-orange-600">
            {upgradePlan.name} Plan
          </span>{" "}
          and get {benefits.join(", ")}.
        </p>
      </div>

      <button
        onClick={() => navigate("/dashboard/plans")}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-600"
      >
        Upgrade Now ⚡
      </button>
    </div>
  );
}

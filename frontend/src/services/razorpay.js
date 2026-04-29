export const openRazorpay = (order) => {
  const options = {
    key: order.key, // public razorpay key
    amount: order.amount,
    currency: "INR",
    order_id: order.order_id,
    name: "TrackIntake",
    description: "Subscription Purchase",

    handler: () => {
      alert("Payment successful 🎉");
      window.location.href = "/dashboard";
    },

    theme: {
      color: "#ff7a18",
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

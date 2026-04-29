export function getPlanBenefits(plan) {
  const benefits = [];

  if (plan.meal_log_allowed) benefits.push("Meal Logging");
  if (plan.water_intake_allowed) benefits.push("Water Intake Tracking");
  if (plan.weight_tracker_allowed) benefits.push("Weight Tracker");
  if (plan.custom_reminder_allowed) benefits.push("Custom Reminders");
  if (plan.chat_allowed) benefits.push("Chat with Nutritionist");
  if (plan.nutrition_search_allowed) benefits.push("Nutrition Search");
  if (plan.ai_diet_allowed) benefits.push("AI Diet Plans");
  if (plan.appointment_allowed) benefits.push("Appointments");
  if (plan.BMI_Calculator_allowed) benefits.push("BMI Calculator");
  if (plan.Fat_Calculator_allowed) benefits.push("Fat Calculator");
  if (plan.inhouse_consults > 0) benefits.push(`${plan.inhouse_consults} In-house Consults`);
  if (plan.expert_consults > 0) benefits.push(`${plan.expert_consults} Expert Consults`);
  if (plan.duration_days) benefits.push(`${plan.duration_days} Days Validity`);

  return benefits;
}
import json
import os
import requests
from groq import Groq
from django.db.models import Q, Sum
from datetime import date

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')


# ─────────────────────────────────────────────
# Image — Pexels
# ─────────────────────────────────────────────
def generate_ai_food_image(food_name: str) -> str:
    pexels_key = os.getenv('PEXELS_API_KEY', '')
    if not pexels_key:
        return ''
    query = f"{food_name} cooked plated dish served restaurant food photography"
    try:
        res = requests.get(
            'https://api.pexels.com/v1/search',
            params={'query': query, 'per_page': 15, 'orientation': 'square'},
            headers={'Authorization': pexels_key},
            timeout=5,
        )
        if res.status_code != 200:
            return ''
        photos = res.json().get('photos', [])
        RAW_KEYWORDS    = {'raw', 'ingredient', 'seed', 'grain', 'uncooked', 'dry', 'dried', 'spice', 'powder', 'market', 'isolated', 'white background'}
        COOKED_KEYWORDS = {'food', 'dish', 'meal', 'plate', 'bowl', 'cooked', 'served', 'restaurant', 'cuisine', 'recipe', 'lunch', 'dinner', 'breakfast'}
        best_photo, best_score = None, -99
        for photo in photos:
            alt   = photo.get('alt', '').lower()
            score = sum(1 for kw in COOKED_KEYWORDS if kw in alt) - sum(2 for kw in RAW_KEYWORDS if kw in alt)
            if score > best_score:
                best_score = score
                best_photo = photo
        if best_photo:
            return best_photo['src']['large']
    except Exception:
        pass
    return ''


# ─────────────────────────────────────────────
# YouTube URL
# ─────────────────────────────────────────────
def get_youtube_url(food_name: str) -> str:
    query = food_name.replace(' ', '+') + '+recipe+Indian'
    return f"https://www.youtube.com/results?search_query={query}"


# ─────────────────────────────────────────────
# Calories consumed today from UserMeal
# ─────────────────────────────────────────────
def get_calories_consumed_today(user, target_date=None):
    from userFood.models import UserMeal
    if target_date is None:
        target_date = date.today()
    agg = UserMeal.objects.filter(user=user, date=target_date).aggregate(total=Sum('calories'))
    return round(float(agg['total'] or 0), 1)


# ─────────────────────────────────────────────
# Safe foods query — adapted for TrackEats FoodItem
# TrackEats FoodItem uses:
#   - food_types (M2M → FoodType.name)
#   - meal_types (M2M → MealType.name)
#   - allergens  (M2M → Allergen.name)
#   - estimated_gi, sodium_mg
# ─────────────────────────────────────────────
def get_safe_foods_for_meal(profile, meal_type: str):
    from userFood.models import FoodItem

    # Prefer verified foods first
    qs = FoodItem.objects.filter(meal_types__name__iexact=meal_type).order_by('-is_verified', 'name')

    # Diet type filter
    diet_type = (profile.diet_type or '').lower().strip()
    if diet_type in ('vegetarian', 'vegan', 'eggetarian'):
        qs = qs.exclude(food_types__name__icontains='Non-Vegetarian')
    elif diet_type == 'non vegetarian':
        pass  # no restriction

    # Allergy exclusion — allergies is a comma-separated text field in TrackEats
    allergies_raw = getattr(profile, 'allergies', '') or ''
    for allergen in [a.strip() for a in allergies_raw.split(',') if a.strip()]:
        qs = qs.exclude(allergens__name__icontains=allergen)

    # Medical filters
    if getattr(profile, 'is_diabetic', False):
        qs = qs.filter(Q(estimated_gi__lt=55) | Q(estimated_gi__isnull=True))
    if getattr(profile, 'is_hypertensive', False):
        qs = qs.filter(Q(sodium_mg__lt=200) | Q(sodium_mg__isnull=True))

    return qs.distinct()


# ─────────────────────────────────────────────
# Build prompt
# ─────────────────────────────────────────────
def build_prompt(profile, safe_foods_by_meal: dict, calories_remaining: float):
    from utils.utils import get_target_nutrients

    targets        = get_target_nutrients(profile.user)
    calorie_target = targets.get('recommended_calories', 2000)

    country        = getattr(profile, 'country', None) or 'India'
    allergy_list   = profile.allergies or 'None'
    conditions     = []
    if getattr(profile, 'is_diabetic',          False): conditions.append('Diabetic')
    if getattr(profile, 'is_hypertensive',       False): conditions.append('Hypertensive')
    if getattr(profile, 'has_heart_condition',   False): conditions.append('Heart condition')
    if getattr(profile, 'has_thyroid_disorder',  False): conditions.append('Thyroid disorder')
    if getattr(profile, 'has_gastric_issues',    False): conditions.append('Gastric issues')
    conditions_str = ', '.join(conditions) or 'None'

    breakfast_budget = round(calories_remaining * 0.25)
    lunch_budget     = round(calories_remaining * 0.40)
    dinner_budget    = round(calories_remaining * 0.35)

    def format_food_list(foods):
        import random
        shuffled = list(foods)
        random.shuffle(shuffled)
        lines = [f"- {f.name} ({f.calories} kcal/serving)" for f in shuffled[:20]]
        return '\n'.join(lines) if lines else 'No items available.'

    return f"""You are a Clinical Dietitian AI.

USER PROFILE:
- Country: {country}
- Goal: {profile.goal}
- Diet: {profile.diet_type}
- Medical: {conditions_str}
- Allergies (STRICT BLOCK): {allergy_list}
- Calories remaining today: {round(calories_remaining)} kcal
- Breakfast budget: {breakfast_budget} kcal
- Lunch budget: {lunch_budget} kcal
- Dinner budget: {dinner_budget} kcal

STRICT RULES:
1. ONLY use food names EXACTLY from the lists below
2. NEVER suggest foods containing: {allergy_list}
3. Each meal must have EXACTLY 3 options
4. "label" must be a SHORT DESCRIPTIVE MEAL NAME (e.g. "Idli with Sambar", "Grilled Chicken Salad")
5. Keep total_calories within ±50 kcal of the meal budget
6. Prefer foods from {country} cuisine, but include global options too

AVAILABLE FOODS:
Breakfast (budget: {breakfast_budget} kcal):
{format_food_list(safe_foods_by_meal.get('Breakfast', []))}

Lunch (budget: {lunch_budget} kcal):
{format_food_list(safe_foods_by_meal.get('Lunch', []))}

Dinner (budget: {dinner_budget} kcal):
{format_food_list(safe_foods_by_meal.get('Dinner', []))}

Return ONLY valid JSON, no markdown:
{{
  "plan_summary": "One line personalized advice for this user",
  "meals": {{
    "Breakfast": {{
      "calorie_budget": {breakfast_budget},
      "options": [
        {{"label": "Meal Name", "total_calories": 0, "items": [{{"food_name": "Exact name", "quantity_g": 100, "calories": 0, "protein_g": 0, "prep_note": "Short tip"}}]}},
        {{"label": "Meal Name", "total_calories": 0, "items": []}},
        {{"label": "Meal Name", "total_calories": 0, "items": []}}
      ]
    }},
    "Lunch": {{
      "calorie_budget": {lunch_budget},
      "options": [{{"label": "...", "total_calories": 0, "items": []}}, {{"label": "...", "total_calories": 0, "items": []}}, {{"label": "...", "total_calories": 0, "items": []}}]
    }},
    "Dinner": {{
      "calorie_budget": {dinner_budget},
      "options": [{{"label": "...", "total_calories": 0, "items": []}}, {{"label": "...", "total_calories": 0, "items": []}}, {{"label": "...", "total_calories": 0, "items": []}}]
    }}
  }}
}}"""


# ─────────────────────────────────────────────
# Enrich with images + YouTube
# ─────────────────────────────────────────────
def enrich_with_media(plan: dict) -> dict:
    for meal_data in plan.get('meals', {}).values():
        for option in meal_data.get('options', []):
            for item in option.get('items', []):
                food_name          = item.get('food_name', '')
                item['image_url']   = generate_ai_food_image(food_name)
                item['youtube_url'] = get_youtube_url(food_name)
    return plan


# ─────────────────────────────────────────────
# Main generate function
# ─────────────────────────────────────────────
def generate_meal_recommendation(user, target_date=None):
    from userProfile.models import UserProfile
    from utils.utils import get_target_nutrients

    if target_date is None:
        target_date = date.today()

    profile = UserProfile.objects.get(user=user)

    if not profile.goal or not profile.diet_type:
        raise ValueError("Profile incomplete: goal and diet_type required")

    targets        = get_target_nutrients(user)
    calorie_target = targets.get('recommended_calories')
    if not calorie_target:
        raise ValueError("Cannot calculate calorie target — complete height, weight, DOB")

    calories_consumed  = get_calories_consumed_today(user, target_date)
    calories_remaining = max(calorie_target - calories_consumed, 300)

    safe_foods = {
        meal: list(get_safe_foods_for_meal(profile, meal))
        for meal in ['Breakfast', 'Lunch', 'Dinner']
    }

    # Auto-seed if any meal type has fewer than 5 foods
    low_meals = [meal for meal, foods in safe_foods.items() if len(foods) < 5]
    if low_meals:
        import threading
        from userFood.management.commands.seed_foods_ai import seed_foods_for_diet
        diet = profile.diet_type or 'Vegetarian'
        def _bg_seed():
            for meal in low_meals:
                try:
                    seed_foods_for_diet(diet, meal_type=meal)
                except Exception:
                    pass
        threading.Thread(target=_bg_seed, daemon=True).start()

    for meal, foods in safe_foods.items():
        if len(foods) < 2:
            safe_foods[meal] = []  # fallback: let Groq generate freely

    client   = Groq(api_key=GROQ_API_KEY)
    prompt   = build_prompt(profile, safe_foods, calories_remaining)
    response = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[{'role': 'user', 'content': prompt}],
        response_format={'type': 'json_object'},
        temperature=0.3,
    )

    plan = json.loads(response.choices[0].message.content)
    plan = enrich_with_media(plan)

    return plan, calories_remaining, calories_consumed

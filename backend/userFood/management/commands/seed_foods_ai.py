import json
import os
from django.core.management.base import BaseCommand
from groq import Groq
from userFood.models import FoodItem, MealType, FoodType, Allergen

ALL_DIET_TYPES = ['Vegetarian', 'Vegan', 'Non Vegetarian', 'Eggetarian', 'Keto']
ALL_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner']


def seed_foods_for_diet(diet_type, meal_type=None, stdout=None):
    client = Groq(api_key=os.getenv('GROQ_API_KEY', ''))

    meal_filter = f'only for {meal_type}' if meal_type else 'covering Breakfast, Lunch, and Dinner'

    prompt = f"""
Generate 30 unique healthy food items suitable for {diet_type} diet, {meal_filter}.
Include diverse cuisines from around the world: Indian, Mediterranean, East Asian, Middle Eastern, American, European, Latin American, African, Southeast Asian, etc.
Return ONLY a JSON object with key "foods" containing an array.

Each item must follow this structure exactly:
{{
  "name": "Food Name",
  "suitable_for_meal": ["Breakfast"],
  "calories": 150,
  "protein": 8.0,
  "carbs": 20.0,
  "fats": 4.0,
  "fiber": 2.0,
  "sugar": 3.0,
  "sodium_mg": 100,
  "estimated_gi": 50,
  "gram_equivalent": 200,
  "default_unit": "piece",
  "allergens": []
}}

Rules:
- suitable_for_meal must only contain values from: Breakfast, Lunch, Dinner
- allergens must only contain values from: Gluten, Nuts, Dairy, Eggs, Soy, Fish
- gram_equivalent is the weight in grams for one default serving
- All numeric fields must be realistic values for that cuisine
- Generate diverse, popular dishes from different countries and cultures
- Spread evenly across cuisines, avoid repeating the same cuisine more than 5 times
"""

    if stdout:
        stdout.write(f'  Seeding {diet_type} foods ({meal_filter})...')

    chat = client.chat.completions.create(
        messages=[{'role': 'user', 'content': prompt}],
        model='llama-3.3-70b-versatile',
        response_format={'type': 'json_object'},
    )

    data  = json.loads(chat.choices[0].message.content)
    foods = data.get('foods', [])
    count = 0

    # Get or create diet FoodType
    diet_type_obj, _ = FoodType.objects.get_or_create(name=diet_type)

    for f in foods:
        try:
            obj, created = FoodItem.objects.update_or_create(
                name=f['name'],
                defaults={
                    'calories':       float(f.get('calories', 0)),
                    'protein':        float(f.get('protein', 0)),
                    'carbs':          float(f.get('carbs', 0)),
                    'fats':           float(f.get('fats', 0)),
                    'fiber':          float(f.get('fiber', 0)),
                    'sugar':          float(f.get('sugar', 0)),
                    'sodium_mg':      float(f.get('sodium_mg', 0)),
                    'estimated_gi':   f.get('estimated_gi'),
                    'gram_equivalent':float(f.get('gram_equivalent', 100)),
                    'default_unit':   f.get('default_unit', 'piece'),
                    'is_verified':    True,
                }
            )

            # Add meal types
            for mt_name in f.get('suitable_for_meal', ALL_MEAL_TYPES):
                mt, _ = MealType.objects.get_or_create(name=mt_name)
                obj.meal_types.add(mt)

            # Add food type (diet)
            obj.food_types.add(diet_type_obj)

            # Add allergens
            for a_name in f.get('allergens', []):
                allergen, _ = Allergen.objects.get_or_create(name=a_name)
                obj.allergens.add(allergen)

            if stdout:
                stdout.write(f"    {'Created' if created else 'Updated'}: {obj.name}")
            count += 1

        except Exception as e:
            if stdout:
                stdout.write(f"    ERROR on {f.get('name', '?')}: {e}")

    return count


class Command(BaseCommand):
    help = 'Seed food items using Groq AI for TrackEats FoodItem model'

    def add_arguments(self, parser):
        parser.add_argument('--diet', type=str, default=None, help='Specific diet type e.g. Vegetarian')
        parser.add_argument('--meal', type=str, default=None, help='Specific meal type e.g. Breakfast')

    def handle(self, *args, **kwargs):
        diet = kwargs.get('diet')
        meal = kwargs.get('meal')
        diets_to_seed = [diet] if diet else ALL_DIET_TYPES

        total = 0
        for d in diets_to_seed:
            try:
                count = seed_foods_for_diet(d, meal_type=meal, stdout=self.stdout)
                total += count
                self.stdout.write(self.style.SUCCESS(f'  {d}: {count} items seeded'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  {d}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'\nTotal {total} food items seeded!'))

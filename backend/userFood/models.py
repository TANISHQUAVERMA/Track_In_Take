from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.forms import ValidationError
from django.utils import timezone
from django.conf import settings


########_---------------------------------Normalize----------##################################

# These are the allowed values for FODMAP, Spice, and Purine level fields in FoodItem.
# Example: Dal has fodmap_level="Low", Garlic has fodmap_level="High"
LEVEL_CHOICES = [
    ("Low", "Low"),
    ("Medium", "Medium"),
    ("High", "High"),
    ("Moderate", "Moderate"),
    ("Mild", "Mild"),
    ("None", "None"),
]


# Master table for food categories.
# Example rows in DB: "Vegetarian", "Vegan", "Non-Vegetarian"
# FoodItem links to this via ManyToMany — Dal → ["Vegetarian", "Vegan"]
class FoodType(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.name


# Master table for meal time categories.
# Example rows in DB: "Breakfast", "Lunch", "Dinner", "Snack"
# FoodItem links to this via ManyToMany — Poha → ["Breakfast", "Mid-Morning Snack"]
class MealType(models.Model):
    name = models.CharField(max_length=40, unique=True)

    def __str__(self):
        return self.name


# Master table for allergens.
# Example rows in DB: "Gluten", "Dairy", "Nuts"
# FoodItem links to this via ManyToMany — Bread → ["Gluten"]
class Allergen(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# Main food database table.
# Every food (Dal, Roti, Rice etc.) is stored here with complete nutrition data.
# Gemini AI fills this table the FIRST time a food is searched.
# From second time onwards, data comes directly from this table — no Gemini call.
#
# Example row:
#   name             = "Dal"
#   default_quantity = 1
#   default_unit     = "Bowl"
#   gram_equivalent  = 250      ← 1 Bowl Dal = 250ml/g (set by Gemini)
#   calories         = 116      ← per 1 Bowl (set by Gemini from USDA/NIN India)
#   protein          = 9
#   carbs            = 20
#   fats             = 0.4
class FoodItem(models.Model):

    # ── Basic Info ────────────────────────────────────────────────────────────

    # Unique food name. No two foods can have same name.
    # Example: "Dal", "Roti", "Cooked White Rice", "Maggi Noodles"
    name = models.CharField(
        max_length=150, unique=True,
        help_text="The unique name of the food item."
    )

    # How much of this food = 1 default serving.
    # Example: Roti → 1 (1 piece), Rice → 100 (100g), Dal → 1 (1 bowl)
    default_quantity = models.FloatField(default=1, help_text="e.g., 1, 2, 100")

    # Unit for the default serving.
    # Example: "Piece" for Roti, "Gram" for Rice, "Bowl" for Dal
    default_unit = models.CharField(
        max_length=20, default="piece",
        help_text="e.g., piece, cup, bowl, g"
    )

    # Weight in grams/ml of 1 default serving.
    # This is the KEY field for nutrient scaling calculations.
    # Example: 1 Bowl Dal = 250ml  → gram_equivalent = 250
    # Example: 1 Piece Roti = 40g → gram_equivalent = 40
    # Set by Gemini AI from USDA / NIN India database.
    gram_equivalent = models.FloatField(
        null=True, blank=True,
        help_text="The equivalent weight in grams for the default serving (e.g., 1 cup = 240ml)"
    )

    # ── Core Macronutrients ───────────────────────────────────────────────────
    # All values below are PER DEFAULT SERVING (not per 100g).
    # Example: Dal 1 Bowl → calories=116, protein=9, carbs=20, fats=0.4

    calories = models.FloatField(help_text="Calories (kcal)")
    protein  = models.FloatField(help_text="Protein in grams")
    carbs    = models.FloatField(help_text="Carbohydrates in grams")
    fats     = models.FloatField(help_text="Total Fat in grams")
    sugar    = models.FloatField(null=True, blank=True, help_text="Sugar in grams")
    fiber    = models.FloatField(null=True, blank=True, help_text="Fiber in grams")

    # ── Fat Profile ───────────────────────────────────────────────────────────
    saturated_fat_g = models.FloatField(null=True, blank=True, verbose_name="Saturated Fat (g)")
    trans_fat_g     = models.FloatField(null=True, blank=True, verbose_name="Trans Fat (g)")

    # ── Glycemic Data ─────────────────────────────────────────────────────────
    # GI (0-100): how fast food raises blood sugar.
    # Dal GI ≈ 29 (Low — good for diabetics), White Rice GI ≈ 72 (High)
    estimated_gi  = models.FloatField(null=True, blank=True, verbose_name="Estimated Glycemic Index")
    glycemic_load = models.FloatField(null=True, blank=True, verbose_name="Glycemic Load")

    # ── Minerals ─────────────────────────────────────────────────────────────
    sodium_mg    = models.FloatField(null=True, blank=True, verbose_name="Sodium (mg)")
    potassium_mg = models.FloatField(null=True, blank=True, verbose_name="Potassium (mg)")
    iron_mg      = models.FloatField(null=True, blank=True, verbose_name="Iron (mg)")
    calcium_mg   = models.FloatField(null=True, blank=True, verbose_name="Calcium (mg)")
    iodine_mcg   = models.FloatField(null=True, blank=True, verbose_name="Iodine (mcg)")
    zinc_mg      = models.FloatField(null=True, blank=True, verbose_name="Zinc (mg)")
    magnesium_mg = models.FloatField(null=True, blank=True, verbose_name="Magnesium (mg)")
    selenium_mcg = models.FloatField(null=True, blank=True, verbose_name="Selenium (mcg)")

    # ── Vitamins & Other Nutrients ────────────────────────────────────────────
    cholesterol_mg  = models.FloatField(null=True, blank=True, verbose_name="Cholesterol (mg)")
    omega_3_g       = models.FloatField(null=True, blank=True, verbose_name="Omega-3 (g)")
    vitamin_d_mcg   = models.FloatField(null=True, blank=True, verbose_name="Vitamin D (mcg)")
    vitamin_b12_mcg = models.FloatField(null=True, blank=True, verbose_name="Vitamin B12 (mcg)")

    # ── Classification ────────────────────────────────────────────────────────
    # FODMAP: how much this food causes IBS/bloating. Low = safe for IBS.
    fodmap_level = models.CharField(
        max_length=10, choices=LEVEL_CHOICES, default="Low",
        verbose_name="FODMAP Level"
    )
    spice_level = models.CharField(
        max_length=10, choices=LEVEL_CHOICES, default="Low",
        verbose_name="Spice Level"
    )
    # Purine: high purine foods trigger gout. Dal = Low, Red Meat = High.
    purine_level = models.CharField(
        max_length=10, choices=LEVEL_CHOICES, default="Low",
        verbose_name="Purine Level"
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    # ManyToMany = one food can have multiple types/meal times/allergens.
    # Example: Dal → food_types=["Vegetarian","Vegan"], meal_types=["Lunch","Dinner"]
    food_types = models.ManyToManyField(FoodType, blank=True, related_name="food_items")
    meal_types = models.ManyToManyField(MealType, blank=True, related_name="food_items")
    allergens  = models.ManyToManyField(Allergen, blank=True, related_name="food_items")

    # ── Verification ─────────────────────────────────────────────────────────
    # False by default — Gemini fills data, not manually verified.
    # Admin can set True after checking manually.
    is_verified = models.BooleanField(
        default=False,
        help_text="True if data has been manually verified."
    )
    source_url = models.URLField(
        max_length=512, null=True, blank=True,
        help_text="URL of the nutritional data source (e.g., USDA)."
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)  # Set once when first created
    updated_at = models.DateTimeField(auto_now=True)      # Updates every time record is saved

    class Meta:
        ordering = ['name']  # All food queries return A-Z order by default

    def __str__(self):
        return self.name


###############################----------------------------Food Table End---------------------################################

# ── Changed by Rishika - Start ──
# Fix: Pehle sirf dry mass units (g, kg, mg) the.
# Rishika ne ml, liter, glass add kiye taaki liquid foods (Dal, Juice, Milk) sahi calculate hon.
#
# Pehle kya hota tha:
#   User logs 150ml Dal → "ml" not in dict → PATH B → factor = 150 (WRONG! 150x calories)
#
# Ab kya hota hai:
#   User logs 150ml Dal → "ml" in dict → PATH A → logged=150ml → factor=150/250=0.6 ✅
#
# How it works:
#   logged_amount = user_quantity × conversion_factor
#   Example: 2 liters  → 2 × 1000 = 2000ml
#   Example: 500ml     → 500 × 1.0 = 500ml
#   Example: 1 glass   → 1 × 250 = 250ml
#
# Note: Bowl, Piece, Plate are NOT here because frontend converts them to ml/g before sending.
#   PATH B handles any unit that is not in this dict.
MASS_UNIT_TO_GRAMS = {
    "g": 1.0,     "gram": 1.0,                               # 1g = 1g (no conversion)
    "kg": 1000.0, "kilogram": 1000.0,                        # 1kg = 1000g
    "mg": 0.001,  "milligram": 0.001,                        # 1mg = 0.001g
    "ml": 1.0,    "milliliter": 1.0,  "milliliters": 1.0,    # 1ml = 1g (water density) — Added by Rishika
    "l": 1000.0,  "liter": 1000.0,    "liters": 1000.0,      # 1L = 1000ml              — Added by Rishika
    "glass": 250.0,                                           # 1 glass = 250ml           — Added by Rishika
}
# ── Changed by Rishika - End ──


# This table stores every meal that every user logs.
# Example: "User Ahmed logged 2 Bowl Dal at Lunch on 08-Apr-2026"
#
# IMPORTANT: Nutrition values (calories, protein etc.) are calculated and stored
# as a SNAPSHOT at save time. If FoodItem data changes later, old meals stay accurate.
class UserMeal(models.Model):

    # ── Choices ───────────────────────────────────────────────────────────────

    # ── Changed by Rishika - Start ──
    # Fix: "Glass" unit add kiya UNIT_CHOICES mein.
    # Pehle "Glass" nahi tha toh "1 Glass Milk" PATH B mein jaata tha:
    #   Old: factor = 1 / default_quantity → wrong scaling
    #   New: "glass" in MASS_UNIT_TO_GRAMS → PATH A → 1×250=250ml → factor=250/gram_equivalent ✅
    UNIT_CHOICES = [
        ("Gram", "Gram"),
        ("Kilogram", "Kilogram"),
        ("Milliliters", "Milliliters"),
        ("Liters", "Liters"),
        ("Glass", "Glass"),        # Added by Rishika — 1 Glass = 250ml in MASS_UNIT_TO_GRAMS
        ("Cup", "Cup"),
        ("Bowl", "Bowl"),
        ("Piece", "Piece"),
        ("Tbsp", "Tablespoon"),
        ("Tsp", "Teaspoon"),
        ("Slice", "Slice"),
        ("Plate", "Plate"),
        ("Handful", "Handful"),
        ("Pinch", "Pinch"),
        ("Dash", "Dash"),
        ("Sprinkle", "Sprinkle"),
        ("Other", "Other"),
    ]
    # ── Changed by Rishika - End ──

    # All valid meal time options.
    MEAL_CHOICES = [
        ("Early-Morning", "Early-Morning"),
        ("Breakfast", "Breakfast"),
        ("Mid-Morning Snack", "Mid-Morning Snack"),
        ("Lunch", "Lunch"),
        ("Afternoon Snack", "Afternoon Snack"),
        ("Dinner", "Dinner"),
        ("Bedtime", "Bedtime"),
    ]

    # ── Core Fields ───────────────────────────────────────────────────────────

    # Which user logged this meal. Deleting user also deletes their meals.
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Which FoodItem was logged. If FoodItem deleted → this becomes NULL (meal kept).
    food_item = models.ForeignKey('FoodItem', on_delete=models.SET_NULL, null=True, blank=True)

    # Food name saved as text snapshot — safe even if FoodItem is deleted later.
    # Auto-filled from food_item.name in save() method.
    food_name = models.CharField(max_length=150, blank=True, null=True)

    # Converted quantity sent by frontend for calculation.
    # Example: user logged "2 Bowl Dal" → frontend converts → quantity=500 (ml)
    quantity = models.FloatField()

    # Unit after frontend conversion. Usually "Milliliters" or "Gram" after frontend processes.
    # default="Gram" means if no unit provided, assume Gram.
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default="Gram")

    # Which meal time this was logged under.
    meal_type = models.CharField(max_length=30, choices=MEAL_CHOICES)

    # Exact date+time when the meal was eaten.
    # If not provided, save() auto-sets it to current time.
    consumed_at = models.DateTimeField(blank=True, null=True)

    # Just the date part — used for date-based filtering (show all meals on April 8).
    # Auto-set from consumed_at in save() method.
    date = models.DateField(blank=True, null=True)

    # Optional user notes. Example: "homemade", "less oil", "restaurant"
    remarks = models.TextField(blank=True)

    # ── Nutritional Snapshot Fields ───────────────────────────────────────────
    # Calculated and saved at logging time by _calculate_and_set_nutrients().
    # Even if FoodItem nutrition changes later, these old values stay accurate.
    #
    # Example: User logs 2 Bowl Dal
    #   FoodItem.calories = 116 (per 1 Bowl = 250ml)
    #   factor = 500/250 = 2.0
    #   self.calories = 116 × 2.0 = 232 kcal ← stored here
    calories      = models.FloatField(blank=True, null=True)
    protein       = models.FloatField(blank=True, null=True)
    carbs         = models.FloatField(blank=True, null=True)
    fats          = models.FloatField(blank=True, null=True)
    sugar         = models.FloatField(blank=True, null=True)
    fiber         = models.FloatField(blank=True, null=True)
    estimated_gi  = models.FloatField(blank=True, null=True)  # Not scaled — property of food
    glycemic_load = models.FloatField(blank=True, null=True)
    food_type     = models.CharField(max_length=30, blank=True, null=True)  # e.g. "Vegetarian"

    # ── Nutrient Calculation ──────────────────────────────────────────────────

    def _calculate_and_set_nutrients(self):
        """
        Scales FoodItem's per-serving nutrition to match what the user actually logged.

        PATH A — Mass/volume units (g, kg, ml, liter, glass):
            factor = logged_amount_in_g_or_ml / gram_equivalent
            Example: User logs 150ml Dal, gram_equivalent=250
                     factor = 150/250 = 0.6 → calories = 116 × 0.6 = 69.6 kcal ✅

        PATH B — Count/serving units (Piece, Cup, Bowl, Plate) OR gram_equivalent missing:
            factor = user_quantity / default_quantity
            Example: User logs 3 Roti, default_quantity=1
                     factor = 3/1 = 3.0 → calories = 120 × 3.0 = 360 kcal ✅
        """
        if not self.food_item:
            return

        food_item       = self.food_item
        user_quantity   = self.quantity        # Already converted by frontend (e.g. 500)
        user_unit_lower = self.unit.lower()    # e.g. "milliliters", "gram"

        factor = 1.0  # Default — no scaling

        # ── Changed by Rishika - Start ──
        # Fix: Pehle ka broken logic:
        #   1. gram_equivalent missing hone par hard return karta tha → calculation skip hoti thi
        #   2. PATH B mein factor = user_quantity tha → default_quantity se divide nahi karta tha
        #   3. "ml", "liter", "glass" MASS_UNIT_TO_GRAMS mein nahi the →
        #      150ml Dal → PATH B → factor=150 → calories=116×150=17400 kcal (WRONG!)
        #
        # Rishika ka fix:
        #   PATH A: g/kg/ml/liter/glass → MASS_UNIT_TO_GRAMS se convert → gram_equivalent se divide
        #           Agar gram_equivalent missing → PATH B fallback (no hard stop)
        #   PATH B: Bowl/Piece/Cup etc. → user_quantity / default_quantity (correct ratio)
        #
        # Example of fix:
        #   User logs 150ml Dal, gram_equivalent=250
        #   Old: "ml" not in old dict → factor=150 → calories=116×150=17400 kcal ❌
        #   New: PATH A → logged=150×1.0=150ml → factor=150/250=0.6 → calories=69.6 kcal ✅

        if user_unit_lower in MASS_UNIT_TO_GRAMS:
            # PATH A: Known mass/volume unit (g, kg, ml, liter, glass)
            if not food_item.gram_equivalent or food_item.gram_equivalent <= 0:
                # gram_equivalent missing — fallback to count-based scaling (PATH B)
                # Example: FoodItem has no gram_equivalent set
                #   user_quantity=500, default_quantity=250 → factor=500/250=2.0
                base_qty = food_item.default_quantity if food_item.default_quantity and food_item.default_quantity > 0 else 1.0
                factor = user_quantity / base_qty
            else:
                # Normal PATH A:
                # Step 1 — Convert user's logged amount to ml/g
                # Example: user logs 2 liters → 2×1000=2000ml
                # Example: user logs 150ml    → 150×1.0=150ml
                logged_amount = user_quantity * MASS_UNIT_TO_GRAMS[user_unit_lower]

                # Step 2 — Find scaling factor
                # Example: logged=150ml, gram_equivalent=250ml → factor=0.6
                # Means: user ate 0.6× the default serving → all nutrients × 0.6
                factor = logged_amount / food_item.gram_equivalent

        else:
            # PATH B: Piece, Cup, Bowl, Plate, Tbsp etc.
            # Frontend already converts Bowl/Piece to ml/g before sending here.
            # But if original unit somehow arrives here, scale by count ratio.
            # Example: user logs 3 pieces, default_quantity=1 → factor=3/1=3.0
            base_qty = food_item.default_quantity if food_item.default_quantity and food_item.default_quantity > 0 else 1.0
            factor = user_quantity / base_qty

        # ── Changed by Rishika - End ──

        # Multiply each FoodItem nutrient by factor and round to 2 decimal places.
        # Returns None if original value was None (unknown nutrient stays unknown).
        # Example: Dal protein=9g, factor=2.0 → self.protein=18.0g
        def calc(value):
            return round(value * factor, 2) if value is not None else None

        self.calories      = calc(food_item.calories)
        self.protein       = calc(food_item.protein)
        self.carbs         = calc(food_item.carbs)
        self.fats          = calc(food_item.fats)
        self.sugar         = calc(food_item.sugar)
        self.fiber         = calc(food_item.fiber)
        self.estimated_gi  = food_item.estimated_gi   # GI is NOT scaled — it's a food property
        self.glycemic_load = calc(food_item.glycemic_load)
        self.food_type     = food_item.food_types.first().name if food_item.food_types.exists() else 'N/A'

    def save(self, *args, **kwargs):
        """
        Runs automatically every time a UserMeal is saved.
        Ensures food_name, nutrients, date and time are always correctly set.
        """
        if self.food_item:
            # Copy food name as text snapshot (safe if FoodItem deleted later)
            self.food_name = self.food_item.name
            # Calculate and store all nutrient values for this specific meal
            self._calculate_and_set_nutrients()

        # If user didn't provide consumed_at, use current time
        if not self.consumed_at:
            self.consumed_at = timezone.now()

        # Extract date from consumed_at for easy date-based filtering
        if not self.date:
            self.date = self.consumed_at.date()

        # Call Django's original save() to write to database
        super().save(*args, **kwargs)

    def __str__(self):
        # Example: "ahmed's Lunch on 2026-04-08"
        return f"{self.user.get_username()}'s {self.get_meal_type_display()} on {self.date}"

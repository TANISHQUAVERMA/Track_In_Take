Nutrition AI - Database Schema Guide

Welcome to the Nutrition AI project! This document provides a comprehensive overview of the application's database schema. The entire schema is defined in a single, monolithic models.py file for simplicity.

This guide is designed to help developers quickly understand the purpose of each model, its key fields, and how it relates to other models in the system.
Core Concepts & Schema Overview

The application revolves around a few core concepts:

    👤 Users & Profiles: The system is built around the User, who has a detailed UserProfile containing all their health, lifestyle, and medical data.

    🍎 Food Database: A central FoodItem model, supported by master tables like Allergen and FoodType, acts as the source of truth for all nutritional information.

    ✍️ User Logging: Users actively log their daily activities, such as UserMeal, WeightLog, and WaterIntakeLog. They can also upload medical LabReports.

    🤖 AI Recommendations: The core product is the DietRecommendation, an AI-generated plan. This plan goes through a review process and collects DietFeedback from the user.

    🧑‍⚕️ Nutritionist Tools: Nutritionists have their own NutritionistProfile and are assigned to patients via the PatientAssignment model.

    📈 Engagement & Reporting: Features like Blogs and Messages drive user engagement, while internal models like AppReport and ModelRetrainLog are used for business intelligence and managing the ML pipeline.

Entity-Relationship Diagram (ERD)

This diagram shows the high-level relationships between the key models in the database.
code Mermaid

    
erDiagram
    User ||--o{ UserProfile : "has one"
    User ||--o{ NutritionistProfile : "can have"
    User ||--|{ WeightLog : "logs many"
    User ||--|{ WaterIntakeLog : "logs many"
    User ||--|{ UserMeal : "logs many"
    User ||--|{ LabReport : "uploads many"
    User ||--|{ DietRecommendation : "receives many"
    User ||--|{ Message : "sends/receives"
    User ||--|{ PatientAssignment : "is patient in"
    User ||--|{ PatientAssignment : "is nutritionist in"

    DietRecommendation ||--o{ DietFeedback : "has many"
    DietRecommendation }|--|| User : "is reviewed by"

    UserMeal }o--|| FoodItem : "is based on"
    FoodItem }o--o{ FoodType : "has many"
    FoodItem }o--o{ MealType : "has many"
    FoodItem }o--o{ Allergen : "has many"

    Blog }o--|| User : "authored by"

  

Model Definitions

Below is a detailed breakdown of each model, its purpose, and its fields, along with the complete source code.
👤 Accounts & Profiles

This section defines the core user and their detailed health profile.
User

    Purpose: The central authentication model for the application. It handles login, permissions, and roles. It replaces Django's default User model.

Field Name	Type	Description
email	EmailField	Primary Key. User's unique email and login identifier.
full_name	CharField	The user's full name.
role	CharField	Defines the user's access level (e.g., user, nutritionist, admin).
is_active	BooleanField	Designates whether this user should be treated as active.
is_admin	BooleanField	Designates that this user has all permissions without explicitly assigning them.
<details>
<summary>View Full Django Model Code</summary>
code Python

    
# --- User Manager ---
class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, role="user"):
        if not email:
            raise ValueError("Email is required")
        if not full_name:
            raise ValueError("Full name is required")

        user = self.model(
            email=self.normalize_email(email),
            full_name=full_name,
            role=role
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None):
        user = self.create_user(
            email,
            full_name,
            password,
            role="admin"
        )
        user.is_admin = True
        user.save(using=self._db)
        return user

# --- Custom User Model ---
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("user", "Normal User (Patient)"),
        ("nutritionist", "Nutritionist"),
        ("admin", "Admin"),
        ("owner", "Owner"),
        ("operator", "Operator"),
    ]

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    date_joined = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin

    @property
    def is_staff(self):
        return self.is_admin or self.role in ['admin', 'owner', 'operator']

  

</details>
UserProfile

    Purpose: A comprehensive, one-to-one extension of the User model. This table stores all the detailed health, lifestyle, and medical information needed to generate a diet plan.

Field Name	Type	Description
user	OneToOneField	A one-to-one link to the core User model.
gender	CharField	The user's gender.
height_cm, weight_kg	FloatField	The user's core anthropometric data.
activity_level	CharField	Describes the user's daily physical activity level.
goal	CharField	The user's primary health goal (e.g., Lose Weight).
is_diabetic, is_hypertensive, etc.	BooleanField	A series of flags for known medical conditions.
is_pregnant, due_date, etc.	BooleanField / DateField	Fields to handle pregnancy and postpartum nutritional needs.
<details>
<summary>View Full Django Model Code</summary>
code Python

    
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="userprofile")

    # Basic Info
    date_of_birth = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=[("male", "Male"), ("female", "Female"), ("other", "Other")])
    occupation = models.CharField(max_length=100, blank=True, help_text="e.g., Software Developer, Teacher")

    # Core Anthropometry
    height_cm = models.FloatField(null=True, blank=True, help_text="User's current height in cm")
    weight_kg = models.FloatField(null=True, blank=True, help_text="User's current weight in kg")

    # Lifestyle
    activity_level = models.CharField(max_length=50, choices=[("Sedentary", "Sedentary"), ("Lightly Active", "Lightly Active"), ("Moderately Active", "Moderately Active"), ("Very Active", "Very Active"), ("Extra Active", "Extra Active")], null=True, blank=True)
    goal = models.CharField(max_length=20, choices=[("Lose Weight", "Lose Weight"), ("Maintain Weight", "Maintain Weight"), ("Gain Weight", "Gain Weight")], null=True, blank=True)

    # Dietary Preferences
    diet_type = models.CharField(max_length=20, choices=[("Vegetarian", "Vegetarian"), ("Non Vegetarian", "Non Vegetarian"), ("Vegan", "Vegan"), ("Eggetarian", "Eggetarian")], default="other")
    allergies = models.TextField(blank=True, help_text="List known food allergies, separated by commas.")

    # Medical Conditions
    is_diabetic = models.BooleanField(default=False, verbose_name="Known Diabetic Condition")
    is_hypertensive = models.BooleanField(default=False, verbose_name="Known Hypertension (High BP)")
    has_heart_condition = models.BooleanField(default=False, verbose_name="Known Heart Condition (CVD)")
    has_thyroid_disorder = models.BooleanField(default=False, verbose_name="Known Thyroid Disorder")
    has_arthritis = models.BooleanField(default=False, verbose_name="Known Arthritis (RA/OA/Gout)")
    has_gastric_issues = models.BooleanField(default=False, verbose_name="Known Gastric Issues (IBS/GERD)")
    other_chronic_condition = models.TextField(blank=True, help_text="Describe any other long-term health conditions.")
    family_history = models.TextField(blank=True, help_text="Describe significant family history of diseases.")

    # Pregnancy & Postpartum
    is_pregnant = models.BooleanField(default=False, verbose_name="Currently Pregnant")
    due_date = models.DateField(null=True, blank=True, help_text="The estimated due date, if pregnant.")
    is_breastfeeding = models.BooleanField(default=False, verbose_name="Currently Breastfeeding")

    def __str__(self):
        return f"Profile for {self.user.full_name}"

    def clean(self):
        """ Enforces business rules at the model level. """
        super().clean()
        is_male = self.gender and self.gender.lower() == 'male'
        if is_male:
            if self.is_pregnant:
                raise ValidationError({'is_pregnant': 'A user with gender "Male" cannot be pregnant.'})
            if self.due_date:
                raise ValidationError({'due_date': 'A user with gender "Male" cannot have a due date.'})
            if self.is_breastfeeding:
                raise ValidationError({'is_breastfeeding': 'A user with gender "Male" cannot be breastfeeding.'})
        if self.due_date and not self.is_pregnant:
            raise ValidationError({'due_date': 'A due date requires the user to be marked as pregnant.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def bmi(self):
        if self.height_cm and self.weight_kg:
            return round(self.weight_kg / ((self.height_cm / 100) ** 2), 2)
        return None

    @property
    def current_trimester(self):
        if not self.is_pregnant or not self.due_date:
            return None
        weeks_pregnant = 40 - ((self.due_date - date.today()) / timedelta(weeks=1))
        if weeks_pregnant < 14: return 1
        elif 14 <= weeks_pregnant < 28: return 2
        else: return 3

  

</details>
🍎 Food Database

This section contains the master data for all food items and their nutritional properties.
FoodItem

    Purpose: The central repository for all nutritional information. Every food that can be logged or recommended exists as an entry in this table.

Field Name	Type	Description
name	CharField	The unique, human-readable name of the food item.
gram_equivalent	FloatField	The weight in grams for the default_unit (e.g., 1 cup of milk = 244g).
calories, protein, carbs, fats	FloatField	Core macronutrient values per default serving.
food_types, meal_types, allergens	ManyToManyField	Links to master tables for categorization.
is_verified	BooleanField	A flag indicating if the nutritional data has been manually verified.
<details>
<summary>View Full Django Model Code</summary>
code Python

    
# --- Master Data Models ---
class FoodType(models.Model):
    name = models.CharField(max_length=30, unique=True, help_text="e.g., Vegetarian, Vegan")
    def __str__(self): return self.name

class MealType(models.Model):
    name = models.CharField(max_length=40, unique=True, help_text="e.g., Breakfast, Lunch, Snack")
    def __str__(self): return self.name

class Allergen(models.Model):
    name = models.CharField(max_length=50, unique=True, help_text="e.g., Gluten, Dairy, Nuts")
    def __str__(self): return self.name

# --- Core Food Item Model ---
class FoodItem(models.Model):
    LEVEL_CHOICES = [("Low", "Low"), ("Medium", "Medium"), ("High", "High")]

    # Basic Info
    name = models.CharField(max_length=150, unique=True, help_text="Unique name of the food item.")
    default_quantity = models.FloatField(default=1, help_text="e.g., 1, 2, 100")
    default_unit = models.CharField(max_length=20, default="piece", help_text="e.g., piece, cup, bowl, g")
    gram_equivalent = models.FloatField(null=True, blank=True, help_text="Equivalent weight in grams for the default serving.")

    # Macronutrients (per default serving)
    calories = models.FloatField(help_text="Calories (kcal)")
    protein = models.FloatField(help_text="Protein (g)")
    carbs = models.FloatField(help_text="Carbohydrates (g)")
    fats = models.FloatField(help_text="Total Fat (g)")
    sugar = models.FloatField(null=True, blank=True, help_text="Sugar (g)")
    fiber = models.FloatField(null=True, blank=True, help_text="Fiber (g)")

    # Micronutrients & Other (per default serving)
    saturated_fat_g = models.FloatField(null=True, blank=True)
    trans_fat_g = models.FloatField(null=True, blank=True)
    sodium_mg = models.FloatField(null=True, blank=True)
    potassium_mg = models.FloatField(null=True, blank=True)
    iron_mg = models.FloatField(null=True, blank=True)
    calcium_mg = models.FloatField(null=True, blank=True)
    cholesterol_mg = models.FloatField(null=True, blank=True)
    vitamin_d_mcg = models.FloatField(null=True, blank=True)
    vitamin_b12_mcg = models.FloatField(null=True, blank=True)

    # Glycemic Data
    estimated_gi = models.FloatField(null=True, blank=True, verbose_name="Estimated Glycemic Index")
    glycemic_load = models.FloatField(null=True, blank=True, verbose_name="Glycemic Load")

    # Classification & Suitability
    fodmap_level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="Low")
    spice_level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="Low")
    purine_level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="Low")

    # Relationships
    food_types = models.ManyToManyField(FoodType, blank=True, related_name="food_items")
    meal_types = models.ManyToManyField(MealType, blank=True, related_name="food_items")
    allergens = models.ManyToManyField(Allergen, blank=True, related_name="food_items")

    # Data Verification
    is_verified = models.BooleanField(default=False, help_text="True if data has been manually verified.")
    source_url = models.URLField(max_length=512, null=True, blank=True, help_text="URL of the nutritional data source.")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

  

</details>
✍️ User Logging & Reports

These models store all the data actively generated and logged by the user.
UserMeal, WeightLog, WaterIntakeLog

    Purpose: A collection of tables for recording a user's daily activities. UserMeal captures food intake, while WeightLog and WaterIntakeLog track metrics over time.

<details>
<summary>View Full Django Model Code</summary>
code Python

    
class WeightLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weight_logs')
    date = models.DateField(default=timezone.now)
    weight_kg = models.FloatField()
    time_logged = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.full_name} - {self.weight_kg} kg on {self.date}"

class WaterIntakeLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='water_logs')
    amount_ml = models.PositiveIntegerField()
    date = models.DateField(default=timezone.now)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.full_name} - {self.amount_ml} ml on {self.date}"

class UserMeal(models.Model):
    """ Represents a single meal entry logged by a user. """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='meals_logged')
    food_item = models.ForeignKey(FoodItem, on_delete=models.SET_NULL, null=True, blank=True)
    food_name = models.CharField(max_length=150, help_text="Name of the food, stored for historical purposes.")
    quantity = models.FloatField()
    unit = models.CharField(max_length=20)
    meal_type = models.CharField(max_length=30)
    consumed_at = models.DateTimeField(default=timezone.now)
    remarks = models.TextField(blank=True)

    # Snapshot of nutritional values at time of logging
    calories = models.FloatField(blank=True, null=True)
    protein = models.FloatField(blank=True, null=True)
    carbs = models.FloatField(blank=True, null=True)
    fats = models.FloatField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.food_item:
            self.food_name = self.food_item.name
            # NOTE: Add your nutrient calculation logic here before saving
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Meal for {self.user.full_name} on {self.consumed_at.date()}"

  

</details>
LabReport

    Purpose: Stores uploaded lab reports from users, including the file itself and key extracted biomarkers. This provides deep medical context for diet generation.

<details>
<summary>View Full Django Model Code</summary>
code Python

    
class LabReport(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lab_reports")
    report_date = models.DateField(default=timezone.now)
    report_file = models.FileField(upload_to="reports/files/", storage=CustomCloudinaryStorage(), null=True, blank=True)

    # Vitals
    weight_kg = models.FloatField(null=True, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    blood_pressure_systolic = models.PositiveIntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.PositiveIntegerField(null=True, blank=True)

    # Key Markers
    fasting_blood_sugar = models.FloatField(null=True, blank=True, help_text="mg/dL")
    hba1c = models.FloatField(null=True, blank=True, help_text="%")
    ldl_cholesterol = models.FloatField(null=True, blank=True, help_text="mg/dL")
    hdl_cholesterol = models.FloatField(null=True, blank=True, help_text="mg/dL")
    triglycerides = models.FloatField(null=True, blank=True, help_text="mg/dL")
    uric_acid = models.FloatField(null=True, blank=True, help_text="mg/dL")
    tsh = models.FloatField(null=True, blank=True, help_text="µIU/mL")
    vitamin_d3 = models.FloatField(null=True, blank=True, help_text="ng/mL")
    vitamin_b12 = models.FloatField(null=True, blank=True, help_text="pg/mL")

    class Meta:
        ordering = ['-report_date']

    def __str__(self):
        return f"Lab Report for {self.user.full_name} on {self.report_date}"

  

</details>
🤖 AI Diet Plans & Feedback

This section manages the AI-generated diet plans and the crucial user feedback loop.
DietRecommendation

    Purpose: The core output of the AI model. It stores a full diet plan and tracks its lifecycle from generation, through nutritionist review, to its use in retraining.

<details>
<summary>View Full Django Model Code</summary>
code Python

    
class DietRecommendation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="diet_recommendations")
    for_week_starting = models.DateField(default=timezone.now)
    meals = models.JSONField(default=dict, help_text="The full AI-generated meal plan.")

    # Review & Workflow Fields
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    nutritionist_comment = models.TextField(blank=True, null=True, help_text="Comments from the nutritionist for the user.")
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_diets'
    )

    # Retraining Pipeline Fields
    user_profile_snapshot = models.JSONField(null=True, blank=True, help_text="Immutable JSON of user's health vector at generation time.")
    original_ai_plan = models.JSONField(null=True, blank=True, help_text="The unmodified AI plan for comparison.")
    approved_for_retraining = models.BooleanField(default=False, help_text="Flagged by a nutritionist as a high-quality example.")
    nutritionist_retraining_notes = models.TextField(blank=True, null=True, help_text="Internal notes for the ML team about this plan's quality.")
    was_used_for_retraining = models.BooleanField(default=False, db_index=True, help_text="Set automatically after the plan is used for training.")

    # Timestamps & Soft Delete
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False, db_index=True, help_text="If true, this plan is archived.")

    def __str__(self):
        return f"Plan for {self.user.full_name} starting {self.for_week_starting} ({self.get_status_display()})"

  

</details>
DietFeedback

    Purpose: Captures daily feedback from a user on a specific DietRecommendation. This is a critical data source for improving the AI model.

<details>
<summary>View Full Django Model Code</summary>
code Python

    
class DietFeedback(models.Model):
    recommendation = models.ForeignKey(DietRecommendation, on_delete=models.CASCADE, related_name='feedbacks')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    day = models.CharField(max_length=15, help_text="e.g., 'Day 1', 'Day 8', etc.")
    feedback = models.TextField()
    rating = models.PositiveSmallIntegerField(help_text="User rating from 1 to 5.", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('recommendation', 'user', 'day')
        verbose_name_plural = "Diet Plan Feedback"

    def __str__(self):
        return f"Feedback by {self.user.full_name} for {self.day} of plan {self.recommendation.id}"

  

</details>
🧑‍⚕️ Nutritionist Tools & Engagement

Models for nutritionist-specific features and user engagement.
NutritionistProfile & PatientAssignment

    Purpose: NutritionistProfile stores extra information about a nutritionist. PatientAssignment creates a formal link between a nutritionist and a patient.

<details>
<summary>View Full Django Model Code</summary>
code Python

    
class NutritionistProfile(models.Model):
    EXPERTISE_CHOICES = [
        (1, 'Basic Nutritionist'),
        (2, 'Senior Nutritionist'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='nutritionist_profile',
        limit_choices_to={'role': 'nutritionist'}
    )
    expert_level = models.IntegerField(choices=EXPERTISE_CHOICES, default=1)

    def __str__(self):
        return f"{self.user.full_name} - {self.get_expert_level_display()}"

class PatientAssignment(models.Model):
    nutritionist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_patients',
        limit_choices_to={'role': 'nutritionist'}
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_nutritionist',
        limit_choices_to={'role': 'user'}
    )
    assigned_at = models.DateField(default=timezone.now, help_text="The date the patient was assigned.")

    class Meta:
        unique_together = ('patient', 'nutritionist')
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.nutritionist.full_name} assigned {self.patient.full_name}"

  

</details>
Blog, Message, CustomReminder

    Purpose: Standard features to drive user engagement. Blog for content, Message for communication between users/nutritionists, and CustomReminder for user-configured notifications.

<details>
<summary>View Full Django Model Code</summary>
code Python

    
class CustomReminder(models.Model):
    FREQUENCY_CHOICES = [('once', 'Once'), ('daily', 'Daily'), ('weekly', 'Weekly')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    reminder_time = models.TimeField()
    next_due_at = models.DateTimeField(null=True, blank=True, db_index=True, help_text="The exact datetime the next notification is due.")
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='daily')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reminder '{self.title}' for {self.user.full_name}"

class Message(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_messages', on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"From {self.sender.full_name} to {self.receiver.full_name}"

class Blog(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blogs',
        limit_choices_to={'role__in': ['nutritionist', 'admin']}
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    image = models.ImageField(upload_to='features/blog_images/', storage=MediaCloudinaryStorage(), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

  

</details>
📈 Internal Admin & Reporting

Models used for internal business intelligence and managing the application's health.
AppReport, Feedback, ModelRetrainLog

    Purpose: A suite of internal models. AppReport stores periodic snapshots of business metrics. The general Feedback model captures app feedback. ModelRetrainLog records every AI model retraining event for tracking and auditing.

<details>
<summary>View Full Django Model Code</summary>
code Python

    
class AppReport(models.Model):
    report_date = models.DateField(auto_now_add=True, unique=True)
    new_users = models.PositiveIntegerField(default=0)
    active_patients = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    feedback_summary = models.TextField(blank=True)

    class Meta:
        ordering = ['-report_date']

    def __str__(self):
        return f"App Report for {self.report_date}"

class Feedback(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField()
    rating = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Rating from 1 to 5")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "General App Feedback"

    def __str__(self):
        user_email = self.user.email if self.user else "Anonymous"
        return f"Feedback from {user_email} at {self.created_at.strftime('%Y-%m-%d')}"

class ModelRetrainLog(models.Model):
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    feedbacks_used = models.IntegerField(default=0)
    accuracy_score = models.FloatField(null=True, blank=True)
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"Model Retraining started at {self.started_at.strftime('%Y-%m-%d %H:%M')}"

  

</details>
User

all things are done ? yes or no did u provede all which i gice >

from django.db import models
from django.contrib.auth.models import User

class DiabeticProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='diabetic_profiles')
    report_date = models.DateField()
    
    # Physical Measurements
    weight_kg = models.FloatField(null=True, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    waist_circumference_cm = models.FloatField(null=True, blank=True)
    
    # Blood Pressure
    blood_pressure_systolic = models.IntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.IntegerField(null=True, blank=True)
    
    # Diabetes Markers
    fasting_blood_sugar = models.FloatField(null=True, blank=True)
    postprandial_sugar = models.FloatField(null=True, blank=True)
    hba1c = models.FloatField(null=True, blank=True)
    
    # Lipid Profile
    ldl_cholesterol = models.FloatField(null=True, blank=True)
    hdl_cholesterol = models.FloatField(null=True, blank=True)
    triglycerides = models.FloatField(null=True, blank=True)
    
    # Kidney Function
    uric_acid = models.FloatField(null=True, blank=True)
    creatinine = models.FloatField(null=True, blank=True)
    urea = models.FloatField(null=True, blank=True)
    
    # Liver Function
    alt = models.FloatField(null=True, blank=True)
    ast = models.FloatField(null=True, blank=True)
    
    # Inflammation
    crp = models.FloatField(null=True, blank=True)
    esr = models.FloatField(null=True, blank=True)
    
    # Vitamins & Thyroid
    vitamin_d3 = models.FloatField(null=True, blank=True)
    vitamin_b12 = models.FloatField(null=True, blank=True)
    tsh = models.FloatField(null=True, blank=True)
    
    # Additional Parameters (JSON field for flexible data)
    additional_parameters = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-report_date']
    
    def __str__(self):
        return f"{self.user.username} - {self.report_date}"
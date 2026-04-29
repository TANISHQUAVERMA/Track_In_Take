from datetime import date
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import DailyRecommendation, MealFeedback
from .serializers import DailyRecommendationSerializer, MealFeedbackSerializer
from .ai_service import generate_meal_recommendation, get_calories_consumed_today


# ─────────────────────────────────────────────
# Generate / regenerate recommendation
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_recommendation(request):
    force       = request.data.get('force', False)
    target_date = request.data.get('date', str(date.today()))
    user        = request.user

    existing = DailyRecommendation.objects.filter(user=user, date=target_date).first()

    if existing and not force:
        return Response({
            'message': 'Recommendation already exists for today. Send force=true to regenerate.',
            'data': DailyRecommendationSerializer(existing).data
        }, status=200)

    try:
        from utils.utils import get_target_nutrients
        plan, calories_remaining, calories_consumed = generate_meal_recommendation(user, target_date)
        targets = get_target_nutrients(user)
        meals   = plan.get('meals', {})

        rec, _ = DailyRecommendation.objects.update_or_create(
            user = user,
            date = target_date,
            defaults={
                'calorie_target': targets.get('recommended_calories', 0),
                'calories_used':  calories_consumed,
                'breakfast_plan': meals.get('Breakfast', {}).get('options', []),
                'lunch_plan':     meals.get('Lunch',     {}).get('options', []),
                'dinner_plan':    meals.get('Dinner',    {}).get('options', []),
                'plan_summary':   plan.get('plan_summary', ''),
            }
        )
        return Response({
            'message': 'Meal plan generated successfully',
            'data': DailyRecommendationSerializer(rec).data
        }, status=201)

    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        return Response({'error': f'AI generation failed: {str(e)}'}, status=500)


# ─────────────────────────────────────────────
# Today's recommendation
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_recommendation(request):
    rec = DailyRecommendation.objects.filter(user=request.user, date=date.today()).first()
    if not rec:
        return Response({'message': 'No recommendation for today. POST to /generate/ first.'}, status=404)
    return Response({'data': DailyRecommendationSerializer(rec).data})


# ─────────────────────────────────────────────
# Refresh images
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_images(request):
    from .ai_service import generate_ai_food_image

    rec = DailyRecommendation.objects.filter(user=request.user, date=date.today()).first()
    if not rec:
        return Response({'error': 'No recommendation found for today'}, status=404)

    def refresh_plan(plan_list):
        for option in plan_list:
            for item in option.get('items', []):
                item['image_url'] = generate_ai_food_image(item.get('food_name', ''))
        return plan_list

    rec.breakfast_plan = refresh_plan(rec.breakfast_plan)
    rec.lunch_plan     = refresh_plan(rec.lunch_plan)
    rec.dinner_plan    = refresh_plan(rec.dinner_plan)
    rec.save(update_fields=['breakfast_plan', 'lunch_plan', 'dinner_plan'])

    return Response({'message': 'Images refreshed', 'data': DailyRecommendationSerializer(rec).data})


# ─────────────────────────────────────────────
# Calorie summary (breakdown by meal)
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calorie_summary(request):
    from userFood.models import UserMeal
    from django.db.models import Sum
    from utils.utils import get_target_nutrients

    filter_date = request.query_params.get('date', str(date.today()))
    user        = request.user

    meals = UserMeal.objects.filter(user=user, date=filter_date)

    breakdown = {'Breakfast': 0, 'Lunch': 0, 'Dinner': 0, 'Snack': 0}
    total = 0
    for meal in meals:
        cal = float(meal.calories or 0)
        total += cal
        mt = meal.meal_type
        if mt in breakdown:
            breakdown[mt] += cal
        elif mt in ('Mid-Morning Snack', 'Afternoon Snack', 'Bedtime', 'Early-Morning'):
            breakdown['Snack'] += cal

    try:
        targets = get_target_nutrients(user)
        calorie_target = targets.get('recommended_calories', 0)
        macros = targets.get('macronutrients', {})
    except Exception:
        calorie_target = 0
        macros = {}

    return Response({
        'date':               filter_date,
        'calorie_target':     calorie_target,
        'calories_consumed':  round(total, 1),
        'calories_remaining': max(calorie_target - round(total, 1), 0),
        'breakdown_by_meal':  {k: round(v, 1) for k, v in breakdown.items()},
        'macro_targets': {
            'protein_g': macros.get('protein_g', 0),
            'carbs_g':   macros.get('carbs_g', 0),
            'fat_g':     macros.get('fats_g', 0),
        }
    })


# ─────────────────────────────────────────────
# Meal Feedback — submit
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_meal_feedback(request):
    rec_id    = request.data.get('recommendation_id')
    meal_type = request.data.get('meal_type')
    food_name = request.data.get('food_name')
    status_val= request.data.get('status')

    if not all([rec_id, meal_type, food_name, status_val]):
        return Response({'error': 'recommendation_id, meal_type, food_name, status are required'}, status=400)

    try:
        rec = DailyRecommendation.objects.get(id=rec_id, user=request.user)
    except DailyRecommendation.DoesNotExist:
        return Response({'error': 'Recommendation not found'}, status=404)

    feedback, created = MealFeedback.objects.update_or_create(
        recommendation=rec,
        user=request.user,
        meal_type=meal_type,
        defaults={
            'food_name':     food_name,
            'status':        status_val,
            'replaced_with': request.data.get('replaced_with'),
            'note':          request.data.get('note'),
        }
    )

    return Response({
        'message': 'Feedback saved',
        'data': MealFeedbackSerializer(feedback).data
    }, status=201 if created else 200)


# ─────────────────────────────────────────────
# Meal Feedback — get for today's recommendation
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_meal_feedback(request):
    rec = DailyRecommendation.objects.filter(user=request.user, date=date.today()).first()
    if not rec:
        return Response({'feedbacks': []})
    feedbacks = MealFeedback.objects.filter(recommendation=rec, user=request.user)
    return Response({'feedbacks': MealFeedbackSerializer(feedbacks, many=True).data})

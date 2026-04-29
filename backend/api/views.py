from django.core.files.uploadedfile import UploadedFile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
import tempfile
import os
import PyPDF2
import re
from typing import Dict, Any, List




def process_lab_report(file_path: str) -> Dict[str, Any]:
    """
    Process the uploaded lab report and extract relevant health metrics.
    """
    extracted_values = {}
    additional_parameters = []
    
    try:
        # Extract text from PDF
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text
        
        if not text.strip():
            return {
                'success': False,
                'error': 'Could not extract text from the PDF. Please ensure the file is not scanned/image-based.',
                'lab_values': {},
                'additional_parameters': []
            }
        
        # Define patterns for standard parameters (using frontend field names directly)
        patterns = {
            'weight_kg': r'Weight[:\s]*(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilogram)',
            'height_cm': r'Height[:\s]*(\d+(?:\.\d+)?)\s*(?:cm|centimeters|centimetre)',
            'waist_circumference_cm': r'Waist[:\s]*(\d+(?:\.\d+)?)\s*(?:cm|centimeters)',
            'blood_pressure_systolic': r'(?:BP|Blood\s*Pressure)[:\s]*(\d+)/(\d+)',
            'blood_pressure_diastolic': r'(?:BP|Blood\s*Pressure)[:\s]*\d+/(\d+)',
            'fasting_blood_sugar': r'Fasting\s*(?:Blood\s*)?Sugar[:\s]*(\d+(?:\.\d+)?)\s*(?:mg/dL|mg/dl)',
            'postprandial_sugar': r'Postprandial\s*(?:Blood\s*)?Sugar[:\s]*(\d+(?:\.\d+)?)\s*(?:mg/dL|mg/dl)',
            'hba1c': r'HbA1c[:\s]*(\d+(?:\.\d+)?)\s*%',
            'ldl_cholesterol': r'LDL[:\s]*(\d+(?:\.\d+)?)\s*(?:mg/dL|mg/dl)',
            'hdl_cholesterol': r'HDL[:\s]*(\d+(?:\.\d+)?)\s*(?:mg/dL|mg/dl)',
            'triglycerides': r'Triglycerides[:\s]*(\d+(?:\.\d+)?)\s*(?:mg/dL|mg/dl)',
            'crp': r'CRP[:\s]*(\d+(?:\.\d+)?)\s*(?:mg/L|mg/l)',
            'esr': r'ESR[:\s]*(\d+(?:\.\d+)?)\s*(?:mm/hr|mm/h)',
            'uric_acid': r'Uric\s*Acid[:\s]*(\d+(?:\.\d+)?)\s*(?:mg/dL|mg/dl)',
            'creatinine': r'Creatinine[:\s]*(\d+(?:\.\d+)?)\s*(?:mg/dL|mg/dl)',
            'urea': r'Urea[:\s]*(\d+(?:\.\d+)?)\s*(?:mg/dL|mg/dl)',
            'alt': r'ALT[:\s]*(\d+(?:\.\d+)?)\s*(?:U/L|U/l)',
            'ast': r'AST[:\s]*(\d+(?:\.\d+)?)\s*(?:U/L|U/l)',
            'vitamin_d3': r'Vitamin\s*D3[:\s]*(\d+(?:\.\d+)?)\s*(?:ng/mL|ng/ml)',
            'vitamin_b12': r'Vitamin\s*B12[:\s]*(\d+(?:\.\d+)?)\s*(?:pg/mL|pg/ml)',
            'tsh': r'TSH[:\s]*(\d+(?:\.\d+)?)\s*(?:µIU/mL|uIU/mL|mIU/L)',
        }
        
        # Extract standard parameters
        for param, pattern in patterns.items():
            if param == 'blood_pressure_systolic':
                match = re.search(patterns['blood_pressure_systolic'], text, re.IGNORECASE)
                if match:
                    extracted_values['blood_pressure_systolic'] = float(match.group(1))
                    extracted_values['blood_pressure_diastolic'] = float(match.group(2))
            elif param == 'blood_pressure_diastolic':
                continue  # Already handled above
            else:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    # For patterns that might capture two groups (like bp), take the appropriate group
                    if param == 'fasting_blood_sugar' and len(match.groups()) > 1:
                        extracted_values[param] = float(match.group(1))
                    else:
                        extracted_values[param] = float(match.group(1))
        
        # Look for additional parameters
        additional_patterns = {
            'Homocysteine': r'Homocysteine[:\s]*(\d+(?:\.\d+)?)\s*(?:µmol/L|umol/L)',
            'Ferritin': r'Ferritin[:\s]*(\d+(?:\.\d+)?)\s*(?:ng/mL|ng/ml)',
            'Cortisol': r'Cortisol[:\s]*(\d+(?:\.\d+)?)\s*(?:µg/dL|ug/dL)',
            'Insulin': r'Insulin[:\s]*(\d+(?:\.\d+)?)\s*(?:µIU/mL|uIU/mL)',
            'Vitamin B9': r'Vitamin\s*B9[:\s]*(\d+(?:\.\d+)?)\s*(?:ng/mL|ng/ml)',
            'Magnesium': r'Magnesium[:\s]*(\d+(?:\.\d+)?)\s*(?:mg/dL|mg/dl)',
            'Sodium': r'Sodium[:\s]*(\d+(?:\.\d+)?)\s*(?:mmol/L)',
            'Potassium': r'Potassium[:\s]*(\d+(?:\.\d+)?)\s*(?:mmol/L)',
        }
        
        for name, pattern in additional_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                additional_parameters.append({
                    'name': name.lower().replace(' ', '_'),
                    'display_name': name,
                    'value': float(match.group(1)),
                    'unit': get_unit_for_parameter(name),
                    'category': get_category_for_parameter(name),
                    'confidence': 0.85
                })
        
        # Remove duplicate entries (if same param extracted twice)
        if 'blood_pressure_systolic' in extracted_values and 'blood_pressure_systolic' in extracted_values:
            # Keep as is, they're different fields
            pass
        
        return {
            'success': True,
            'lab_values': extracted_values,
            'values_found': len(extracted_values),
            'additional_parameters': additional_parameters,
            'extracted_text_preview': text[:500]
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to process file: {str(e)}',
            'lab_values': {},
            'additional_parameters': []
        }

def get_unit_for_parameter(parameter_name: str) -> str:
    """Get appropriate unit for the parameter."""
    units = {
        'Homocysteine': 'µmol/L',
        'Ferritin': 'ng/mL',
        'Cortisol': 'µg/dL',
        'Insulin': 'µIU/mL',
        'Vitamin B9': 'ng/mL',
        'Magnesium': 'mg/dL',
        'Sodium': 'mmol/L',
        'Potassium': 'mmol/L',
    }
    return units.get(parameter_name, '')


def get_category_for_parameter(parameter_name: str) -> str:
    """Get category for additional parameters."""
    categories = {
        'Homocysteine': 'Cardiac',
        'Ferritin': 'Iron Studies',
        'Cortisol': 'Hormones',
        'Insulin': 'Hormones',
        'Vitamin B9': 'Vitamins',
        'Magnesium': 'Minerals',
        'Sodium': 'Electrolytes',
        'Potassium': 'Electrolytes',
    }
    return categories.get(parameter_name, 'Other')


def flexible_extraction(text: str) -> Dict[str, Any]:
    """
    Flexible extraction for when standard patterns don't match.
    Looks for common lab value patterns.
    """
    extracted = {}
    
    # Look for patterns like "Parameter: 123 unit"
    lines = text.split('\n')
    for line in lines:
        # Pattern: word(s) followed by colon and number
        match = re.search(r'([A-Za-z\s]+):\s*(\d+(?:\.\d+)?)\s*([A-Za-z/µ]+)?', line)
        if match:
            param_name = match.group(1).strip().lower().replace(' ', '_')
            value = float(match.group(2))
            # Only include if it looks like a health metric
            if len(param_name) > 2 and 0 < value < 1000:
                # Map common variations to standard field names
                param_mapping = {
                    'weight': 'weight_kg',
                    'height': 'height_cm',
                    'waist': 'waist_circumference_cm',
                    'fasting_glucose': 'fasting_blood_sugar',
                    'postprandial_glucose': 'postprandial_sugar',
                }
                mapped_name = param_mapping.get(param_name, param_name)
                extracted[mapped_name] = value
    
    return extracted


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def auto_extract_lab_report(request):
    """
    Auto-extract lab values from uploaded PDF or image file.
    """
    try:
        file = request.FILES.get('file')
        
        if not file:
            return Response({
                'success': False,
                'error': 'No file provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check file size (max 10MB)
        if file.size > 10 * 1024 * 1024:
            return Response({
                'success': False,
                'error': 'File size exceeds 10MB limit'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check file type
        allowed_types = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        if file.content_type not in allowed_types:
            return Response({
                'success': False,
                'error': 'Invalid file type. Please upload PDF, JPG, or PNG.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save temporarily
        suffix = '.pdf' if file.content_type == 'application/pdf' else '.jpg'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            for chunk in file.chunks():
                tmp_file.write(chunk)
            tmp_path = tmp_file.name
        
        try:
            # Process the file
            extracted_data = process_lab_report(tmp_path)
            return Response(extracted_data, status=status.HTTP_200_OK)
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Server error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
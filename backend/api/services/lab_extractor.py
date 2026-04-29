import PyPDF2
import re
import json
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
                text += page.extract_text()
        
        # Define patterns for standard parameters
        patterns = {
            'weight_kg': r'Weight[:\s]*(\d+(?:\.\d+)?)\s*(?:kg|kgs)',
            'height_cm': r'Height[:\s]*(\d+(?:\.\d+)?)\s*(?:cm|centimeters)',
            'waist_circumference_cm': r'Waist[:\s]*(\d+(?:\.\d+)?)\s*(?:cm|centimeters)',
            'blood_pressure_systolic': r'BP[:\s]*(\d+)/(\d+)',
            'blood_pressure_diastolic': r'BP[:\s]*\d+/(\d+)',
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
            'tsh': r'TSH[:\s]*(\d+(?:\.\d+)?)\s*(?:µIU/mL|uIU/mL)',
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
                    extracted_values[param] = float(match.group(1))
        
        # Look for additional parameters (custom fields)
        # Common additional parameters to look for
        additional_patterns = {
            'Homocysteine': r'Homocysteine[:\s]*(\d+(?:\.\d+)?)\s*(?:µmol/L|umol/L)',
            'Ferritin': r'Ferritin[:\s]*(\d+(?:\.\d+)?)\s*(?:ng/mL|ng/ml)',
            'Cortisol': r'Cortisol[:\s]*(\d+(?:\.\d+)?)\s*(?:µg/dL|ug/dL)',
            'Insulin': r'Insulin[:\s]*(\d+(?:\.\d+)?)\s*(?:µIU/mL|uIU/mL)',
            'Vitamin B9': r'Vitamin\s*B9[:\s]*(\d+(?:\.\d+)?)\s*(?:ng/mL|ng/ml)',
            'Magnesium': r'Magnesium[:\s]*(\d+(?:\.\d+)?)\s*(?:mg/dL|mg/dl)',
            'Sodium': r'Sodium[:\s]*(\d+(?:\.\d+)?)\s*(?:mmol/L)',
            'Potassium': r'Potassium[:\s]*(\d+(?:\.\d+)?)\s*(?:mmol/L)',
            'Chloride': r'Chloride[:\s]*(\d+(?:\.\d+)?)\s*(?:mmol/L)',
        }
        
        for name, pattern in additional_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                additional_parameters.append({
                    'name': name.lower().replace(' ', '_'),
                    'display_name': name,
                    'value': float(match.group(1)),
                    'unit': extract_unit(name),
                    'category': get_category_for_parameter(name),
                    'confidence': 0.85  # Default confidence for regex extraction
                })
        
        # If no standard parameters found, try more flexible matching
        if not extracted_values:
            extracted_values = flexible_extraction(text)
        
        return {
            'success': True,
            'lab_values': extracted_values,
            'values_found': len(extracted_values),
            'additional_parameters': additional_parameters,
            'extracted_text_preview': text[:500]  # For debugging
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to process file: {str(e)}',
            'lab_values': {},
            'additional_parameters': []
        }


def extract_unit(parameter_name: str) -> str:
    """Extract appropriate unit for the parameter."""
    units = {
        'Homocysteine': 'µmol/L',
        'Ferritin': 'ng/mL',
        'Cortisol': 'µg/dL',
        'Insulin': 'µIU/mL',
        'Vitamin B9': 'ng/mL',
        'Magnesium': 'mg/dL',
        'Sodium': 'mmol/L',
        'Potassium': 'mmol/L',
        'Chloride': 'mmol/L',
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
        'Chloride': 'Electrolytes',
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
            if len(param_name) > 2 and value > 0 and value < 1000:
                extracted[param_name] = value
    
    return extracted
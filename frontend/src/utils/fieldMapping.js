// Mapping between backend parameter names and frontend form field IDs
export const fieldMapping = {
    // Physical Measurements
    'weight_kg': { field: 'weight_kg', unit: 'kg', displayName: 'Weight' },
    'height_cm': { field: 'height_cm', unit: 'cm', displayName: 'Height' },
    'waist_circumference_cm': { field: 'waist_circumference_cm', unit: 'cm', displayName: 'Waist Circumference' }, // Fixed: was 'waist_circumference'
    
    // Blood Pressure
    'bp_systolic': { field: 'blood_pressure_systolic', unit: 'mmHg', displayName: 'Systolic BP' }, // Fixed: was 'bp_systolic'
    'bp_diastolic': { field: 'blood_pressure_diastolic', unit: 'mmHg', displayName: 'Diastolic BP' }, // Fixed: was 'bp_diastolic'
    
    // Diabetes Markers
    'fasting_blood_sugar': { field: 'fasting_blood_sugar', unit: 'mg/dL', displayName: 'Fasting Blood Sugar' },
    'postprandial_sugar': { field: 'postprandial_sugar', unit: 'mg/dL', displayName: 'Postprandial Sugar' },
    'hba1c': { field: 'hba1c', unit: '%', displayName: 'HbA1c' },
    
    // Lipid Profile
    'ldl_cholesterol': { field: 'ldl_cholesterol', unit: 'mg/dL', displayName: 'LDL Cholesterol' },
    'hdl_cholesterol': { field: 'hdl_cholesterol', unit: 'mg/dL', displayName: 'HDL Cholesterol' },
    'triglycerides': { field: 'triglycerides', unit: 'mg/dL', displayName: 'Triglycerides' },
    
    // Kidney Function
    'creatinine': { field: 'creatinine', unit: 'mg/dL', displayName: 'Creatinine' },
    'urea': { field: 'urea', unit: 'mg/dL', displayName: 'Urea' },
    'uric_acid': { field: 'uric_acid', unit: 'mg/dL', displayName: 'Uric Acid' },
    
    // Liver Function
    'alt': { field: 'alt', unit: 'U/L', displayName: 'ALT' },
    'ast': { field: 'ast', unit: 'U/L', displayName: 'AST' },
    
    // Vitamins
    'vitamin_d3': { field: 'vitamin_d3', unit: 'ng/mL', displayName: 'Vitamin D3' },
    'vitamin_b12': { field: 'vitamin_b12', unit: 'pg/mL', displayName: 'Vitamin B12' },
    
    // Inflammation
    'crp': { field: 'crp', unit: 'mg/L', displayName: 'CRP' },
    'esr': { field: 'esr', unit: 'mm/hr', displayName: 'ESR' },
    
    // Thyroid
    'tsh': { field: 'tsh', unit: 'mIU/L', displayName: 'TSH' },
    
    // CBC
    'hemoglobin': { field: 'hemoglobin', unit: 'g/dL', displayName: 'Hemoglobin' },
    'iron': { field: 'iron', unit: 'µg/dL', displayName: 'Iron' },
    'protein': { field: 'protein', unit: 'g/dL', displayName: 'Total Protein' },
    'albumin': { field: 'albumin', unit: 'g/dL', displayName: 'Albumin' }
};

// Helper function to populate form fields
export const populateFormFields = (labValues, setFormData) => {
    const updates = {};
    
    for (const [paramName, value] of Object.entries(labValues)) {
        const mapping = fieldMapping[paramName];
        if (mapping && value) {
            updates[mapping.field] = value;
        }
    }
    
    if (Object.keys(updates).length > 0) {
        setFormData(prev => ({ ...prev, ...updates }));
    }
    
    return Object.keys(updates).length;
};

// Get category for a parameter
export const getParameterCategory = (paramName) => {
    const categories = {
        'weight_kg': 'Physical Measurements',
        'height_cm': 'Physical Measurements',
        'waist_circumference_cm': 'Physical Measurements',
        'bp_systolic': 'Blood Pressure',
        'bp_diastolic': 'Blood Pressure',
        'fasting_blood_sugar': 'Diabetes Markers',
        'postprandial_sugar': 'Diabetes Markers',
        'hba1c': 'Diabetes Markers',
        'ldl_cholesterol': 'Lipid Profile',
        'hdl_cholesterol': 'Lipid Profile',
        'triglycerides': 'Lipid Profile',
        'creatinine': 'Kidney Function',
        'urea': 'Kidney Function',
        'uric_acid': 'Kidney Function',
        'alt': 'Liver Function',
        'ast': 'Liver Function',
        'vitamin_d3': 'Vitamins',
        'vitamin_b12': 'Vitamins',
        'crp': 'Inflammation',
        'esr': 'Inflammation',
        'tsh': 'Thyroid',
        'hemoglobin': 'CBC',
        'iron': 'CBC'
    };
    return categories[paramName] || 'Other';
};

export default fieldMapping;
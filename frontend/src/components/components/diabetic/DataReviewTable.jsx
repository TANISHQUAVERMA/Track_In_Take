import React, { useState } from 'react'; // Make sure this is at the top

const DataReviewTable = ({ extractedData, additionalParams, onConfirm, onCancel }) => {
  const [editedData, setEditedData] = useState(extractedData);
  const [editedAdditional, setEditedAdditional] = useState(additionalParams);
  const [editingCell, setEditingCell] = useState(null);

  // Group parameters by category - Updated to match your form field names
  const groupedData = {
    'Physical Measurements': ['weight_kg', 'height_cm', 'waist_circumference_cm'],
    'Blood Pressure': ['blood_pressure_systolic', 'blood_pressure_diastolic'], // Fixed: was 'bp_systolic', 'bp_diastolic'
    'Diabetes Markers': ['fasting_blood_sugar', 'postprandial_sugar', 'hba1c'],
    'Lipid Profile': ['ldl_cholesterol', 'hdl_cholesterol', 'triglycerides'],
    'Kidney Function': ['creatinine', 'urea', 'uric_acid'],
    'Liver Function': ['alt', 'ast'],
    'Inflammation': ['crp', 'esr'],
    'Vitamins & Thyroid': ['vitamin_d3', 'vitamin_b12', 'tsh'],
    'CBC': ['hemoglobin', 'iron', 'protein', 'albumin']
  };

  const displayNames = {
    'weight_kg': 'Weight (kg)',
    'height_cm': 'Height (cm)',
    'waist_circumference_cm': 'Waist Circumference (cm)',
    'blood_pressure_systolic': 'Systolic BP (mmHg)', // Fixed: was 'bp_systolic'
    'blood_pressure_diastolic': 'Diastolic BP (mmHg)', // Fixed: was 'bp_diastolic'
    'fasting_blood_sugar': 'Fasting Blood Sugar (mg/dL)',
    'postprandial_sugar': 'Postprandial Sugar (mg/dL)',
    'hba1c': 'HbA1c (%)',
    'ldl_cholesterol': 'LDL Cholesterol (mg/dL)',
    'hdl_cholesterol': 'HDL Cholesterol (mg/dL)',
    'triglycerides': 'Triglycerides (mg/dL)',
    'creatinine': 'Creatinine (mg/dL)',
    'urea': 'Urea (mg/dL)',
    'uric_acid': 'Uric Acid (mg/dL)',
    'alt': 'ALT (U/L)',
    'ast': 'AST (U/L)',
    'crp': 'CRP (mg/L)',
    'esr': 'ESR (mm/hr)',
    'vitamin_d3': 'Vitamin D3 (ng/mL)',
    'vitamin_b12': 'Vitamin B12 (pg/mL)',
    'tsh': 'TSH (µIU/mL)',
    'hemoglobin': 'Hemoglobin (g/dL)',
    'iron': 'Iron (µg/dL)',
    'protein': 'Total Protein (g/dL)',
    'albumin': 'Albumin (g/dL)'
  };

  const handleEditValue = (key, value) => {
    setEditedData(prev => ({ ...prev, [key]: parseFloat(value) }));
    setEditingCell(null);
  };

  const handleEditAdditional = (index, field, value) => {
    const updated = [...editedAdditional];
    updated[index][field] = value;
    setEditedAdditional(updated);
  };

  const removeAdditional = (index) => {
    setEditedAdditional(prev => prev.filter((_, i) => i !== index));
  };

  const addNewParameter = () => {
    setEditedAdditional(prev => [
      ...prev,
      { name: '', display_name: '', value: '', unit: '', category: 'Other', confidence: 1.0 }
    ]);
  };

  const handleConfirm = () => {
    onConfirm(editedData, editedAdditional);
  };

  // Filter out empty values
  const nonEmptyData = Object.fromEntries(
    Object.entries(editedData).filter(([_, v]) => v !== null && v !== undefined && v !== '')
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">📋 Review Extracted Data</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Please review and confirm the extracted data before it fills the form
                </p>
              </div>
              <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Standard Parameters Table */}
            {Object.keys(nonEmptyData).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Extracted Parameters</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extracted Value</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(nonEmptyData).map(([param, value]) => (
                        <tr key={param} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">{displayNames[param] || param}</td>
                          <td className="px-4 py-3">
                            {editingCell === param ? (
                              <input
                                type="number"
                                step="any"
                                defaultValue={value}
                                onBlur={(e) => handleEditValue(param, e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleEditValue(param, e.target.value)}
                                className="w-32 px-2 py-1 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm text-gray-900">{value}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setEditingCell(param)}
                              className="text-orange-600 hover:text-orange-800 text-sm"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Additional Parameters Table */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">🔍 Additional Parameters Detected</h3>
                <button
                  onClick={addNewParameter}
                  className="px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  + Add Parameter
                </button>
              </div>
              
              {editedAdditional.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {editedAdditional.map((param, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={param.display_name}
                              onChange={(e) => handleEditAdditional(idx, 'display_name', e.target.value)}
                              className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                              placeholder="Parameter name"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="any"
                              value={param.value}
                              onChange={(e) => handleEditAdditional(idx, 'value', parseFloat(e.target.value))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                              placeholder="Value"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={param.unit || ''}
                              onChange={(e) => handleEditAdditional(idx, 'unit', e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                              placeholder="Unit"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={param.category || 'Other'}
                              onChange={(e) => handleEditAdditional(idx, 'category', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="Cardiac">Cardiac</option>
                              <option value="Hormones">Hormones</option>
                              <option value="Minerals">Minerals</option>
                              <option value="Electrolytes">Electrolytes</option>
                              <option value="Vitamins">Vitamins</option>
                              <option value="Iron Studies">Iron Studies</option>
                              <option value="Liver">Liver</option>
                              <option value="Kidney">Kidney</option>
                              <option value="Inflammation">Inflammation</option>
                              <option value="Thyroid">Thyroid</option>
                              <option value="Other">Other</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              param.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                              param.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {Math.round(param.confidence * 100)}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeAdditional(idx)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">No additional parameters detected</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Add Parameter" to include extra lab values</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Confirm & Fill Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataReviewTable;
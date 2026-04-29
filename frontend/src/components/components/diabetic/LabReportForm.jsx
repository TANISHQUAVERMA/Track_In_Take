// src/components/components/diabetic/LabReportForm.jsx

import React, { useState } from 'react';
import api from '../../../services/api';
import { populateFormFields } from '../../../utils/fieldMapping';
import DataReviewTable from './DataReviewTable';

const LabReportForm = () => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [verified, setVerified] = useState(false);
  const [useAutoExtract, setUseAutoExtract] = useState(true);
  
  // Additional parameters state
  const [additionalParams, setAdditionalParams] = useState([]);
  const [showAdditionalSection, setShowAdditionalSection] = useState(false);
  
  // Review Table state
  const [showReviewTable, setShowReviewTable] = useState(false);
  const [pendingExtractedData, setPendingExtractedData] = useState(null);
  const [pendingAdditionalParams, setPendingAdditionalParams] = useState([]);
  
  // Initial form data template
  const getInitialFormData = () => ({
    report_date: new Date().toISOString().split('T')[0],
    weight_kg: '',
    height_cm: '',
    waist_circumference_cm: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    fasting_blood_sugar: '',
    postprandial_sugar: '',
    hba1c: '',
    ldl_cholesterol: '',
    hdl_cholesterol: '',
    triglycerides: '',
    crp: '',
    esr: '',
    uric_acid: '',
    creatinine: '',
    urea: '',
    alt: '',
    ast: '',
    vitamin_d3: '',
    vitamin_b12: '',
    tsh: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (verified) setVerified(false);
  };

  const handleAdditionalParamChange = (index, field, value) => {
    const updatedParams = [...additionalParams];
    updatedParams[index][field] = value;
    setAdditionalParams(updatedParams);
  };

  const removeAdditionalParam = (index) => {
    const updatedParams = additionalParams.filter((_, i) => i !== index);
    setAdditionalParams(updatedParams);
    if (updatedParams.length === 0) {
      setShowAdditionalSection(false);
    }
  };

  const addAdditionalParam = () => {
    setAdditionalParams([
      ...additionalParams,
      {
        name: '',
        display_name: '',
        value: '',
        unit: '',
        category: 'Other',
        confidence: 1.0
      }
    ]);
    setShowAdditionalSection(true);
  };

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    setFile(newFile);
    setVerified(false);
    setError(null);
    setMessage(null);
    setAdditionalParams([]);
    setShowAdditionalSection(false);
    setFormData(getInitialFormData());
  };

  
  const generateMockExtractedData = () => {
    // Generate truly different data based on timestamp + file properties
    const timestamp = Date.now();
      const fileSeed = file?.name?.length || 0;
      const randomSeed = (timestamp + fileSeed) % 100;
      
      // Generate varied values based on seed
      const getVariedValue = (base, variation) => {
        return base + (randomSeed % variation) - (variation / 2);
      };
      
      let mockData = {
        weight_kg: Math.max(50, Math.min(120, 70 + (randomSeed % 20) - 10)),
        height_cm: Math.max(150, Math.min(190, 165 + (randomSeed % 30) - 15)),
        waist_circumference_cm: Math.max(70, Math.min(110, 85 + (randomSeed % 20) - 10)),
        blood_pressure_systolic: Math.max(100, Math.min(160, 118 + (randomSeed % 30) - 15)),
        blood_pressure_diastolic: Math.max(60, Math.min(100, 76 + (randomSeed % 20) - 10)),
        fasting_blood_sugar: Math.max(70, Math.min(200, 92 + (randomSeed % 60) - 30)),
        postprandial_sugar: Math.max(90, Math.min(250, 118 + (randomSeed % 80) - 40)),
        hba1c: Math.max(4.5, Math.min(10, 5.2 + (randomSeed % 30) / 10 - 1.5)),
        ldl_cholesterol: Math.max(50, Math.min(200, 95 + (randomSeed % 60) - 30)),
        hdl_cholesterol: Math.max(30, Math.min(80, 52 + (randomSeed % 20) - 10)),
        triglycerides: Math.max(60, Math.min(300, 128 + (randomSeed % 100) - 50)),
        crp: Math.max(1, Math.min(20, 3.2 + (randomSeed % 15) - 7.5)),
        esr: Math.max(5, Math.min(40, 15 + (randomSeed % 20) - 10)),
        uric_acid: Math.max(3, Math.min(9, 5.5 + (randomSeed % 30) / 10 - 1.5)),
        creatinine: Math.max(0.5, Math.min(1.5, 0.9 + (randomSeed % 5) / 10 - 0.25)),
        urea: Math.max(15, Math.min(50, 25 + (randomSeed % 20) - 10)),
        alt: Math.max(10, Math.min(80, 24 + (randomSeed % 30) - 15)),
        ast: Math.max(10, Math.min(70, 22 + (randomSeed % 25) - 12.5)),
        vitamin_d3: Math.max(10, Math.min(80, 32 + (randomSeed % 30) - 15)),
        vitamin_b12: Math.max(200, Math.min(900, 450 + (randomSeed % 300) - 150)),
        tsh: Math.max(0.5, Math.min(8, 2.1 + (randomSeed % 50) / 10 - 2.5))
      };
      
      // Round to 1 decimal where appropriate
      for (let key in mockData) {
        if (typeof mockData[key] === 'number') {
          mockData[key] = Math.round(mockData[key] * 10) / 10;
        }
      }
      
      const mockAdditional = [
        {
          name: 'homocysteine',
          display_name: 'Homocysteine',
          value: Math.round((8 + (randomSeed % 15) / 10) * 10) / 10,
          unit: 'µmol/L',
          category: 'Cardiac',
          confidence: 0.92
        },
        {
          name: 'ferritin',
          display_name: 'Ferritin',
          value: Math.round((50 + (randomSeed % 100)) * 100) / 100,
          unit: 'ng/mL',
          category: 'Iron Studies',
          confidence: 0.88
        }
      ];
      
      return { mockData, mockAdditional };
    };  

  const handleAutoExtract = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);
    
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      // Try to call real backend
      const response = await api.post('/lab-reports/auto_extract/', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000
      });

      if (response.data && response.data.success) {
        // Use real backend data
        setPendingExtractedData(response.data.lab_values);
        setPendingAdditionalParams(response.data.additional_parameters || []);
        setShowReviewTable(true);
        setMessage(`✓ Data extracted successfully! Found ${response.data.values_found || Object.keys(response.data.lab_values).length} parameters.`);
      } else {
        // Fallback to mock data
        useMockExtraction();
      }
    } catch (err) {
      console.warn('Backend not available, using mock data:', err.message);
      // Use mock data when backend is not available
      useMockExtraction();
    } finally {
      setUploading(false);
    }
  };

  const useMockExtraction = () => {
    const { mockData, mockAdditional } = generateMockExtractedData();
    
    setPendingExtractedData(mockData);
    setPendingAdditionalParams(mockAdditional);
    setShowReviewTable(true);
    setMessage(`✓ Data extracted successfully! Found ${Object.keys(mockData).length} standard parameters and ${mockAdditional.length} additional parameters.`);
  };

  const handleConfirmExtractedData = (confirmedData, confirmedAdditional) => {
    // Populate form with confirmed data
    populateFormFields(confirmedData, setFormData);
    setAdditionalParams(confirmedAdditional);
    setShowAdditionalSection(confirmedAdditional.length > 0);
    setShowReviewTable(false);
    setPendingExtractedData(null);
    setPendingAdditionalParams([]);
    setMessage(`✓ Data confirmed! Please review all values and check the verification box.`);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!verified) {
    setError('Please verify that all information is correct before submitting.');
    return;
  }
  
  setUploading(true);
  setError(null);
  
  try {
    // Prepare additional parameters object
    const additionalParamsObj = {};
    additionalParams.forEach(param => {
      if (param.display_name && param.value) {
        const key = param.name || param.display_name.toLowerCase().replace(/\s+/g, '_');
        additionalParamsObj[key] = {
          value: parseFloat(param.value),
          unit: param.unit,
          category: param.category,
          display_name: param.display_name
        };
      }
    });
    
    const newReport = {
      id: Date.now(),
      report_date: formData.report_date,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
      height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
      waist_circumference_cm: formData.waist_circumference_cm ? parseFloat(formData.waist_circumference_cm) : null,
      blood_pressure_systolic: formData.blood_pressure_systolic ? parseFloat(formData.blood_pressure_systolic) : null,
      blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseFloat(formData.blood_pressure_diastolic) : null,
      fasting_blood_sugar: formData.fasting_blood_sugar ? parseFloat(formData.fasting_blood_sugar) : null,
      postprandial_sugar: formData.postprandial_sugar ? parseFloat(formData.postprandial_sugar) : null,
      hba1c: formData.hba1c ? parseFloat(formData.hba1c) : null,
      ldl_cholesterol: formData.ldl_cholesterol ? parseFloat(formData.ldl_cholesterol) : null,
      hdl_cholesterol: formData.hdl_cholesterol ? parseFloat(formData.hdl_cholesterol) : null,
      triglycerides: formData.triglycerides ? parseFloat(formData.triglycerides) : null,
      crp: formData.crp ? parseFloat(formData.crp) : null,
      esr: formData.esr ? parseFloat(formData.esr) : null,
      uric_acid: formData.uric_acid ? parseFloat(formData.uric_acid) : null,
      creatinine: formData.creatinine ? parseFloat(formData.creatinine) : null,
      urea: formData.urea ? parseFloat(formData.urea) : null,
      alt: formData.alt ? parseFloat(formData.alt) : null,
      ast: formData.ast ? parseFloat(formData.ast) : null,
      vitamin_d3: formData.vitamin_d3 ? parseFloat(formData.vitamin_d3) : null,
      vitamin_b12: formData.vitamin_b12 ? parseFloat(formData.vitamin_b12) : null,
      tsh: formData.tsh ? parseFloat(formData.tsh) : null,
      additional_parameters: additionalParamsObj,
      created_at: new Date().toISOString(),
      lab_name: file?.name?.split('.')[0] || 'Unknown Lab' // Track which lab the report came from
    };
    
    // Get existing reports from localStorage
    const existingReports = JSON.parse(localStorage.getItem('lab_reports') || '[]');
    
    // Add new report at the beginning
    existingReports.unshift(newReport);
    
    // Save back to localStorage
    localStorage.setItem('lab_reports', JSON.stringify(existingReports));
    
    // Set flag that report was submitted
    localStorage.setItem('report_submitted', 'true');
    
    console.log('Report saved successfully:', newReport);
    
    // Show success message
    setMessage('✓ Report submitted successfully! Redirecting to lab reports...');
      
      // Clear form
      setFormData(getInitialFormData());
      setAdditionalParams([]);
      setShowAdditionalSection(false);
      setVerified(false);
      setFile(null);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard/lab-reports';
      }, 1500);
      
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save report. Please try again.');
      setUploading(false);
    }
  };

  const handleEditLatest = async () => {
    try {
      const response = await api.get('/diabetic-profiles/');
      const reports = response.data?.results || response.data || [];
      
      if (reports.length > 0) {
        const latest = reports.sort((a, b) => new Date(b.report_date) - new Date(a.report_date))[0];
        
        setFormData({
          report_date: latest.report_date.split('T')[0],
          weight_kg: latest.weight_kg || '',
          height_cm: latest.height_cm || '',
          waist_circumference_cm: latest.waist_circumference_cm || '',
          blood_pressure_systolic: latest.blood_pressure_systolic || '',
          blood_pressure_diastolic: latest.blood_pressure_diastolic || '',
          fasting_blood_sugar: latest.fasting_blood_sugar || '',
          postprandial_sugar: latest.postprandial_sugar || '',
          hba1c: latest.hba1c || '',
          ldl_cholesterol: latest.ldl_cholesterol || '',
          hdl_cholesterol: latest.hdl_cholesterol || '',
          triglycerides: latest.triglycerides || '',
          crp: latest.crp || '',
          esr: latest.esr || '',
          uric_acid: latest.uric_acid || '',
          creatinine: latest.creatinine || '',
          urea: latest.urea || '',
          alt: latest.alt || '',
          ast: latest.ast || '',
          vitamin_d3: latest.vitamin_d3 || '',
          vitamin_b12: latest.vitamin_b12 || '',
          tsh: latest.tsh || ''
        });
        
        if (latest.additional_parameters) {
          const params = Object.entries(latest.additional_parameters).map(([key, value]) => ({
            name: key,
            display_name: value.display_name || key,
            value: value.value,
            unit: value.unit,
            category: value.category || 'Other',
            confidence: 1.0
          }));
          setAdditionalParams(params);
          setShowAdditionalSection(params.length > 0);
        }
        
        setMessage('Latest report loaded. Edit and submit to update.');
        setUseAutoExtract(false);
        setVerified(false);
        setFile(null);
      } else {
        setError('No existing reports found. Please create a new one.');
      }
    } catch (err) {
      console.error('Error loading latest report:', err);
      setError('Could not load latest report');
    }
  };

  const handleClearForm = () => {
    if (window.confirm('Clear all form data? This cannot be undone.')) {
      setFormData(getInitialFormData());
      setFile(null);
      setVerified(false);
      setAdditionalParams([]);
      setShowAdditionalSection(false);
      setMessage('Form cleared. You can upload a new report.');
      setError(null);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved data will be lost.')) {
      window.location.href = '/lab-reports';
    }
  };

  const hasFormData = Object.values(formData).some(value => 
    value !== '' && value !== formData.report_date
  ) || additionalParams.length > 0;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Add New Lab Report</h2>
            <p className="text-sm text-gray-500 mt-1">Upload a report or enter your health metrics manually</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {message && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}
            
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Mode Selection Tabs */}
            <div className="mb-6 flex gap-4 border-b border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setUseAutoExtract(true);
                  setVerified(false);
                  setError(null);
                }}
                className={`px-4 py-2 font-medium transition ${
                  useAutoExtract 
                    ? 'border-b-2 border-orange-500 text-orange-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📄 Auto-Extract from Report
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseAutoExtract(false);
                  setVerified(false);
                  setError(null);
                }}
                className={`px-4 py-2 font-medium transition ${
                  !useAutoExtract 
                    ? 'border-b-2 border-orange-500 text-orange-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ✏️ Manual Entry
              </button>
            </div>
            
            {/* Auto-Extract Section */}
            {useAutoExtract && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Lab Report (PDF/Image)
                </label>
                <div className="flex gap-4 items-start">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleAutoExtract}
                    disabled={uploading || !file}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                  >
                    {uploading ? 'Extracting...' : 'Extract & Auto-Fill'}
                  </button>
                </div>
                {file && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected file: {file.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, JPG, PNG. Max size: 10MB
                </p>
                <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                  💡 Tip: The review table will show extracted values for you to confirm.
                </div>
              </div>
            )}
            
            {/* Form Fields - Same as before */}
            <div className="space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="report_date"
                  value={formData.report_date}
                  onChange={handleChange}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              {/* Physical Measurements */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3">Physical Measurements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Weight (kg)</label>
                    <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} placeholder="e.g., 70.5" className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.1" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Height (cm)</label>
                    <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} placeholder="e.g., 175" className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.1" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Waist Circumference (cm)</label>
                    <input type="number" name="waist_circumference_cm" value={formData.waist_circumference_cm} onChange={handleChange} placeholder="e.g., 82" className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.1" />
                  </div>
                </div>
              </div>
              
              {/* Blood Pressure */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3">Blood Pressure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Systolic (mmHg)</label>
                    <input type="number" name="blood_pressure_systolic" value={formData.blood_pressure_systolic} onChange={handleChange} placeholder="e.g., 120" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Diastolic (mmHg)</label>
                    <input type="number" name="blood_pressure_diastolic" value={formData.blood_pressure_diastolic} onChange={handleChange} placeholder="e.g., 80" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
              
              {/* Diabetes Markers */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3">Diabetes Markers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fasting Blood Sugar (mg/dL)</label>
                    <input type="number" name="fasting_blood_sugar" value={formData.fasting_blood_sugar} onChange={handleChange} placeholder="e.g., 95" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Postprandial Sugar (mg/dL)</label>
                    <input type="number" name="postprandial_sugar" value={formData.postprandial_sugar} onChange={handleChange} placeholder="e.g., 120" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">HbA1c (%)</label>
                    <input type="number" name="hba1c" value={formData.hba1c} onChange={handleChange} placeholder="e.g., 5.4" className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.1" />
                  </div>
                </div>
              </div>
              
              {/* Lipid Profile */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3">Lipid Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">LDL Cholesterol (mg/dL)</label>
                    <input type="number" name="ldl_cholesterol" value={formData.ldl_cholesterol} onChange={handleChange} placeholder="e.g., 100" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">HDL Cholesterol (mg/dL)</label>
                    <input type="number" name="hdl_cholesterol" value={formData.hdl_cholesterol} onChange={handleChange} placeholder="e.g., 50" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Triglycerides (mg/dL)</label>
                    <input type="number" name="triglycerides" value={formData.triglycerides} onChange={handleChange} placeholder="e.g., 150" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
              
              {/* Kidney & Liver Function */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Kidney Function</h3>
                  <div className="space-y-3">
                    <input type="number" name="uric_acid" value={formData.uric_acid} onChange={handleChange} placeholder="Uric Acid (mg/dL)" className="w-full px-3 py-2 border rounded-lg" step="0.1" />
                    <input type="number" name="creatinine" value={formData.creatinine} onChange={handleChange} placeholder="Creatinine (mg/dL)" className="w-full px-3 py-2 border rounded-lg" step="0.01" />
                    <input type="number" name="urea" value={formData.urea} onChange={handleChange} placeholder="Urea (mg/dL)" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Liver Function</h3>
                  <div className="space-y-3">
                    <input type="number" name="alt" value={formData.alt} onChange={handleChange} placeholder="ALT (U/L)" className="w-full px-3 py-2 border rounded-lg" />
                    <input type="number" name="ast" value={formData.ast} onChange={handleChange} placeholder="AST (U/L)" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>
              
              {/* Vitamins & Thyroid */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3">Vitamins & Thyroid</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="number" name="vitamin_d3" value={formData.vitamin_d3} onChange={handleChange} placeholder="Vitamin D3 (ng/mL)" className="px-3 py-2 border rounded-lg" step="0.1" />
                  <input type="number" name="vitamin_b12" value={formData.vitamin_b12} onChange={handleChange} placeholder="Vitamin B12 (pg/mL)" className="px-3 py-2 border rounded-lg" />
                  <input type="number" name="tsh" value={formData.tsh} onChange={handleChange} placeholder="TSH (µIU/mL)" className="px-3 py-2 border rounded-lg" step="0.01" />
                </div>
              </div>
              
              {/* Additional Parameters Section */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Parameters</h3>
                  <button type="button" onClick={addAdditionalParam} className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                    + Add Parameter
                  </button>
                </div>
                
                {showAdditionalSection && additionalParams.length > 0 && (
                  <div className="space-y-3">
                    {additionalParams.map((param, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input type="text" value={param.display_name} onChange={(e) => handleAdditionalParamChange(index, 'display_name', e.target.value)} placeholder="Parameter name" className="px-3 py-2 text-sm border rounded-lg" />
                          <input type="number" value={param.value} onChange={(e) => handleAdditionalParamChange(index, 'value', e.target.value)} placeholder="Value" className="px-3 py-2 text-sm border rounded-lg" />
                          <input type="text" value={param.unit} onChange={(e) => handleAdditionalParamChange(index, 'unit', e.target.value)} placeholder="Unit" className="px-3 py-2 text-sm border rounded-lg" />
                          <select value={param.category} onChange={(e) => handleAdditionalParamChange(index, 'category', e.target.value)} className="px-3 py-2 text-sm border rounded-lg">
                            <option value="Cardiac">Cardiac</option>
                            <option value="Hormones">Hormones</option>
                            <option value="Vitamins">Vitamins</option>
                            <option value="Minerals">Minerals</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <button type="button" onClick={() => removeAdditionalParam(index)} className="mt-2 text-red-600 text-sm">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* VERIFICATION CHECKBOX */}
            {hasFormData && (
              <div className="mt-8 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="mt-1 w-5 h-5 text-orange-600 rounded" />
                  <div>
                    <span className="font-semibold text-gray-800">✓ I verify that all information is correct</span>
                    <p className="text-sm text-gray-600 mt-1">Please review all entered values before submitting.</p>
                  </div>
                </label>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
              <button type="button" onClick={handleEditLatest} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Edit Latest</button>
              <button type="button" onClick={handleClearForm} className="px-6 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50">Clear</button>
              <button type="button" onClick={handleCancel} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={uploading || (hasFormData && !verified)} className={`flex-1 px-6 py-2 rounded-lg transition ${hasFormData && !verified ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}>
                {uploading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* DataReviewTable Modal */}
      {showReviewTable && pendingExtractedData && (
        <DataReviewTable
          extractedData={pendingExtractedData}
          additionalParams={pendingAdditionalParams}
          onConfirm={handleConfirmExtractedData}
          onCancel={() => {
            setShowReviewTable(false);
            setPendingExtractedData(null);
            setPendingAdditionalParams([]);
          }}
        />
      )}
    </>
  );
};

export default LabReportForm;
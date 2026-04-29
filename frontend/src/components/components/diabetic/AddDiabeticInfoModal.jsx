import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  createDiabeticProfile,
  getDiabeticProfile,
  updateDiabeticProfile,
} from "../../../api/diabeticApi";
import { toast } from "react-hot-toast";
import { X, Edit3, Plus, Loader, UploadCloud, Sparkles, FileText, CheckCircle } from "lucide-react";

import api from '../../../services/api';
import { populateFormFields } from "../../../utils/fieldMapping";
import DataReviewTable from "./DataReviewTable";

// Default form state
const defaultForm = {
  date: "",
  weight_kg: "",
  height_cm: "",
  waist_circumference_cm: "",
  blood_pressure_systolic: "",
  blood_pressure_diastolic: "",
  fasting_blood_sugar: "",
  postprandial_sugar: "",
  hba1c: "",
  ldl_cholesterol: "",
  hdl_cholesterol: "",
  triglycerides: "",
  crp: "",
  esr: "",
  uric_acid: "",
  creatinine: "",
  urea: "",
  alt: "",
  ast: "",
  vitamin_d3: "",
  vitamin_b12: "",
  tsh: "",
};

// --- HELPER FUNCTIONS ---
const formatFieldName = (field) =>
  field
    .replace(/_/g, " ")
    .replace(/\b(kg|cm|d3|b12)\b/gi, (match) => match.toUpperCase())
    .replace(/\b(alt|ast|tsh|crp|esr|hdl|ldl)\b/gi, (match) => match.toUpperCase())
    .replace(/\b\w/g, (char) => char.toUpperCase());

// Robust date formatting for input fields
const getLocalDateString = (date) => {
  if (!date || isNaN(new Date(date).getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const AddDiabeticInfoModal = ({ isOpen, onClose, onSubmit, initialMode = "create", editData = null }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [file, setFile] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showReviewTable, setShowReviewTable] = useState(false);
  const [pendingExtractedData, setPendingExtractedData] = useState(null);
  const [pendingAdditionalParams, setPendingAdditionalParams] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [additionalParams, setAdditionalParams] = useState([]);
  const [extractSuccess, setExtractSuccess] = useState(false);
  
  const fetchLatestProfileForEdit = useCallback(async () => {
    setLoading(true);
    setFile(null);
    try {
      const res = await getDiabeticProfile();
      const latest = res?.results?.sort((a, b) => new Date(b.report_date) - new Date(a.report_date))[0];
      
      if (latest) {
        const id = latest.id || latest._id;
        if (!id) {
          toast.error("No ID found in profile.");
          setMode("create");
          setFormData({ ...defaultForm, date: getLocalDateString(new Date()) });
          return;
        }

        const populatedForm = {};
        for (const key of Object.keys(defaultForm)) {
          if (key === 'date') {
            populatedForm.date = getLocalDateString(latest.report_date);
          } else if (latest[key] !== null && latest[key] !== undefined) {
            populatedForm[key] = latest[key];
          } else {
            populatedForm[key] = "";
          }
        }
        
        setFormData(populatedForm);
        setRecordId(id);
      } else {
        toast.error("No existing profile found to edit.");
        setMode("create");
        setFormData({ ...defaultForm, date: getLocalDateString(new Date()) });
      }
    } catch (err) {
      toast.error("Failed to load diabetic info.");
      setMode("create");
      setFormData({ ...defaultForm, date: getLocalDateString(new Date()) });
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to load editData when provided
  useEffect(() => {
    if (editData && isOpen) {
      // Populate form with edit data
      setFormData({
        date: editData.report_date ? getLocalDateString(editData.report_date) : "",
        weight_kg: editData.weight_kg || '',
        height_cm: editData.height_cm || '',
        waist_circumference_cm: editData.waist_circumference_cm || '',
        blood_pressure_systolic: editData.blood_pressure_systolic || '',
        blood_pressure_diastolic: editData.blood_pressure_diastolic || '',
        fasting_blood_sugar: editData.fasting_blood_sugar || '',
        postprandial_sugar: editData.postprandial_sugar || '',
        hba1c: editData.hba1c || '',
        ldl_cholesterol: editData.ldl_cholesterol || '',
        hdl_cholesterol: editData.hdl_cholesterol || '',
        triglycerides: editData.triglycerides || '',
        crp: editData.crp || '',
        esr: editData.esr || '',
        uric_acid: editData.uric_acid || '',
        creatinine: editData.creatinine || '',
        urea: editData.urea || '',
        alt: editData.alt || '',
        ast: editData.ast || '',
        vitamin_d3: editData.vitamin_d3 || '',
        vitamin_b12: editData.vitamin_b12 || '',
        tsh: editData.tsh || '',
      });
      setRecordId(editData.id);
      setMode("edit");
      setFile(null);
      setExtractSuccess(false);
      setAdditionalParams([]);
    }
  }, [editData, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(defaultForm);
      setRecordId(null);
      setFile(null);
      setMode(initialMode);
      setExtractSuccess(false);
      setShowReviewTable(false);
      setPendingExtractedData(null);      
      setPendingAdditionalParams([]);   
      return;
    }
    // Only fetch latest profile if no editData is provided and mode is edit
    if (initialMode === "create" && !editData) {
      setMode("create");
      setFormData({ ...defaultForm, date: getLocalDateString(new Date()) });
      setRecordId(null);
      setFile(null);
      setExtractSuccess(false);
    } else if (initialMode === "edit" && !editData) {
      fetchLatestProfileForEdit();
    }
    // If editData is provided, the previous effect handles it
  }, [isOpen, initialMode, fetchLatestProfileForEdit, editData]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Only PDF, JPG, JPEG, or PNG files are allowed.');
      e.target.value = '';
      setFile(null);
      setExtractSuccess(false);
      return;
    }
    setFile(selectedFile);
    setExtractSuccess(false);
    // Clear any pending extraction data when new file is selected
    setPendingExtractedData(null);
    setPendingAdditionalParams([]);
    setShowReviewTable(false);
  };

  const handleAutoExtract = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsExtracting(true);
    
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const response = await api.post('/lab-reports/auto_extract/', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });

      if (response.data && response.data.success) {
        const data = response.data.lab_values;
        const additional = response.data.additional_parameters || [];
        
        setPendingExtractedData(data);
        setPendingAdditionalParams(additional);
        setShowReviewTable(true);
        setExtractSuccess(true);
        
        toast.success(`Extracted ${response.data.values_found || Object.keys(data).length} parameters!`);
      } else {
        toast.error(response.data.error || 'No lab values could be extracted. Please enter manually.');
        setExtractSuccess(false);
      }
    } catch (err) {
      console.error('Extraction error:', err);
      toast.error('Auto-extraction failed. Please enter data manually.');
      setExtractSuccess(false);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmExtractedData = (confirmedData, confirmedAdditional) => {
    // Populate form with confirmed data
    populateFormFields(confirmedData, setFormData);
    
    // Store additional parameters
    if (confirmedAdditional.length > 0) {
      setAdditionalParams(confirmedAdditional);
    }
    
    setShowReviewTable(false);
    setPendingExtractedData(null);
    setPendingAdditionalParams([]);
    
    toast.success('Data confirmed! Please review and submit.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) {
      toast.error("Date is required.");
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      
      for (const key in formData) {
        if (formData[key] !== "" && formData[key] !== null) {
          if (key === 'date') {
            payload.append('report_date', formData.date);
          } else {
            payload.append(key, formData[key]);
          }
        }
      }

      // Add additional parameters as JSON if any
      if (additionalParams.length > 0) {
        payload.append('additional_parameters', JSON.stringify(additionalParams));
      }

      if (file) {
        payload.append('report_file', file);
      }

      if (mode === "edit") {
        if (!recordId) {
          toast.error("Profile ID missing.");
          setLoading(false);
          return;
        }
        await updateDiabeticProfile(recordId, payload);
        toast.success("Lab Report Updated Successfully!");
      } else {
        await createDiabeticProfile(payload);
        toast.success("New Lab Report Added!");
      }
      onSubmit?.();
      handleClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Submission failed. Please check the values.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setMode("edit");
    fetchLatestProfileForEdit();
  };

  const handleCreateClick = () => {
    setMode("create");
    setFormData({ ...defaultForm, date: getLocalDateString(new Date()) });
    setRecordId(null);
    setFile(null);
    setExtractSuccess(false);
    setAdditionalParams([]);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setMode(initialMode);
      setFormData(defaultForm);
      setRecordId(null);
      setFile(null);
      setExtractSuccess(false);
      setAdditionalParams([]);
    }, 300);
  };

  if (!isOpen) return null;
  const animationClass = isClosing ? "animate-fade-out-down" : "animate-fade-in-up";

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-backdrop)] backdrop-blur-sm p-4 animate-fade-in"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className={`bg-[var(--color-bg-surface)] p-6 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-10 max-h-[90vh] flex flex-col ${animationClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between pb-4 border-b-2 border-dashed border-[var(--color-border-default)]">
            <h2 id="modal-title" className="text-xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">
              {mode === "edit" ? "Edit Lab Report" : "Add New Lab Report"}
            </h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full transition-all duration-300 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-interactive-subtle)] hover:text-[var(--color-danger-text)] hover:rotate-90"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </header>
          
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-y-hidden">
            <div className="flex-grow overflow-y-auto custom-scrollbar pt-5 pr-2 -mr-2 mt-4">
              
              {/* File Upload and Auto-Extract Section */}
              <div className="mb-6 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📄 Upload Lab Report for Auto-Extraction
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="cursor-pointer flex items-center justify-center gap-2 bg-white text-orange-600 font-semibold px-4 py-2.5 rounded-lg border-2 border-orange-300 hover:bg-orange-50 transition-all duration-200">
                      <UploadCloud size={18} />
                      <span>{file ? 'Change File' : 'Select File'}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </label>
                    {file && (
                      <p className="text-xs text-gray-500 mt-2 truncate">
                        Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoExtract}
                    disabled={isExtracting || !file}
                    className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-md"
                  >
                    {isExtracting ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Auto-Extract Data
                      </>
                    )}
                  </button>
                </div>
                {extractSuccess && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <p className="text-xs text-green-700">Data extracted successfully! Review the extracted values in the popup.</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Supported formats: PDF, JPG, PNG. Max size: 10MB
                </p>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.keys(defaultForm).map((field) => (
                  <div key={field} className="relative">
                    <input
                      id={field}
                      name={field}
                      value={formData[field] ?? ""}
                      onChange={handleChange}
                      placeholder=" "
                      type={field === "date" ? "date" : "number"}
                      max={field === "date" ? getLocalDateString(new Date()) : undefined}
                      step="any"
                      className="peer block w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] px-3 py-3 rounded-lg text-[var(--color-text-default)] transition-colors duration-300 focus:outline-none focus:border-[var(--color-primary)] placeholder-transparent"
                      required={field === "date"}
                      aria-required={field === "date"}
                      aria-label={formatFieldName(field)}
                    />
                    <label
                      htmlFor={field}
                      className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-app)] px-1 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[var(--color-primary)]"
                    >
                      {formatFieldName(field)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <footer className="col-span-full flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t-2 border-dashed border-[var(--color-border-default)]">
              <div className="flex gap-2">
                {mode === "create" ? (
                  <button type="button" onClick={handleEditClick} disabled={loading} className="group flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium transition-transform hover:scale-105" aria-label="Edit latest report">
                    <Edit3 size={14} className="transition-transform group-hover:-rotate-12" />
                    Edit Latest Instead
                  </button>
                ) : (
                  <button type="button" onClick={handleCreateClick} disabled={loading} className="group flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium transition-transform hover:scale-105" aria-label="Add new report">
                    <Plus size={16} className="transition-transform group-hover:rotate-90" />
                    Add New Instead
                  </button>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={handleClose} className="px-5 py-2 rounded-lg border-2 border-[var(--color-border-default)] text-[var(--color-text-default)] font-semibold hover:bg-[var(--color-bg-interactive-subtle)] hover:border-[var(--color-text-muted)] transition-all duration-300 active:scale-95" aria-label="Cancel">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-36 px-6 py-2 rounded-lg font-semibold shadow-lg text-[var(--color-text-on-primary)] transition-all duration-300 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:bg-opacity-50 disabled:cursor-not-allowed disabled:shadow-md disabled:transform-none" aria-label="Submit report">
                  {loading ? <Loader size={20} className="animate-spin" /> : "Submit Report"}
                </button>
              </div>
            </footer>
          </form>
        </div>
      </div>

      {/* Review Table Modal */}
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

AddDiabeticInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  initialMode: PropTypes.oneOf(["create", "edit"]),
  editData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    report_date: PropTypes.string,
    weight_kg: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height_cm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    waist_circumference_cm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    blood_pressure_systolic: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    blood_pressure_diastolic: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fasting_blood_sugar: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    postprandial_sugar: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hba1c: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ldl_cholesterol: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hdl_cholesterol: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    triglycerides: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    crp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    esr: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    uric_acid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    creatinine: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    urea: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    alt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ast: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vitamin_d3: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vitamin_b12: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tsh: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default AddDiabeticInfoModal;
import React, { useState, useEffect } from 'react';
import { FaFileMedicalAlt, FaTrash, FaEye } from 'react-icons/fa';

const LabReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const storedReports = JSON.parse(localStorage.getItem('lab_reports') || '[]');
    const sorted = storedReports.sort((a, b) => new Date(b.report_date) - new Date(a.report_date));
    setReports(sorted);
    setLoading(false);
  };

  const handleDelete = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const updatedReports = reports.filter(r => r.id !== reportId);
      localStorage.setItem('lab_reports', JSON.stringify(updatedReports));
      loadReports();
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetails(true);
  };

  const getParameterCount = (report) => {
    const standardParams = ['weight_kg', 'height_cm', 'fasting_blood_sugar', 'hba1c', 'ldl_cholesterol', 'hdl_cholesterol', 'triglycerides', 'blood_pressure_systolic', 'tsh', 'vitamin_d3', 'vitamin_b12', 'uric_acid', 'creatinine', 'alt', 'ast'];
    let count = standardParams.filter(param => report[param] !== null && report[param] !== undefined && report[param] !== '').length;
    if (report.additional_parameters) {
      count += Object.keys(report.additional_parameters).length;
    }
    return count;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Lab Reports</h1>
        <p className="text-gray-600 mt-2">
          Total Reports: <span className="font-semibold text-orange-600">{reports.length}</span>
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FaFileMedicalAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Reports Found</h3>
          <p className="text-gray-500 mt-2">Upload your first lab report to get started</p>
          <button
            onClick={() => window.location.href = '/dashboard/add-report'}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            + Add Report
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FaFileMedicalAlt className="text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Lab Report - {new Date(report.report_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {report.fasting_blood_sugar && (
                      <div>
                        <p className="text-xs text-gray-500">Fasting Sugar</p>
                        <p className="text-sm font-medium">{report.fasting_blood_sugar} mg/dL</p>
                      </div>
                    )}
                    {report.hba1c && (
                      <div>
                        <p className="text-xs text-gray-500">HbA1c</p>
                        <p className="text-sm font-medium">{report.hba1c}%</p>
                      </div>
                    )}
                    {report.ldl_cholesterol && (
                      <div>
                        <p className="text-xs text-gray-500">LDL</p>
                        <p className="text-sm font-medium">{report.ldl_cholesterol} mg/dL</p>
                      </div>
                    )}
                    {report.blood_pressure_systolic && (
                      <div>
                        <p className="text-xs text-gray-500">Blood Pressure</p>
                        <p className="text-sm font-medium">{report.blood_pressure_systolic}/{report.blood_pressure_diastolic} mmHg</p>
                      </div>
                    )}
                    {report.vitamin_d3 && (
                      <div>
                        <p className="text-xs text-gray-500">Vitamin D3</p>
                        <p className="text-sm font-medium">{report.vitamin_d3} ng/mL</p>
                      </div>
                    )}
                    {report.tsh && (
                      <div>
                        <p className="text-xs text-gray-500">TSH</p>
                        <p className="text-sm font-medium">{report.tsh} mIU/L</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex gap-4 text-sm text-gray-500">
                    <span>📊 {getParameterCount(report)} parameters measured</span>
                    {report.lab_name && <span>🏥 Lab: {report.lab_name}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(report)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Details Modal */}
      {showDetails && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Complete Report Details</h2>
              <button onClick={() => setShowDetails(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-4 pb-4 border-b">
                <p className="text-sm text-gray-500">Report Date</p>
                <p className="font-medium text-lg">{new Date(selectedReport.report_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedReport).map(([key, value]) => {
                  if (value && !['id', 'created_at', 'additional_parameters', 'report_date', 'lab_name'].includes(key) && typeof value !== 'object') {
                    // Format the key name for display
                    const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">{displayKey}</p>
                        <p className="font-medium text-gray-900">{value}</p>
                      </div>
                    );
                  }
                  return null;
                })}
                {selectedReport.additional_parameters && Object.entries(selectedReport.additional_parameters).map(([key, val]) => (
                  <div key={key} className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600">{val.display_name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p className="font-medium text-gray-900">{val.value} {val.unit}</p>
                    {val.category && <span className="text-xs text-orange-600 mt-1 inline-block">{val.category}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabReportsList;
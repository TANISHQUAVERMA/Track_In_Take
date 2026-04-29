import React, { useState } from 'react';

const AdditionalParamsDialog = ({ params, onSave, onIgnore, onClose }) => {
    const [selectedParams, setSelectedParams] = useState(
        params.reduce((acc, param) => {
            acc[param.name] = true;
            return acc;
        }, {})
    );
    
    const toggleParameter = (paramName) => {
        setSelectedParams(prev => ({
            ...prev,
            [paramName]: !prev[paramName]
        }));
    };
    
    const handleSave = () => {
        const selectedParamsData = params.filter(p => selectedParams[p.name]);
        onSave(selectedParamsData);
    };
    
    const getCategoryColor = (category) => {
        const colors = {
            'Cardiac': 'bg-red-100 text-red-800',
            'Hormones': 'bg-purple-100 text-purple-800',
            'Minerals': 'bg-blue-100 text-blue-800',
            'Electrolytes': 'bg-green-100 text-green-800',
            'Vitamins': 'bg-yellow-100 text-yellow-800',
            'Iron Studies': 'bg-orange-100 text-orange-800',
            'Liver': 'bg-emerald-100 text-emerald-800',
            'Kidney': 'bg-teal-100 text-teal-800',
            'Inflammation': 'bg-pink-100 text-pink-800',
            'Thyroid': 'bg-indigo-100 text-indigo-800',
            'Cancer Markers': 'bg-gray-100 text-gray-800',
            'Uncategorized': 'bg-gray-100 text-gray-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };
    
    const selectedCount = Object.values(selectedParams).filter(v => v).length;
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
                
                <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="px-6 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-orange-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">
                                    Additional Parameters Detected
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        The following additional parameters were found in your lab report. 
                                        Select which ones you want to save:
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 max-h-96 overflow-y-auto">
                            {params.map((param, index) => (
                                <div key={index} className="flex items-start p-3 mb-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center h-5">
                                        <input
                                            id={`param-${index}`}
                                            type="checkbox"
                                            checked={selectedParams[param.name]}
                                            onChange={() => toggleParameter(param.name)}
                                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <label htmlFor={`param-${index}`} className="font-medium text-gray-700 cursor-pointer">
                                            {param.display_name || param.name}
                                        </label>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {param.value} {param.unit}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(param.category)}`}>
                                                {param.category}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {Math.round(param.confidence * 100)}% confidence
                                            </span>
                                        </div>
                                        {param.reference_range && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                Reference: {param.reference_range}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="px-6 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Save Selected ({selectedCount})
                        </button>
                        <button
                            type="button"
                            onClick={onIgnore}
                            className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Ignore All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdditionalParamsDialog;
import React from "react";
import { useNavigate } from "react-router-dom";

const FatResult = ({ fat, setFat }) => {

//    const NavigateButton = () => {
 

  // Function to get the BFI category based on the fat percentage
  const getBFICategory = () => {
    if (fat < 10) return "UNDERFAT";
    if (fat < 18.5) return "ATHLETIC";
    if (fat < 25.5) return "NORMAL";
    return "OVERFAT";
  };

  // Function to get the BFI description based on the fat percentage
  const getBfiDescription = () => {
    const cat = getBFICategory();
    switch (cat) {
      case "UNDERFAT":
        return "Your body fat is below healthy level.";
      case "ATHLETIC":
        return "You have perfect body fat.";
      case "NORMAL":
        return "Your body fat is in normal range.";
      default:
        return "You have excess body fat.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Your BFI Result</h2>

        <div className="bg-gray-100 rounded-lg py-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-700">{getBFICategory()}</h3>
          <h1 className="text-5xl font-bold text-orange-500">{fat}</h1>
          <p className="text-sm text-gray-600 mt-2">{getBfiDescription()}</p>
        </div>

        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-green-600">&lt; 18.5</span>
          <span className="text-yellow-600">18.5–25.5</span>
          <span className="text-red-600">&gt; 25.5</span>
        </div>
        <div className="h-4 w-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 mb-4"></div>
        <div className="flex justify-between text-xs text-gray-600 mb-6">
          <span>Perfect</span>
          <span>Normal</span>
          <span>Overfat</span>
        </div>

        <p className="text-xs text-gray-500 text-center mb-4">
          Fitelo’s tools & calculator use a combination of scientifically proven methodologies.
          <br />
          <a href="#" className="text-blue-500 underline">Reference Data</a>
        </p>

        <button
          onClick={() => setFat(null)}
          className="w-full bg-orange-500 text-white py-3 rounded-full text-sm font-bold"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default FatResult;
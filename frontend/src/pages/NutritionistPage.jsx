import React from "react";
import { Routes, Route } from "react-router-dom";
import NutritionistDashboard from "../components/components/nutritionist/NutritionistDashboard";
import PatientDetailsPage from "../components/components/nutritionist/PatientDetailsPage";
import Chat from "../components/components/nutritionist/Chat";
import { useState } from "react";
import QuickTools from "../components/components/nutritionist/QuickTools";
import SmartAssistant from "../components/components/nutritionist/SmartAssistant";
import NutritionPopup from "../components/components/nutritionist/NutritionPopup";
import AddAvailability from "../components/components/nutritionist/AddAvailability";




import NutritionSearchLayout from "../components/components/nutritionist/NutritionSearchLayout";

const NutritionistPage = () => {

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
     const [showNutrition, setShowNutrition] = useState(false);

     const handleOpenAssistant = () => setIsAssistantOpen(true);
 // This is the new, correct line
const handleOpenNutritionSearch = () => setShowNutrition(true);
  return (
    <>
    <Routes>
      <Route path="/" element={<NutritionistDashboard />} />
      <Route path="patient/:id" element={<PatientDetailsPage />} />
      <Route path="chat" element={<Chat/>}/>
      <Route path="search" element={<NutritionSearchLayout/>}/>
      <Route path="availability" element={<AddAvailability />} />


    </Routes>
      
     <QuickTools 
        onOpenAssistant={handleOpenAssistant}
        onOpenNutrition={handleOpenNutritionSearch}
      />

       <SmartAssistant
        isVisible={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

       <NutritionPopup
        isVisible={showNutrition}
        onClose={() => setShowNutrition(false)}
      />
     </>
  );
};

export default NutritionistPage;

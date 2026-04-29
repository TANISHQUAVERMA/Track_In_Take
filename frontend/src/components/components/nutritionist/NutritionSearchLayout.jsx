// src/pages/NutritionSearchLayout.jsx

import React from 'react';
import NutriNavbar from './NutriNavbar';
import NutritionSearch from "../../../pages/dashboard/Tools/NutritionSearch"
 
const NutritionSearchLayout = () => {
  return (
    <div>
      {/* Top Navbar */}
     
     
      <div className="sticky top-0 z-40 bg-[var(--color-bg-surface)] shadow-md">
  <NutriNavbar />
</div>

    
      <div className="min-h-screen bg-[var(--color-bg-app)] pt-16 px-4">
        <NutritionSearch />
      </div>
    </div>
  );
};

export default NutritionSearchLayout;

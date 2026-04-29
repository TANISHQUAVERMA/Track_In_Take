import React from "react";
// Assuming you might add icons back later, for example from lucide-react
// import { Flame, ThumbsUp, BookOpen, Repeat } from 'lucide-react';

const Explore = () => {
  return (
    // Main container uses theme's section background and soft shadow
    <div className="w-full bg-section shadow-soft font-['Poppins']">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-custom">
        <h1 className="text-xl font-['Lora'] font-bold text-heading">Explore</h1>
        <div className="flex items-center space-x-4">
          {/* Example of a themed icon link */}
          <div className="flex items-center text-primary font-medium">
            {/* <Flame className="text-xl mr-1" /> Fire Feed */}
          </div>
        </div>
      </div>

      {/* Tab Navigation with theme colors */}
      <div className="flex flex-wrap items-center justify-start px-3 py-3 gap-2 overflow-x-auto border-b border-custom">
        <button className="bg-primary text-light px-4 py-1.5 rounded-full text-sm font-semibold shadow-soft">
          My Feed
        </button>
        <button className="border border-custom text-body px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary hover:text-light transition-colors">
          Liked By Me
        </button>
        <button className="border border-custom text-body px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary hover:text-light transition-colors">
          Recipes
        </button>
        <button className="border border-custom text-body px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary hover:text-light transition-colors">
          Transformation
        </button>
      </div>

      {/* Brand Section - Styled with a warm theme accent */}
      <div className="bg-accent-yellow/20 flex justify-end px-6 py-4">
        <h2 className="text-2xl font-['Lora'] font-bold text-heading"> A Smart Nutrition</h2>
      </div>

      {/* Heading - Styled with a light primary theme accent */}
      <div className="bg-primary/10 text-center py-4">
        <h3 className="text-2xl font-extrabold tracking-wide">
          <span className="text-primary">VITAMIN-</span>
          <span className="text-heading">RICH FOODS</span>
        </h3>
      </div>
    </div>
  );
};

export default Explore;
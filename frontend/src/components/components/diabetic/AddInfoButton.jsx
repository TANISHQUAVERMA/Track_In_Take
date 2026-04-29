import React from "react";
import PropTypes from "prop-types";
import { Plus } from "lucide-react";

const AddInfoButton = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        group
        inline-flex items-center justify-center gap-2
        bg-[var(--color-primary,#FF7043)] text-[var(--color-text-on-primary,#FFFFFF)]
        px-4 py-2 rounded-lg
        font-[var(--font-primary)] font-semibold text-sm
        shadow-lg
        transition-all duration-300 ease-in-out
        transform
        hover:bg-[var(--color-primary-hover,#F4511E)] hover:shadow-xl hover:-translate-y-1
        active:scale-95 active:shadow-md
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#FF7043)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-app,#FFFDF9)]
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      aria-label="Add new health report"
      title="Add new health report"
    >
      <Plus
        size={18}
        className="transition-transform duration-300 ease-in-out group-hover:rotate-90 motion-reduce:transform-none"
      />
      {/* Changed to singular for clarity, as the modal adds one report */}
      <span>Add Report</span>
    </button>
  );
};

AddInfoButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default AddInfoButton;
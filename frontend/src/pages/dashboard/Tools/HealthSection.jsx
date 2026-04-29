// Import React from the react library
import React from 'react'
// Import Dashboard from the components/diabetic folder
import Dashboard from '../../../components/components/diabetic/HealthDashboard'
// Import HealthDashboard from the components/diabetic folder
import HealthDashboard from '../../../components/components/diabetic/HealthDashboard'

// Define a constant called HealthSection which is a functional component
const HealthSection = () => {
  // Return a div with a HealthDashboard component inside
  return (
    <div>
      <HealthDashboard/>
      
    </div>
  )
}

// Export the HealthSection component as the default export of the module
export default HealthSection

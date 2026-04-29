import React, { useState } from "react";
import BookAppointment from "../components/components/appointments/BookAppointment";
import MyAppointments from "../components/components/appointments/MyAppointments";


const AppointmentPage = () => {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <BookAppointment onBooked={() => setRefresh(!refresh)} />
      <MyAppointments refresh={refresh} />
    </div>
  );
};

export default AppointmentPage;


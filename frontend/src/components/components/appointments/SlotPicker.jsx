const SlotPicker = ({ slots, onBook, loading }) => {
  if (!Array.isArray(slots) || slots.length === 0) {
    return (
      <p className="text-gray-500 text-sm mt-3">
        No available slots for this date
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {slots.map((slot) => (
        <button
          key={slot.id}
          disabled={loading}
          onClick={() => onBook(slot.id)}
          className="border p-2 rounded hover:bg-green-100 disabled:opacity-50"
        >
          {slot.start_time} – {slot.end_time}
        </button>
      ))}
    </div>
  );
};

export default SlotPicker;

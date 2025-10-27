<input
  type="date"
  value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
  onChange={(e) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value + 'T00:00:00'));
    } else {
      setSelectedDate(undefined);
    }
  }}
  className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
  max={new Date().toISOString().split('T')[0]}
/>

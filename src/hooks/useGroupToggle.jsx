import React from "react";

function useGroupToggle(initialCount, storageKey = "groupToggleState") {
  const [openStates, setOpenStates] = React.useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  // Save to localStorage whenever state changes
  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(openStates));
  }, [openStates, storageKey]);
  const toggleGroup = (index) => {
    setOpenStates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  const openGroups = Array(initialCount).fill(false).map((_, i) =>
    !!openStates[i]
  );

  return { openGroups, toggleGroup };
}

export default useGroupToggle;

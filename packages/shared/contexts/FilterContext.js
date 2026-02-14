import { createContext, useContext, useState } from 'react';

const FilterContext = createContext({
  typeFilters: [],
  setTypeFilters: () => {}
});

export function FilterProvider({ children }) {
  const [typeFilters, setTypeFilters] = useState([]);
  return (
    <FilterContext.Provider value={{ typeFilters, setTypeFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  return useContext(FilterContext);
}

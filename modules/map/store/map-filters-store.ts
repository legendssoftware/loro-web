import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FilterType =
	| 'all'
	| 'check-in'
	| 'check-in-visit'
	| 'shift-start'
	| 'shift-end'
	| 'lead'
	| 'journal'
	| 'task'
	| 'break-start'
	| 'break-end'
	| 'client'
	| 'competitor'
	| 'quotation';

interface MapFiltersState {
	activeFilter: FilterType;
	setActiveFilter: (filter: FilterType) => void;
	activeDropdown: string | null;
	setActiveDropdown: (dropdown: string | null) => void;
}

export const useMapFiltersStore = create<MapFiltersState>()(
	persist(
		(set) => ({
			activeFilter: 'all',
			setActiveFilter: (filter) => set({ activeFilter: filter }),
			activeDropdown: null,
			setActiveDropdown: (dropdown) => set({ activeDropdown: dropdown }),
		}),
		{
			name: 'map-filters-storage',
		}
	)
);


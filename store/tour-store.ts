import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TourState {
    isTourActive: boolean;
    hasSeenTour: boolean;
    pausedAt: number | null;
    currentStep: number;
}

interface TourActions {
    startTour: () => void;
    stopTour: (stepIndex: number) => void;
    resumeTour: () => void;
    endTour: () => void;
    restartTour: () => void;
    setCurrentStep: (step: number) => void;
}

const initialState: TourState = {
    isTourActive: false,
    hasSeenTour: false,
    pausedAt: null,
    currentStep: 0,
};

export const useTourStore = create<TourState & TourActions>()(
    persist(
        (set) => ({
            ...initialState,

            startTour: () => {
                set({
                    isTourActive: true,
                    currentStep: 0,
                    pausedAt: null,
                });
            },

            stopTour: (stepIndex: number) => {
                set({
                    isTourActive: false,
                    pausedAt: stepIndex,
                });
            },

            resumeTour: () => {
                set((state) => ({
                    isTourActive: true,
                    currentStep: state.pausedAt || 0,
                    pausedAt: null,
                }));
            },

            endTour: () => {
                set({
                    isTourActive: false,
                    hasSeenTour: true,
                    pausedAt: null,
                });
            },

            restartTour: () => {
                set({
                    isTourActive: true,
                    currentStep: 0,
                    pausedAt: null,
                });
            },

            setCurrentStep: (step: number) => {
                set({
                    currentStep: step,
                });
            },
        }),
        {
            name: 'loro-tour-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Selectors
export const selectIsTourActive = (state: TourState) => state.isTourActive;
export const selectHasSeenTour = (state: TourState) => state.hasSeenTour;
export const selectPausedAt = (state: TourState) => state.pausedAt;
export const selectCurrentStep = (state: TourState) => state.currentStep;

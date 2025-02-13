"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useSessionStore } from "@/store/use-session-store";
import toast, { Toast } from "react-hot-toast";

interface LicenseContextType {
  isLicenseValid: boolean;
  licenseStatus: string | undefined;
  licensePlan: string | undefined;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const { profileData } = useSessionStore();

  useEffect(() => {
    if (profileData?.licenseInfo) {
      const { status } = profileData.licenseInfo;
      const hasShownNotification = localStorage.getItem('licenseNotificationShown');

      if (status === "active" && !hasShownNotification) {
        toast.custom(
          (t: Toast) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-1 ml-3">
                    <p className="text-sm font-normal text-gray-900 uppercase font-body">
                      License Warning
                    </p>
                    <p className="mt-1 text-xs text-gray-500 uppercase font-body">
                      Your license is currently {status.toLowerCase()}. Some
                      features may be restricted. Please contact support to
                      resolve this issue if you are unsure what this means.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="flex items-center justify-center w-full p-4 text-sm font-normal text-red-600 uppercase border border-transparent rounded-none rounded-r-lg font-body hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          {
            duration: 15000,
            position: "bottom-center",
          }
        );
        localStorage.setItem('licenseNotificationShown', 'true');
      }
    }
  }, [profileData]);

  const contextValue = {
    isLicenseValid: profileData?.licenseInfo?.status === "active",
    licenseStatus: profileData?.licenseInfo?.status,
    licensePlan: profileData?.licenseInfo?.plan,
  };

  return (
    <LicenseContext.Provider value={contextValue}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);

  if (context === undefined) {
    throw new Error("useLicense must be used within a LicenseProvider");
  }

  return context;
}

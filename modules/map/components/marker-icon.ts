import L from 'leaflet';
import { MarkerType } from '@/lib/data';

// Helper function to get client marker color based on client properties
const getClientMarkerColor = (clientData?: any): string => {
    if (!clientData) return '#06b6d4'; // default cyan

    // Color based on client status
    if (clientData.status === 'active') return '#06b6d4'; // cyan for active
    if (clientData.status === 'inactive') return '#94a3b8'; // slate for inactive
    if (clientData.status === 'potential') return '#22d3ee'; // cyan lighter for potential

    // Alternative: Color based on price tier
    if (clientData.priceTier === 'premium') return '#3b82f6'; // blue for premium
    if (clientData.priceTier === 'standard') return '#06b6d4'; // cyan for standard
    if (clientData.priceTier === 'basic') return '#0891b2'; // darker cyan for basic

    return '#06b6d4'; // default cyan
};

// Create custom marker icons with relevant icons for each type
export const createCustomIcon = (type: MarkerType, isHighlighted = false, markerData?: any) => {
    let color: string, iconSvg: string;

    switch (type) {
        case 'check-in':
            color = '#3b82f6'; // blue
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>`;
            break;
        case 'shift-start':
            color = '#10b981'; // green
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>`;
            break;
        case 'shift-end':
            color = '#ef4444'; // red
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <rect x="9" y="9" width="6" height="6" rx="1"></rect>
      </svg>`;
            break;
        case 'lead':
            color = '#f97316'; // orange
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>`;
            break;
        case 'journal':
            color = '#8b5cf6'; // purple
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <path d="M14 2v6h6"></path>
        <path d="M16 13H8"></path>
        <path d="M16 17H8"></path>
        <path d="M10 9H8"></path>
      </svg>`;
            break;
        case 'task':
            color = '#ec4899'; // pink
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
        <path d="m9 12 2 2 4-4"></path>
      </svg>`;
            break;
        case 'break-start':
        case 'break-end':
            color = '#f59e0b'; // amber
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
        <line x1="6" x2="6" y1="2" y2="4"></line>
        <line x1="10" x2="10" y1="2" y2="4"></line>
        <line x1="14" x2="14" y1="2" y2="4"></line>
      </svg>`;
            break;
        case 'client':
            color = getClientMarkerColor(markerData); // Dynamic color based on client properties
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18"></path>
        <path d="M5 21V7l8-4v18"></path>
        <path d="M19 21V11l-6-4"></path>
        <path d="M9 9h1"></path>
        <path d="M9 12h1"></path>
        <path d="M9 15h1"></path>
        <path d="M9 18h1"></path>
      </svg>`;
            break;
        case 'competitor':
            color = '#ef4444'; // red
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
      </svg>`;
            break;
        case 'quotation':
            color = '#22c55e'; // green
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" x2="12" y1="15" y2="3"></line>
      </svg>`;
            break;
        default:
            color = '#6b7280'; // gray for fallback
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="m15 9-6 6"></path>
        <path d="m9 9 6 6"></path>
      </svg>`;
    }

    // Highlight selected marker with a larger size and brighter color
    const size = isHighlighted ? 42 : 34; // Slightly larger for better visibility
    const borderWidth = isHighlighted ? 3 : 2;
    const borderColor = 'white';

    // Keep the same color but make it slightly brighter when highlighted
    const highlightedColor = isHighlighted
        ? color.replace(/^#/, '') // Remove leading #
              .match(/.{2}/g) // Split into RGB pairs
              ?.map((hex) => Math.min(parseInt(hex, 16) + 30, 255).toString(16).padStart(2, '0')) // Lighten more
              .join('') || color // Fallback to original color
        : color;

    const html = `
      <div style="
        background-color: ${highlightedColor};
        width: ${size}px;
        height: ${size}px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        border: ${borderWidth}px solid ${borderColor};
        box-shadow: ${isHighlighted ? '0 3px 8px rgba(0,0,0,0.5)' : '0 2px 5px rgba(0,0,0,0.3)'};
      ">
        ${iconSvg}
      </div>
    `;

    return L.divIcon({
        html: html,
        className: 'custom-marker-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

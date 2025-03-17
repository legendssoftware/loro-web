import L from 'leaflet';
import { MarkerType } from '@/lib/data';

// Create custom marker icons with relevant icons for each type
export const createCustomIcon = (type: MarkerType, isHighlighted = false) => {
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
            color = '#ef4444'; // red
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
        <line x1="9" y1="9" x2="10" y2="9"></line>
        <line x1="9" y1="13" x2="15" y2="13"></line>
        <line x1="9" y1="17" x2="15" y2="17"></line>
      </svg>`;
            break;
        case 'task':
            color = '#8b5cf6'; // purple
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"></rect>
        <path d="M3 9h18"></path>
        <path d="M9 21V9"></path>
      </svg>`;
            break;
        default:
            color = '#6b7280'; // gray
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
      </svg>`;
    }

    // Increase size and add glow effect if highlighted
    const size = isHighlighted ? 50 : 40;
    const glowEffect = isHighlighted
        ? `box-shadow: 0 0 0 4px rgba(255,255,255,0.7), 0 0 15px rgba(0,0,0,0.3);`
        : `box-shadow: 0 2px 5px rgba(0,0,0,0.2);`;
    const scale = isHighlighted ? `transform: scale(1.1);` : '';

    return L.divIcon({
        className: 'custom-icon',
        html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        ${glowEffect}
        ${scale}
        transition: all 0.3s ease;
      ">
        ${iconSvg}
      </div>
      <div style="
        width: 2px;
        height: 10px;
        background-color: ${color};
        margin: 0 auto;
      "></div>
    `,
        iconSize: [size, size + 10],
        iconAnchor: [size / 2, size + 10],
        popupAnchor: [0, -(size + 10)],
    });
};

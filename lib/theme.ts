// Color palette for Havanah - Ethereal Light Theme with Liquid Glass
export const colors = {
  // Primary - Light/White backgrounds
  primary: {
    light: '#FFFFFF',
    lighter: '#F9FAFB',
    lightest: '#F3F4F6',
  },

  // Brand colors - Green and Yellow accents
  brand: {
    green: '#10B981', // Emerald green
    greenLight: '#D1FAE5',
    greenDark: '#065F46',
    yellow: '#FBBF24', // Amber yellow
    yellowLight: '#FEF3C7',
    yellowDark: '#92400E',
  },

  // Neutral grays (very subtle for ethereal feel)
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Glass effects
  glass: {
    light: 'rgba(255, 255, 255, 0.7)',
    lighter: 'rgba(255, 255, 255, 0.5)',
    darkMuted: 'rgba(17, 24, 39, 0.05)',
  },

  // Status colors (minimal, still light theme)
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glass: 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.5)',
};

export const transitions = {
  fast: 'all 0.2s ease-in-out',
  normal: 'all 0.3s ease-in-out',
  slow: 'all 0.5s ease-in-out',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
};
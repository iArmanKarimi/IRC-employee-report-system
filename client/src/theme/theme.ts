import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
	palette: {
		primary: {
			main: '#1e40af', // Blue
			light: '#3b82f6',
			dark: '#1e3a8a',
		},
		secondary: {
			main: '#10b981', // Green
			light: '#34d399',
			dark: '#059669',
		},
		error: {
			main: '#dc2626',
			light: '#ef4444',
			dark: '#b91c1c',
		},
		background: {
			default: '#f9fafb',
			paper: '#ffffff',
		},
		text: {
			primary: '#1f2937',
			secondary: '#6b7280',
		},
	},
	typography: {
		fontFamily: [
			'-apple-system',
			'BlinkMacSystemFont',
			'"Segoe UI"',
			'Roboto',
			'"Helvetica Neue"',
			'Arial',
			'sans-serif',
		].join(','),
		h1: {
			fontSize: '2rem',
			fontWeight: 600,
		},
		h2: {
			fontSize: '1.5rem',
			fontWeight: 600,
		},
		h3: {
			fontSize: '1.25rem',
			fontWeight: 600,
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					borderRadius: '0.375rem',
					fontWeight: 500,
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: '0.5rem',
				},
			},
		},
		MuiTextField: {
			defaultProps: {
				variant: 'outlined',
				size: 'medium',
			},
		},
	},
});

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
	direction: 'rtl',
	palette: {
		primary: {
			main: '#2c3e50', // Professional dark blue-grey
			light: '#506277',
			dark: '#1a252f',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#546e7a', // Muted slate blue
			light: '#78909c',
			dark: '#37474f',
			contrastText: '#ffffff',
		},
		error: {
			main: '#c62828',
			light: '#ef5350',
			dark: '#b71c1c',
		},
		warning: {
			main: '#f57c00',
			light: '#ff9800',
			dark: '#e65100',
		},
		info: {
			main: '#0277bd',
			light: '#039be5',
			dark: '#01579b',
		},
		success: {
			main: '#2e7d32',
			light: '#4caf50',
			dark: '#1b5e20',
		},
		background: {
			default: '#f5f7fa',
			paper: '#ffffff',
		},
		text: {
			primary: '#2c3e50',
			secondary: '#546e7a',
			disabled: '#90a4ae',
		},
		divider: '#cfd8dc',
	},
	spacing: 8,
	typography: {
		fontFamily: [
			'"Inter"',
			'-apple-system',
			'BlinkMacSystemFont',
			'"Segoe UI"',
			'Roboto',
			'"Helvetica Neue"',
			'Arial',
			'sans-serif',
		].join(','),
		fontSize: 14,
		h1: {
			fontSize: '2.25rem',
			fontWeight: 600,
			lineHeight: 1.3,
			letterSpacing: '-0.02em',
			color: '#2c3e50',
			marginBottom: '1.5rem',
		},
		h2: {
			fontSize: '1.75rem',
			fontWeight: 600,
			lineHeight: 1.35,
			letterSpacing: '-0.01em',
			color: '#2c3e50',
			marginBottom: '1.25rem',
			marginTop: '0.5rem',
		},
		h3: {
			fontSize: '1.5rem',
			fontWeight: 600,
			lineHeight: 1.4,
			color: '#2c3e50',
			marginBottom: '1rem',
			marginTop: '0.5rem',
		},
		h4: {
			fontSize: '1.25rem',
			fontWeight: 600,
			lineHeight: 1.4,
			color: '#2c3e50',
			marginBottom: '0.875rem',
			marginTop: '0.5rem',
		},
		h5: {
			fontSize: '1.125rem',
			fontWeight: 600,
			lineHeight: 1.4,
			color: '#2c3e50',
			marginBottom: '0.75rem',
		},
		h6: {
			fontSize: '1rem',
			fontWeight: 600,
			lineHeight: 1.5,
			color: '#2c3e50',
			marginBottom: '0.75rem',
		},
		body1: {
			fontSize: '0.9375rem',
			lineHeight: 1.6,
			letterSpacing: '0.01em',
		},
		body2: {
			fontSize: '0.875rem',
			lineHeight: 1.6,
			letterSpacing: '0.01em',
		},
		button: {
			fontSize: '0.9375rem',
			fontWeight: 500,
			letterSpacing: '0.02em',
			textTransform: 'none',
		},
		caption: {
			fontSize: '0.75rem',
			lineHeight: 1.5,
			letterSpacing: '0.03em',
			color: '#546e7a',
		},
		overline: {
			fontSize: '0.75rem',
			fontWeight: 600,
			lineHeight: 2,
			letterSpacing: '0.08em',
			textTransform: 'uppercase',
			color: '#546e7a',
		},
	},
	shape: {
		borderRadius: 6,
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					borderRadius: 6,
					fontWeight: 500,
					padding: '8px 16px',
					boxShadow: 'none',
					'&:hover': {
						boxShadow: 'none',
					},
				},
				contained: {
					'&:hover': {
						boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
					},
				},
				sizeLarge: {
					padding: '12px 24px',
					fontSize: '1rem',
				},
				sizeSmall: {
					padding: '6px 12px',
					fontSize: '0.8125rem',
				},
			},
			defaultProps: {
				disableElevation: true,
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
					border: '1px solid #e0e0e0',
				},
			},
		},
		MuiCardContent: {
			styleOverrides: {
				root: {
					padding: '24px',
					'&:last-child': {
						paddingBottom: '24px',
					},
				},
			},
		},
		MuiFormControlLabel: {
			styleOverrides: {
				root: {
					marginRight: '24px',
					marginBottom: '8px',
				},
			},
		},
		MuiFormControl: {
			styleOverrides: {
				root: {
					marginBottom: '8px',
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					marginBottom: '8px',
					'& .MuiOutlinedInput-root': {
						backgroundColor: '#ffffff',
						'& fieldset': {
							borderColor: '#cfd8dc',
						},
						'&:hover fieldset': {
							borderColor: '#90a4ae',
						},
						'&.Mui-focused fieldset': {
							borderWidth: '2px',
						},
					},
				},
			},
			defaultProps: {
				variant: 'outlined',
				size: 'medium',
				fullWidth: true,
			},
		},
		MuiTableContainer: {
			styleOverrides: {
				root: {
					boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
					borderRadius: 8,
					border: '1px solid #e0e0e0',
				},
			},
		},
		MuiTable: {
			styleOverrides: {
				root: {
					borderCollapse: 'separate',
				},
			},
		},
		MuiTableHead: {
			styleOverrides: {
				root: {
					backgroundColor: '#f5f7fa',
					'& .MuiTableCell-head': {
						fontWeight: 600,
						fontSize: '0.875rem',
						letterSpacing: '0.02em',
						textTransform: 'uppercase',
						color: '#546e7a',
						padding: '16px',
					},
				},
			},
		},
		MuiTableBody: {
			styleOverrides: {
				root: {
					'& .MuiTableRow-root': {
						'&:hover': {
							backgroundColor: '#f9fafb',
						},
						'&:last-child td': {
							borderBottom: 0,
						},
					},
				},
			},
		},
		MuiTableCell: {
			styleOverrides: {
				root: {
					padding: '16px',
					borderBottom: '1px solid #eceff1',
				},
				body: {
					fontSize: '0.9375rem',
					color: '#2c3e50',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
				},
				elevation1: {
					boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
				},
				elevation2: {
					boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 2px 3px rgba(0,0,0,0.06)',
				},
				elevation3: {
					boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
					borderBottom: '1px solid #e0e0e0',
				},
			},
			defaultProps: {
				elevation: 0,
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					fontWeight: 500,
					fontSize: '0.8125rem',
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					fontSize: '0.9375rem',
					fontWeight: 500,
					color: '#546e7a',
					'&.Mui-focused': {
						color: '#2c3e50',
					},
				},
			},
		},
		MuiFormHelperText: {
			styleOverrides: {
				root: {
					fontSize: '0.8125rem',
					marginTop: 6,
				},
			},
		},
		MuiSelect: {
			styleOverrides: {
				select: {
					backgroundColor: '#ffffff',
				},
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					borderColor: '#cfd8dc',
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					borderRadius: 6,
					fontSize: '0.9375rem',
				},
				standardSuccess: {
					backgroundColor: '#e8f5e9',
					color: '#2e7d32',
				},
				standardError: {
					backgroundColor: '#ffebee',
					color: '#c62828',
				},
				standardWarning: {
					backgroundColor: '#fff3e0',
					color: '#f57c00',
				},
				standardInfo: {
					backgroundColor: '#e3f2fd',
					color: '#0277bd',
				},
			},
		},
		MuiAccordion: {
			styleOverrides: {
				root: {
					border: '1px solid #e0e0e0',
					boxShadow: 'none',
					'&:before': {
						display: 'none',
					},
					'&.Mui-expanded': {
						margin: 0,
					},
				},
			},
		},
		MuiAccordionSummary: {
			styleOverrides: {
				root: {
					minHeight: 56,
					'&.Mui-expanded': {
						minHeight: 56,
					},
				},
				content: {
					'&.Mui-expanded': {
						margin: '12px 0',
					},
				},
			},
		},
	},
});

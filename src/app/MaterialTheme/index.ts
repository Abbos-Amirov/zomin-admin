import { createTheme } from '@mui/material/styles';
import { common } from '@mui/material/colors';
import typography from './typography';

/**
 * LIGHT THEME
 */
const lightPalette = {
	mode: 'light' as const,
	background: {
		default: '#f8f8ff',
		paper: common.white,
	},
	primary: {
		contrastText: '#d7b586',
		main: '#343434',
	},
	secondary: {
		contrastText: '#343434',
		main: '#d7b586',
	},
	text: {
		primary: '#343434',
		secondary: '#5c5c5c',
	},
};

/**
 * DARK THEME — premium restaurant (qora/oltin)
 */
const darkPalette = {
	mode: 'dark' as const,
	background: {
		default: '#0d0b09',
		paper: '#1d1814',
	},
	primary: {
		contrastText: '#0d0b09',
		main: '#d4af37',
		light: '#e8cc7a',
		dark: '#a9842a',
	},
	secondary: {
		contrastText: '#f3ead9',
		main: '#8c1f2b',
		light: '#b53041',
		dark: '#5e141d',
	},
	text: {
		primary: '#f3ead9',
		secondary: '#c7b89c',
	},
	divider: 'rgba(212, 175, 92, 0.18)',
};

const getTheme = (darkMode: boolean) => {
	const palette = darkMode ? darkPalette : lightPalette;
	let theme = createTheme({
		palette,
		typography,
		components: {
			MuiContainer: {
				styleOverrides: {
					root: {
						height: '100%',
					},
				},
			},
			MuiCssBaseline: {
				styleOverrides: {
					html: { height: '100%' },
					body: {
						height: '100%',
						minHeight: '100%',
						backgroundColor: darkMode ? '#0d0b09' : '#f4f6f8',
						color: darkMode ? '#f3ead9' : '#343434',
					},
				},
			},
			MuiPaper: {
				styleOverrides: {
					root: darkMode
						? {
								backgroundImage: 'none',
								border: '1px solid rgba(212, 175, 92, 0.14)',
						  }
						: {},
				},
			},
			MuiButton: {
				styleOverrides: {
					root: {
						borderRadius: 10,
						textTransform: 'none' as const,
						fontWeight: 600,
					},
				},
			},
		},
	});
	theme = createTheme(theme, {
		components: {
			MuiContainer: {
				styleOverrides: {
					maxWidthLg: {
						[theme.breakpoints.up('lg')]: {
							maxWidth: '1300px',
						},
					},
				},
			},
		},
	});
	return theme;
};

export default getTheme;

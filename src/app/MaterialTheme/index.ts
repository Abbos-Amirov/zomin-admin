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
 * DARK THEME
 */
const darkPalette = {
	mode: 'dark' as const,
	background: {
		default: '#121212',
		paper: '#1e1e1e',
	},
	primary: {
		contrastText: '#d7b586',
		main: '#d7b586',
	},
	secondary: {
		contrastText: '#121212',
		main: '#d7b586',
	},
	text: {
		primary: '#ffffff',
		secondary: '#b0b0b0',
	},
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
						backgroundColor: darkMode ? '#121212' : '#f4f6f8',
						color: darkMode ? '#ffffff' : '#343434',
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

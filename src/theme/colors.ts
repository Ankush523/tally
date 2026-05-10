/**
 * Tally — neo-brutalist light + **slate vault** dark.
 *
 * Dark brutal accents mirror light (ink borders + black shadow slab) with **moon frost**:
 * soft blue-whites — visible on the canvas, never paper-white glare.
 */

export const Colors = {
  light: {
    scheme: 'light' as const,
    inkViolet: '#FF4B4B',
    groveGreen: '#0F9D58',
    ember: '#D62828',
    graphite: '#0D0D0D',
    parchment: '#F2F2F2',
    violet50: '#E8E8E8',
    green50: '#C8F7D8',
    amber50: '#FFE78F',
    gray100: '#D9D9D9',
    heat0: '#EBEBEB',
    heat1: '#C4E870',
    heat2: '#89C550',
    heat3: '#4A8F3C',
    heat4: '#1E3D22',
    textPrimary: '#000000',
    textSecondary: '#1F1F1F',
    textMuted: '#525252',
    surfaceSecondary: '#E8E8E8',
    border: '#000000',
    tabInactive: '#5C5C5C',
    energyDeep: '#000000',
    energyQuick: '#FF4B4B',
    energyLow: '#737373',
    missedTint: '#FFD6D6',
    sheetSurface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    overlayScrim: 'rgba(0, 0, 0, 0.55)',
    onPrimary: '#FFFFFF',
    primaryMuted: 'rgba(255, 75, 75, 0.18)',
    shadowAccent: '#000000',
    brutalShadow: '#000000',
    cardRim: '#000000',
  },
  dark: {
    scheme: 'dark' as const,
    inkViolet: '#FF9497',
    groveGreen: '#72F0B4',
    ember: '#FFB89A',
    /** Canvas — blue-black, not flat neutral gray */
    graphite: '#070910',
    parchment: '#F2F2F2',
    violet50: '#242938',
    green50: '#132822',
    amber50: '#2B2218',
    gray100: '#363D4D',
    heat0: '#252B38',
    heat1: '#4F663E',
    heat2: '#6FAE52',
    heat3: '#92D278',
    heat4: '#E2F4D4',
    textPrimary: '#F6F7FB',
    textSecondary: '#C8CDDA',
    textMuted: '#939BB0',
    surfaceSecondary: '#10141C',
    /** Solid inverse brutal stroke (light uses `#000`) — matte frost, readable at 2–3px */
    border: '#F6F7FB',
    tabInactive: '#949BB3',
    energyDeep: '#E8ECF6',
    energyQuick: '#FF9497',
    energyLow: '#AEB6CC',
    missedTint: '#422C32',
    /** Sheets / chrome — black panel fill */
    sheetSurface: '#000000',
    /** Cards / boxed panels — black interior */
    surfaceRaised: '#000000',
    overlayScrim: 'rgba(2, 4, 12, 0.88)',
    onPrimary: '#070910',
    primaryMuted: 'rgba(255, 148, 151, 0.28)',
    shadowAccent: '#848BA3',
    /**
     * Offset slab — desaturated moon white (lighter than canvas & card), inverse of light `#000`.
     */
    brutalShadow: 'rgba(255, 255, 255, 0.82)',
    /** Slightly brighter rim than `border` for nested / subtle frames */
    cardRim: '#F6F7FB',
  },
} as const;

export type ColorSchemeName = keyof typeof Colors;
export type ThemeColors = (typeof Colors)['light'] | (typeof Colors)['dark'];

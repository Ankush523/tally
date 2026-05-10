/**
 * Tally — neo-brutalist light + **slate vault** dark.
 *
 * Dark brutal accents mirror light (ink borders + black shadow slab) with **moon frost**:
 * soft blue-whites — visible on the canvas, never paper-white glare.
 *
 * **Dark accent lane (red / coral)** — Light keeps brick + paper contrast (`ember` vs parchment).
 * On vault-black sheets, pastel coral sinks into moon-frost neutrals, so dark mode uses a
 * **molten flare** palette: higher chroma, higher luminance corals and a rose-ink wash for
 * missed rows — one disciplined hue family, utility-first, readable on `#000` / `#070910`.
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
    /** Day score card lift — warm paper */
    scoreCardTint: '#FBF9F4',
    habitDoneSurface: '#E1F5EE',
    habitSkippedSurface: '#FAEEDA',
    /** Greeting line — higher contrast than metadata gray */
    greetingStrong: '#1C1B1F',
  },
  dark: {
    scheme: 'dark' as const,
    /** Brand / primary actions — hot coral, not dusty pink; pops on vault black */
    inkViolet: '#FF4F55',
    groveGreen: '#72F0B4',
    /** Alerts, missed streaks, errors — scarlet-coral, clearly louder than muted text */
    ember: '#FF6B66',
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
    energyQuick: '#FF4F55',
    energyLow: '#AEB6CC',
    /** Missed row wash — deep rose ink (chromatic, not brown-gray) */
    missedTint: '#301018',
    /** Sheets / chrome — black panel fill */
    sheetSurface: '#000000',
    /** Cards / boxed panels — black interior */
    surfaceRaised: '#000000',
    overlayScrim: 'rgba(2, 4, 12, 0.88)',
    onPrimary: '#070910',
    primaryMuted: 'rgba(255, 79, 85, 0.38)',
    shadowAccent: '#848BA3',
    /**
     * Offset slab — desaturated moon white (lighter than canvas & card), inverse of light `#000`.
     */
    brutalShadow: 'rgba(255, 255, 255, 0.82)',
    /** Slightly brighter rim than `border` for nested / subtle frames */
    cardRim: '#F6F7FB',
    scoreCardTint: '#141920',
    habitDoneSurface: '#152820',
    habitSkippedSurface: '#2A2218',
    greetingStrong: '#E8ECF6',
  },
} as const;

export type ColorSchemeName = keyof typeof Colors;
export type ThemeColors = (typeof Colors)['light'] | (typeof Colors)['dark'];

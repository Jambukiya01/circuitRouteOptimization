// import Config from 'react-native-config';

const commanColors = {
  bordercolor: '#F8F9FC',

  ///Driver Color
  Whitetransparent84: 'rgba(255, 255, 255, 0.84)',
  Whitetransparent12: 'rgba(255, 255, 255, 0.12)',
  Whitetransparent50: 'rgba(255, 255, 255, 0.50)',
  Blacktransparent20: 'rgba(0, 0, 0, 0.20)',
  Blacktransparent8: 'rgba(0, 0, 0, 0.08)',
  Blacktransparent16: 'rgba(0, 0, 0, 0.16)',

  //Black Color
  // BlackColor900: '#212121', //palette.text.primary
  // BlackColor800: '#424242', //Icon color
  BlackColor600: '#757575', //palette.text.secondary // palette.action.active
  BlackColor400: '#BDBDBD', //palette.action.disabled
  BlackColor300: '#E0E0E0', //palette.divider // palette.action.disabledBG
  BlackColor50: '#FAFAFA', //palette.background.default

  //Red Color
  RedColor600: '#D93B3C',
  RedColor500: '#E8453E',
  RedColor100: '#FACDD2',

  //FLM Color
  backgroundMainColor: '#E5E5E5',

  //Secondary Color
  SecondaryColor700: '#2A1CB6',
  SecondaryColor500: '#4F39FD',
  SecondaryColor300: '#9888FE',

  //Primary Color
  PrimaryColor800: '#860965',
  PrimaryColor700: '#3D7BF7',
  PrimaryColor500: '#E71F77',
  PrimaryColor300: '#F87795',

  //Gray
  Gray900: '#141414',
  Gray800: '#1F1F1F',
  Gray700: '#333333',
  Gray600: '#545454',
  Gray500: '#757575',
  Gray400: '#8696A9',
  Gray300: '#E0E0E0',
  Gray200: '#E2E2E2',
  Gray100: '#EEEEEE',
  Gray50: '#F6F6F6',
  GullGrey: "#9FA8C4 ",

  //Secondary
  SecondaryRed: '#D44333',
  SecondaryOrange: '#ED6E33',
  SecondaryYellow: '#FFC043',

  SecondaryPurple: '#7356BF',
  SecondaryBrown: '#99644C',

  //Red
  Red900: '#7A0049',
  Red800: '#920049',
  Red700: '#B6004B',
  Red600: '#DB0045',
  Red500: '#FF0038',
  Red400: '#FF3F58',
  Red300: '#FF6669',
  Red200: '#FE9F99',
  Red100: '#FFD4CD',
  Red50: '#FFEAE6',

  //Green

  Green500: '#27A841',
  Green300: '#7BE47D',

  //Blue
  Blue900: '#022577',
  Blue800: '#043592',
  Blue700: '#084BB4',
  Blue600: '#0B64D8',
  Blue500: '#1183FD',
  Blue400: '#4BAAFC',
  Blue300: '#70C2FE',
  Blue200: '#9FDBFF',
  Blue100: '#7FB8F9',
  Blue50: '#E5F7FD',

  //////////////////////Taxi Dispatcher
  Defaultwhite: '#FFFFFF', //White
  Defaultblack: '#000000', //White

  BlackColor100: '#F2F4F6', //palette.divider- Big // palette.action.hover
  BlackColor200: '#E6EAED', //palette.divider- light // palette.action.selected
  BlackColor700: '#3F444D',
  BlackColor500: '#5F6C85',
  TextColor: '#5F6C85',
  SecondaryGreen: '#3DB24B',
  SecondaryBlue: '#0071F4',
  BlackColor900: '#3F444D', //palette.text.primary
  ButtonColor: '#3F444D',
  BlackColor800: '#3D5775',

  TrackTrueColor: '#314170',
  TrackFalseColor: '#686a6e',
  TrackThumbColor: '#638cff',

  btnDisableColor: 'rgba(61, 178, 75, 0.25)',
  yelowColor: '#FFE07F',

  bottomStepOverlayColor: '#00000050',
  kioskSplashTextColor: '#FFFFFF',
  seconadarycolor: '#F5A700',
  borderbottomcolor: '#E1E6F3',
  lightgraypick: '#94A0B8',
  BlueColor: "#1183FD"
};

// Theme-aware color functions
const themeColors = {
  Background: (isDark: boolean) => isDark ? '#191c22' : '#FFFFFF',
  BackgroundSecondary: (isDark: boolean) => isDark ? '#2f323c' : '#F2F4F6',
  Surface: (isDark: boolean) => isDark ? '#1C1C1E' : '#F2F2F7',
  Text: (isDark: boolean) => isDark ? '#f7f8f9' : '#3F444D',
  TextSecondary: (isDark: boolean) => isDark ? '#979aa0' : '#6C757D',
  Border: (isDark: boolean) => isDark ? '#38383A' : '#E6EAED',
  Card: (isDark: boolean) => isDark ? '#1C1C1E' : '#FFFFFF',
  Input: (isDark: boolean) => isDark ? '#2C2C2E' : '#F2F2F7',
  InputText: (isDark: boolean) => isDark ? '#FFFFFF' : '#000000',
  Placeholder: (isDark: boolean) => isDark ? '#8E8E93' : '#C7C7CC',
  TabBar: (isDark: boolean) => isDark ? '#1C1C1E' : '#F2F2F7',
  TabBarActive: (isDark: boolean) => isDark ? '#FFFFFF' : '#000000',
  TabBarInactive: (isDark: boolean) => isDark ? '#8E8E93' : '#8E8E93',
  TrackTrueColor: (isDark: boolean) => isDark ? '#314170' : '#d1defe',
  TrackFalseColor: (isDark: boolean) => isDark ? '#686a6e' : '#c5c5c5',
  TrackThumbTrueColor: (isDark: boolean) => isDark ? '#638cff' : '#4b76f7',
  TrackThumbFalseColor: (isDark: boolean) => isDark ? '#c1c1c1' : '#efefef',
  GradientStartColor: (isDark: boolean) => isDark ? '#191c22' : '#F6F7FB',
  GradientEndColor: (isDark: boolean) => isDark ? '#253152' : '#E5F7FD',
};

interface ColorInterface {
  [name: string]: any;
}

const companyColors: ColorInterface = {
  YelowSoft_1: {
    ...commanColors,
    ...themeColors,
    // PrimaryColor700: '#273C60',
    PrimaryColor500: '#273C60',
    SecondaryColor700: '#FFA700',
    PrimaryColor500With10: '#273C6025',
    SecondaryColor500With10: '#FFA70065',
    splashBg: '#273C60',
  },
  YelowSoft_663: {
    ...commanColors,
    ...themeColors,
    // PrimaryColor700: '#273C60',
    PrimaryColor500: '#273C60',
    SecondaryColor700: '#FFA700',
    PrimaryColor500With10: '#273C6025',
    SecondaryColor500With10: '#FFA70065',
    splashBg: '#273C60',
  },
  Spesho_27: {
    ...commanColors,
    ...themeColors,
    // PrimaryColor700: '#273C60',
    PrimaryColor500: '#273C60',
    SecondaryColor700: '#C7A900',
    PrimaryColor500With10: '#C7A900',
    SecondaryColor500With10: '#C7A900',
    splashBg: 'white',
  },
  SpeshoCopy_27: {
    ...commanColors,
    ...themeColors,
    // PrimaryColor700: '#273C60',
    PrimaryColor500: '#C7A900',
    SecondaryColor700: '#C7A900',
    PrimaryColor500With10: '#C7A900',
    SecondaryColor500With10: '#C7A900',
    splashBg: 'white',
  },
  SKTaxi_456: {
    ...commanColors,
    ...themeColors,
    // PrimaryColor700: '#273C60',
    PrimaryColor500: '#273C60',
    SecondaryColor700: '#C7A900',
    PrimaryColor500With10: '#C7A900',
    SecondaryColor500With10: '#C7A900',
    splashBg: 'white',
  },
  Wasili_271: {
    ...commanColors,
    ...themeColors,
    // PrimaryColor700: '#273C60',
    PrimaryColor500: '#5a2533',
    SecondaryColor700: '#D0930F',
    PrimaryColor500With10: '#5a253325',
    SecondaryColor500With10: '#D0930F',
    splashBg: '#FFFFFF',
  },
};
const Colors = companyColors[`YelowSoft_663`];

export default Colors;

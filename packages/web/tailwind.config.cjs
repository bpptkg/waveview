/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {
        'gradient-matcha': 'linear-gradient(to top left, #EBB9B9, #D0B9EB, #74C6F8)',
        'gradient-matcha-dark': 'linear-gradient(to top left, #3D3D3D, #0F548C, #0F6CBD)',
      },
      colors: {
        neutral: {
          grey: {
            black: '#000000',
            2: '#050505',
            4: '#0A0A0A',
            6: '#0F0F0F',
            8: '#141414',
            10: '#1A1A1A',
            12: '#1F1F1F',
            14: '#242424',
            16: '#292929',
            18: '#2E2E2E',
            20: '#333333',
            22: '#383838',
            24: '#3D3D3D',
            26: '#424242',
            28: '#474747',
            30: '#4D4D4D',
            32: '#525252',
            34: '#575757',
            36: '#5C5C5C',
            38: '#616161',
            40: '#666666',
            42: '#6B6B6B',
            44: '#707070',
            46: '#757575',
            48: '#7A7A7A',
            50: '#808080',
            52: '#858585',
            54: '#8A8A8A',
            56: '#8F8F8F',
            58: '#949494',
            60: '#999999',
            62: '#9E9E9E',
            64: '#A3A3A3',
            66: '#A8A8A8',
            68: '#ADADAD',
            70: '#B3B3B3',
            72: '#B8B8B8',
            74: '#BDBDBD',
            76: '#C2C2C2',
            78: '#C7C7C7',
            80: '#CCCCCC',
            82: '#D1D1D1',
            84: '#D6D6D6',
            86: '#DBDBDB',
            88: '#E0E0E0',
            90: '#E6E6E6',
            92: '#EBEBEB',
            94: '#F0F0F0',
            96: '#F5F5F5',
            98: '#FAFAFA',
            white: '#FFFFFF',
          }
        },
        brand: {
          hosts: {
            10: '#061724',
            20: '#082338',
            30: '#0A2E4A',
            40: '#0C3B5E',
            50: '#0E4775',
            60: '#0F548C',
            70: '#115EA3',
            80: '#0F6CBD',
            90: '#2886DE',
            100: '#479EF5',
            110: '#62ABF5',
            120: '#77B7F7',
            130: '#96C6FA',
            140: '#B4D6FA',
            150: '#CFE4FA',
            160: '#EBF3FC',
          }
        }
      }
    },
  },
  plugins: [],
}

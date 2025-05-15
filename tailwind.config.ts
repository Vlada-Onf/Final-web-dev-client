import type {Config} from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
    content: [
        './components/**/*.{js,ts,vue}',
        './layouts/**/*.{js,ts,vue}',
        './pages/**/*.{js,ts,vue}',
        './app.vue'
    ],
    theme: {
        extend: {},
    },
    plugins: [require('@tailwindcss/forms')],
}


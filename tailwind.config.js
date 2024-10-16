/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                back: "#222222",
                back_2: "#2e2e2e",
                back_3: "#383838",
                back_4: "#4c4660",
                back_autofill: "#e9f0fd",
                fore: "#4fbb7c",
                fore2: "#71bb4f"
            }
        },
    },
    plugins: [],
}

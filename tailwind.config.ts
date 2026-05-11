import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        border: "var(--border)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        
        orange: "var(--orange)",
        "orange-glow": "var(--orange-glow)",
        blue: "var(--blue)",
        "blue-glow": "var(--blue-glow)",
        green: "var(--green)",
        "green-glow": "var(--green-glow)",
        purple: "var(--purple)",
        "purple-glow": "var(--purple-glow)",
        pink: "var(--pink)",
        "pink-glow": "var(--pink-glow)",
        amber: "var(--amber)",
        "amber-glow": "var(--amber-glow)",
        red: "var(--red)",
        "red-glow": "var(--red-glow)",
        "nav-bg": "var(--nav-bg)",
        "nav-border": "var(--nav-border)",
        "nav-active": "var(--nav-active)",
      },
    },
  },
  plugins: [],
};
export default config;

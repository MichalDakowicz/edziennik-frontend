## Part 24 – Styling System

### Color palette (Tailwind config additions)

The app uses a dark zinc palette. No changes to `tailwind.config.js` needed beyond what already exists. All components use `bg-[#09090b]` as page background.

### Custom utility classes to define in `index.css`

```css
@layer utilities {
    .page-title {
        @apply text-3xl font-bold tracking-tight text-zinc-100;
    }
    .section-title {
        @apply text-xl font-semibold text-zinc-200;
    }
    .stat-value {
        @apply text-3xl font-bold;
    }
    .stat-label {
        @apply text-xs font-medium uppercase tracking-wider text-zinc-500;
    }
    .input-base {
        @apply w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 
           placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 
           focus:border-blue-500/50 disabled:opacity-50;
    }
    .btn-primary {
        @apply bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 
           transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium;
    }
    .btn-ghost {
        @apply bg-zinc-800 text-zinc-300 py-2 px-4 rounded-lg hover:bg-zinc-700 
           transition-colors font-medium;
    }
    .btn-danger {
        @apply bg-red-900/20 text-red-400 border border-red-900/30 py-2 px-4 rounded-lg 
           hover:bg-red-900/30 transition-colors font-medium;
    }
    .tab-active {
        @apply border-b-2 border-blue-500 text-blue-400 pb-2;
    }
    .tab-inactive {
        @apply text-zinc-500 pb-2 hover:text-zinc-300 transition-colors;
    }
}
```

---


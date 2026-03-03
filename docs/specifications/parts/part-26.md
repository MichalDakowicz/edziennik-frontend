## Part 26 – Error Handling

### Global API errors

The `fetchWithAuth` function throws `Error` on non-OK responses. All useQuery calls expose `isError` / `error`. Render `<ErrorState message={error.message} />` when `isError` is true.

### Error State component

```tsx
export const ErrorState = ({ message }: { message: string }) => (
    <div className="bg-red-900/10 border border-red-900/20 rounded-xl p-6 text-center">
        <p className="text-red-400 font-medium">{message}</p>
        <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-zinc-400 hover:text-zinc-200"
        >
            Odśwież stronę
        </button>
    </div>
);
```

### Mutation error handling

All mutations use `toast.error(...)` from `sonner` on failure. Never show inline errors from mutations; use toasts.

---


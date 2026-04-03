export const ErrorState = ({ message }: { message: string }) => (
  <div className="bg-red-900/10 border border-red-900/20 rounded-xl p-6 text-center">
    <p className="text-red-400 font-medium">{message}</p>
    <button onClick={() => window.location.reload()} className="mt-3 text-sm text-on-surface-variant font-body hover:text-on-surface font-body">
      Odśwież stronę
    </button>
  </div>
);
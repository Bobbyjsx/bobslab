export default function Loading() {
  return (
    <div className="w-full animate-pulse space-y-6 py-8 max-w-4xl">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="h-5 w-96 max-w-full rounded bg-muted/60" />
      <div className="my-8 h-48 w-full rounded-2xl border border-border bg-muted/20" />
      <div className="space-y-3">
        <div className="h-6 w-36 rounded bg-muted" />
        <div className="h-28 w-full rounded-lg bg-muted/30" />
      </div>
    </div>
  );
}

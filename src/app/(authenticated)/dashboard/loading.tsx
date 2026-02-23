export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-40 rounded-lg bg-[#F5F5F7]" />
        <div className="mt-2 h-5 w-60 rounded-lg bg-[#F5F5F7]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-[#E8E8ED] bg-white p-5">
            <div className="flex justify-between">
              <div className="h-4 w-20 rounded bg-[#F5F5F7]" />
              <div className="h-4 w-16 rounded bg-[#F5F5F7]" />
            </div>
            <div className="mt-4 h-9 w-16 rounded bg-[#F5F5F7]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 flex justify-between">
        <div>
          <div className="h-7 w-32 rounded-lg bg-[#F5F5F7]" />
          <div className="mt-2 h-5 w-52 rounded-lg bg-[#F5F5F7]" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-[#F5F5F7]" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-[#E8E8ED] bg-white p-5">
            <div className="flex justify-between">
              <div className="h-5 w-48 rounded bg-[#F5F5F7]" />
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded bg-[#F5F5F7]" />
                <div className="h-5 w-16 rounded bg-[#F5F5F7]" />
              </div>
            </div>
            <div className="mt-3 h-4 w-full rounded bg-[#F5F5F7]" />
          </div>
        ))}
      </div>
    </div>
  );
}

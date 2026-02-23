export default function CheckpointsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-36 rounded-lg bg-[#F5F5F7]" />
        <div className="mt-2 h-5 w-56 rounded-lg bg-[#F5F5F7]" />
      </div>
      <div className="space-y-6">
        <div className="h-4 w-28 rounded bg-[#F5F5F7]" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-[#E8E8ED] bg-white px-5 py-4">
            <div className="h-8 w-8 rounded-full bg-[#F5F5F7]" />
            <div className="flex-1">
              <div className="h-4 w-48 rounded bg-[#F5F5F7]" />
              <div className="mt-1 h-3 w-32 rounded bg-[#F5F5F7]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

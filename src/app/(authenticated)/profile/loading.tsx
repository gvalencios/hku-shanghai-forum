export default function ProfileLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-32 rounded-lg bg-[#F5F5F7]" />
        <div className="mt-2 h-5 w-72 rounded-lg bg-[#F5F5F7]" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-[#E8E8ED] bg-white p-5">
            <div className="mb-4 h-5 w-40 rounded bg-[#F5F5F7]" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <div className="h-3 w-20 rounded bg-[#F5F5F7]" />
                  <div className="mt-2 h-5 w-32 rounded bg-[#F5F5F7]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

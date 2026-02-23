"use client";

import { useEffect, useState } from "react";
import { getPublishedInfoBlocks } from "@/lib/firestore/info-blocks";
import { getInfoCategories } from "@/lib/firestore/info-categories";
import { type InfoCategory, type InfoBlock, type InfoCategoryDef } from "@/lib/types/info";
import { Tabs } from "@/components/ui/Tabs";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

const CATEGORY_ICONS: Record<InfoCategory, React.ReactNode> = {
  overview: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  schedule: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  assessment: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
    </svg>
  ),
  logistics: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  contacts: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  rules: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
    </svg>
  ),
};

export default function StudentInfoPage() {
  const [blocks, setBlocks] = useState<InfoBlock[]>([]);
  const [categories, setCategories] = useState<InfoCategoryDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<InfoCategory | "all">("all");

  useEffect(() => {
    Promise.all([getPublishedInfoBlocks(), getInfoCategories()]).then(([data, cats]) => {
      setBlocks(data);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  // Group blocks by category
  const grouped = blocks.reduce<Record<string, InfoBlock[]>>((acc, b) => {
    if (!acc[b.category]) acc[b.category] = [];
    acc[b.category].push(b);
    return acc;
  }, {});

  const categoryTabs = [
    { id: "all", label: "All" },
    ...categories.map((c) => ({ id: c.id, label: c.label })),
  ];

  const visibleCategories =
    category === "all"
      ? categories.map((c) => c.id).filter((id) => grouped[id]?.length)
      : grouped[category]?.length
        ? [category]
        : [];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
          Trip Information
        </h1>
        <p className="mt-1 text-[15px] text-[#6E6E73]">
          Everything you need to know for the Shanghai trip
        </p>
      </div>

      <div className="mb-6">
        <Tabs
          tabs={categoryTabs}
          activeTab={category}
          onChange={(id) => setCategory(id as InfoCategory | "all")}
        />
      </div>

      {visibleCategories.length === 0 ? (
        <EmptyState
          title="No information yet"
          description="Check back later for updates."
        />
      ) : (
        <div className="space-y-8">
          {visibleCategories.map((cat) => {
            const items = grouped[cat];
            if (!items?.length) return null;

            return (
              <section key={cat}>
                {/* Section header */}
                <div className="mb-3 flex items-center gap-2 text-[#86868B]">
                  {CATEGORY_ICONS[cat]}
                  <h2 className="text-[13px] font-semibold uppercase tracking-wider">
                    {categories.find((c) => c.id === cat)?.label ?? cat}
                  </h2>
                </div>

                {/* Info cards */}
                <div className="space-y-3">
                  {items.map((block) => (
                    <Card key={block.id}>
                      <CardContent className="py-4">
                        <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
                          {block.title}
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-[#1D1D1F]">
                          {block.body}
                        </p>
                        {block.links.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                            {block.links.map((link, i) => (
                              <a
                                key={i}
                                href={/^[a-z]+:/i.test(link.url) ? link.url : `https://${link.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[13px] font-medium text-[#007AFF] hover:underline"
                              >
                                {link.label} &rarr;
                              </a>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { prisma } from '@/app/lib/prisma';
import { notFound } from 'next/navigation';

export default async function CodeStatsPage({ params }: any) {
  const { code } = await params;

  const link = await prisma.link.findUnique({
    where: { code },
  });

  if (!link) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">
          Stats for <span className="font-mono">/{link.code}</span>
        </h1>

        <section className="space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div>
            <div className="text-xs text-slate-400 mb-1">Target URL</div>
            <a
              href={link.targetUrl}
              target="_blank"
              className="text-sky-400 hover:underline break-all"
            >
              {link.targetUrl}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-400">Total Clicks</div>
              <div className="text-xl font-semibold">{link.clickCount}</div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Last Clicked</div>
              <div>
                {link.lastClickedAt
                  ? new Date(link.lastClickedAt).toLocaleString()
                  : 'Never'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
            <div>
              <div className="mb-1">Created At</div>
              <div>{new Date(link.createdAt).toLocaleString()}</div>
            </div>

            <div>
              <div className="mb-1">Updated At</div>
              <div>{new Date(link.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </section>

        <div className="mt-6 flex justify-between text-sm">
          <a href="/" className="text-slate-400 hover:text-slate-200">
            ← Back to Dashboard
          </a>

          <a
            href={`/${link.code}`}
            target="_blank"
            className="text-sky-400 hover:text-sky-300"
          >
            Open Short Link ↗
          </a>
        </div>
      </div>
    </main>
  );
}

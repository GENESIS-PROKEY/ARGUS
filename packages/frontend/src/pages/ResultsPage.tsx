import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useScanStore } from '@/stores/scanStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { ResultsGrid } from '@/components/layout/ResultsGrid';

export function ResultsPage() {
  const { domain } = useParams<{ domain: string }>();
  const navigate = useNavigate();
  const { startScan, reset } = useScanStore();

  useEffect(() => {
    if (!domain) {
      navigate('/');
      return;
    }
    reset();
    startScan(domain);
  }, [domain, startScan, reset, navigate]);

  if (!domain) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar domain={domain} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <ResultsGrid />
        </main>
      </div>
    </div>
  );
}

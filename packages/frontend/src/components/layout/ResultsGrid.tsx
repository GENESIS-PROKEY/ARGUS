import { useScanStore } from '@/stores/scanStore';
import { motion } from 'framer-motion';
import { CheckCard } from '@/components/ui/Card';
import { AlertTriangle } from 'lucide-react';

export function ResultsGrid() {
  const { checks, status, error } = useScanStore();
  const checkList = Array.from(checks.values());

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="card-glow p-8 text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-argus-danger mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-argus-text-primary mb-2">Scan Failed</h3>
          <p className="text-argus-text-secondary">{error ?? 'An unexpected error occurred'}</p>
        </div>
      </div>
    );
  }

  if (checkList.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4 text-argus-text-muted">
          <div className="w-10 h-10 border-2 border-argus-accent-cyan/30 border-t-argus-accent-cyan rounded-full animate-spin" />
          <span>Starting scan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {checkList.map((check, index) => (
        <motion.div
          key={check.id}
          id={`check-${check.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
        >
          <CheckCard check={check} />
        </motion.div>
      ))}
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative">
            <Shield className="w-12 h-12 text-argus-card-border" />
            <Eye className="w-4 h-4 text-argus-card-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <h1 className="text-6xl font-display font-bold text-gradient mb-4">404</h1>
        <p className="text-lg text-argus-text-secondary mb-8">
          Even ARGUS can't see what isn't there.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </motion.div>
    </div>
  );
}

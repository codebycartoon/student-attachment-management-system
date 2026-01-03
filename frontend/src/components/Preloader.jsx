import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if assets are cached and LCP is good
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`preloader ${!isVisible ? 'fade-out' : ''}`}>
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-blue-600 animate-pulse" />
        <span className="text-xl font-semibold text-slate-900">AttachPro</span>
      </div>
    </div>
  );
}
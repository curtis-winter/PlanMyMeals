import { useState, useEffect } from 'react';

export interface BuildInfo {
  buildNumber: number;
}

export function useBuildInfo() {
  const [buildInfo, setBuildInfo] = useState<BuildInfo>({ buildNumber: 0 });

  useEffect(() => {
    const fetchBuildInfo = async () => {
      try {
        const res = await fetch('/api/build-number');
        const data = await res.json();
        setBuildInfo(data);
      } catch (err) {
        console.error('Failed to fetch build number:', err);
      }
    };
    fetchBuildInfo();
  }, []);

  return buildInfo;
}
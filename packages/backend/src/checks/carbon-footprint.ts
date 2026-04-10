import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';
import { config } from '../config/index.js';

export const carbonFootprintCheck: CheckModule = {
  id: 'carbon-footprint',
  name: 'Carbon Footprint',
  description: 'Estimates the carbon emissions per page load based on page size and hosting',
  category: 'performance',
  icon: 'leaf',
  run: async (target) => {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.CHECK_TIMEOUT_MS);

      const response = await fetch(target.url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'ARGUS/1.0 Web Intelligence Scanner' },
      });
      const body = await response.arrayBuffer();
      clearTimeout(timer);

      const pageSizeBytes = body.byteLength;
      const pageSizeKB = pageSizeBytes / 1024;
      const pageSizeMB = pageSizeKB / 1024;

      // Carbon estimation model
      // Average grid intensity: ~442g CO2/kWh (global avg)
      // Average energy per GB transferred: ~0.06 kWh/GB (data centres + network + end device)
      // Source: The Shift Project methodology
      const energyPerGB = 0.06; // kWh
      const gridIntensity = 442; // g CO2 per kWh
      const pageSizeGB = pageSizeBytes / (1024 * 1024 * 1024);
      const energyPerVisit = pageSizeGB * energyPerGB;
      const co2PerVisit = energyPerVisit * gridIntensity; // grams
      const co2PerVisitMg = co2PerVisit * 1000; // milligrams for readability

      // Annual estimate (assuming 10,000 monthly page views)
      const monthlyViews = 10000;
      const annualCO2kg = (co2PerVisit * monthlyViews * 12) / 1000;

      // Grade
      let grade: string;
      if (pageSizeKB < 100) grade = 'A+';
      else if (pageSizeKB < 500) grade = 'A';
      else if (pageSizeKB < 1000) grade = 'B';
      else if (pageSizeKB < 2000) grade = 'C';
      else if (pageSizeKB < 5000) grade = 'D';
      else grade = 'F';

      // Comparison
      const medianPageSizeKB = 2300; // Global web median ~2.3MB (HTTP Archive)
      const isCleanerThanMedian = pageSizeKB < medianPageSizeKB;
      const percentCleaner = isCleanerThanMedian
        ? Math.round(((medianPageSizeKB - pageSizeKB) / medianPageSizeKB) * 100)
        : -Math.round(((pageSizeKB - medianPageSizeKB) / medianPageSizeKB) * 100);

      return {
        success: true,
        data: {
          pageSize: `${pageSizeMB > 1 ? pageSizeMB.toFixed(2) + ' MB' : pageSizeKB.toFixed(1) + ' KB'}`,
          pageSizeBytes,
          co2PerVisit: `${co2PerVisitMg.toFixed(2)} mg`,
          annualEstimate: `${annualCO2kg.toFixed(2)} kg CO₂ (at 10K monthly views)`,
          grade,
          comparison: {
            isCleanerThanMedian,
            percentDifference: `${Math.abs(percentCleaner)}% ${isCleanerThanMedian ? 'cleaner' : 'heavier'} than median`,
          },
          methodology: 'Based on The Shift Project model (0.06 kWh/GB, 442g CO₂/kWh global grid avg)',
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};

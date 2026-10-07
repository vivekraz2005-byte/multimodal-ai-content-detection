import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function Timeline({ frameData = [] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-gray-800 text-gray-200">
        <Clock className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-base">Frame Anomaly Timeline</h3>
      </div>

      {frameData.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No timeline anomalies detected.</p>
      ) : (
        <div className="space-y-3">
          <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
            {frameData.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{ width: `${100 / frameData.length}%` }}
                className={`h-full ${item.isAnomaly ? 'bg-red-500' : 'bg-emerald-500/50'}`}
                title={`Time: ${item.timestamp}s - ${item.isAnomaly ? 'Anomaly' : 'Clean'}`}
              />
            ))}
          </div>

          <div className="pt-2 grid grid-cols-1 gap-2">
            {frameData.filter(f => f.isAnomaly).map((item, idx) => (
              <div key={item.id || idx} className="flex items-center justify-between text-xs bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-red-300">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>Anomaly detected at {item.timestamp}s</span>
                </div>
                <span className="font-mono bg-red-950/60 px-2 py-0.5 rounded text-red-200">
                  Score: {item.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
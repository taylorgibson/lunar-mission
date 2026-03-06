import { memo } from 'react';

function CraterTimeline({ craters, timestamps, setTimestamp, satTime }) {
  if (!craters || craters.length === 0) return null;

  return (
    <div className="p-3">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
        Scheduled Snapshot Times (minutes)
      </div>
      <div className="grid grid-cols-1 gap-1">
        {craters.map((crater, i) => (
          <div key={i} className="flex items-center gap-1 text-xs">
            <span className="text-gray-400 w-4 text-right">{i + 1}.</span>
            <span className="text-gray-300 truncate w-28" title={crater.name}>{crater.name}</span>
            <input
              type="number"
              value={timestamps[i] ?? 0}
              onChange={e => setTimestamp(i, parseInt(e.target.value) || 0)}
              className="bg-gray-700 text-white text-xs rounded px-1 py-0.5 w-16 font-mono"
            />
            <button
              onClick={() => setTimestamp(i, satTime)}
              className="bg-yellow-600 hover:bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-bold"
            >
              Set
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(CraterTimeline);

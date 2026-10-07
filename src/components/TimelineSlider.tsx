import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';

interface TimelineSliderProps {
  timeOffsetMin: number;
  onChangeTimeOffset: (offset: number) => void;
  maxOffsetMin?: number;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  timeOffsetMin,
  onChangeTimeOffset,
  maxOffsetMin = 180
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const timeOffsetRef = useRef(timeOffsetMin);

  useEffect(() => {
    timeOffsetRef.current = timeOffsetMin;
  }, [timeOffsetMin]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      const next = timeOffsetRef.current + 15;
      onChangeTimeOffset(next > maxOffsetMin ? 0 : next);
    }, 1500);

    return () => clearInterval(timer);
  }, [isPlaying, maxOffsetMin, onChangeTimeOffset]);

  const handleStep = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      onChangeTimeOffset(Math.max(0, timeOffsetMin - 15));
    } else {
      onChangeTimeOffset(Math.min(maxOffsetMin, timeOffsetMin + 15));
    }
  };

  const getHorizonLabel = (mins: number) => {
    if (mins === 0) return 'T+0m (Current Nowcast)';
    if (mins === 45) return 'T+45m (Expected Storm Peak)';
    if (mins === 180) return 'T+180m (+3 Hours Out)';
    return `T+${mins}m (+${mins} min)`;
  };

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 text-white px-4 py-2.5 shadow-2xl z-20 select-none">
      <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Playback Controls & Status Badge */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleStep('prev')}
              disabled={timeOffsetMin === 0}
              className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors"
              title="Previous 15 min"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
                isPlaying
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/40'
              }`}
              title={isPlaying ? 'Pause Nowcast Loop' : 'Play 3-Hour Nowcast Animation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause' : 'Play Loop'}</span>
            </button>

            <button
              onClick={() => handleStep('next')}
              disabled={timeOffsetMin === maxOffsetMin}
              className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors"
              title="Next 15 min"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                onChangeTimeOffset(0);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-1"
              title="Reset to Now"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-white font-mono">{getHorizonLabel(timeOffsetMin)}</span>
            </div>
            {timeOffsetMin === 45 && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>Peak Catchment Inflow</span>
              </span>
            )}
          </div>
        </div>

        {/* Timeline Range Slider Bar with 15-minute tick indicators */}
        <div className="w-full sm:max-w-xl md:max-w-2xl flex flex-col space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={maxOffsetMin}
              step={15}
              value={timeOffsetMin}
              onChange={(e) => {
                setIsPlaying(false);
                onChangeTimeOffset(Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
            />
          </div>

          {/* Time Marker Ticks */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
            <span className={timeOffsetMin === 0 ? 'text-cyan-300 font-bold' : ''}>Now</span>
            <span className={timeOffsetMin === 30 ? 'text-cyan-300 font-bold' : ''}>+30m</span>
            <span className={timeOffsetMin === 60 ? 'text-cyan-300 font-bold' : ''}>+1h</span>
            <span className={timeOffsetMin === 90 ? 'text-cyan-300 font-bold' : ''}>+1.5h</span>
            <span className={timeOffsetMin === 120 ? 'text-cyan-300 font-bold' : ''}>+2h</span>
            <span className={timeOffsetMin === 150 ? 'text-cyan-300 font-bold' : ''}>+2.5h</span>
            <span className={timeOffsetMin === 180 ? 'text-cyan-300 font-bold' : ''}>+3h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

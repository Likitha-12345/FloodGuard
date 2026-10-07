import React from 'react';
import {
  ShieldCheck,
  X,
  Cpu,
  FileCode2,
  Database,
  Info,
  Layers,
  Scale
} from 'lucide-react';

interface ModelReliabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelReliabilityModal: React.FC<ModelReliabilityModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Data & Model Reliability Specification</h3>
              <p className="text-xs text-slate-400">FloodGuard AI Technical Architecture & Provenance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Transparency & Demonstration Disclosure Banner */}
          <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-800/80 text-blue-200">
            <div className="font-bold flex items-center gap-1.5 text-blue-300 mb-1">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Operational Status & Simulation Disclosure</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              This application functions as an active working demonstration and MVP of the FloodGuard AI nowcasting framework. When live IMD Doppler Weather Radar feeds and municipal IoT telemetry are connected, predictions update directly from calibrated regional sensors. Synthetic convective scenarios are explicitly labeled to avoid presenting simulated models as live sensor readings.
            </p>
          </div>

          {/* Model Architecture */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>1. Machine Learning Nowcasting Architecture</span>
            </h4>
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/70 space-y-2">
              <p>
                <strong>Regression Engine (Water Depth in cm):</strong> Utilizes an XGBoost gradient-boosted decision tree ensemble trained across hydrological terrain features:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li>Instantaneous & lagged rainfall intensity (15-min storm hydrograph interpolation)</li>
                <li>Cumulative precipitation over 1, 3, and 6 hours</li>
                <li>Digital Elevation Model (DEM) elevation & micro-depression sink indices</li>
                <li>Surface slope and impervious surface percentages (concrete/asphalt runoff coefficient)</li>
                <li>Underground stormwater pipe discharge capacity and manhole surcharge head</li>
                <li>Historical flood vulnerability indices from Mumbai (2005/2021), Delhi (2023), and Chennai (2015) municipal records</li>
              </ul>
              <p className="pt-1">
                <strong>Classification Engine (Flood Probability %):</strong> Logistic classification sigmoid calibrated to predict probability of street inundation exceeding 5 cm.
              </p>
            </div>
          </div>

          {/* Drainage Hydraulics */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>2. Drainage Graph & Hydraulic Surcharge Simulation</span>
            </h4>
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/70 space-y-1.5">
              <p>
                Municipal underground stormwater networks are modeled as a directed graph:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li><strong>Nodes:</strong> Represent manholes, sumps, inlets, pumping stations, and tidal outfalls with defined cubic storage capacity.</li>
                <li><strong>Edges:</strong> Storm pipes and canals with hydraulic discharge calculated via Manning’s open-channel and conduit equation: <em>Q = (1/n) · A · R<sup>2/3</sup> · S<sup>1/2</sup></em>.</li>
                <li><strong>Surcharge Conditions:</strong> When surface runoff inflow exceeds pipe design capacity (e.g. 25 mm/hr standard municipal benchmark), hydraulic head accumulates and surcharges back onto connected street surfaces.</li>
              </ul>
            </div>
          </div>

          {/* Safe Routing */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>3. Flood-Penalized Safe Routing & Emergency Protocols</span>
            </h4>
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/70 space-y-1.5">
              <p>
                The routing engine computes an A*/Dijkstra graph traversal with a nonlinear flood cost function:
              </p>
              <p className="font-mono text-[11px] bg-slate-900 p-2 rounded text-cyan-300">
                Cost(edge) = Length(edge) × [ 1 + α · (Depth(edge) / Threshold)<sup>2.5</sup> ]
              </p>
              <p>
                Roads exceeding the clearance limit are completely excluded. Emergency Vehicle Mode enforces clearance thresholds for ambulances and rescue teams while highlighting pump-station-assisted elevated corridors.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

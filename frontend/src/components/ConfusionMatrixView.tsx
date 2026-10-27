import React from 'react';

interface ConfusionMatrixViewProps {
  matrix: number[][];
  classes: string[];
  title?: string;
}

export const ConfusionMatrixView: React.FC<ConfusionMatrixViewProps> = ({
  matrix,
  classes,
  title = "Confusion Matrix"
}) => {
  if (!matrix || matrix.length === 0) return null;

  // Find max value in matrix for color intensity
  const maxVal = Math.max(...matrix.map(row => Math.max(...row)), 1);

  return (
    <div className="bg-navy-900/90 border border-navy-700/80 rounded-xl p-6 shadow-xl overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-semibold text-white tracking-wide">{title}</h4>
          <p className="text-xs text-slate-400 mt-1">Rows: Actual Class | Columns: Predicted Class</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="inline-block w-3 h-3 rounded bg-navy-800 border border-navy-700" />
          <span>0</span>
          <span className="inline-block w-3 h-3 rounded bg-cyan-600" />
          <span>High ({maxVal})</span>
        </div>
      </div>

      <div className="min-w-[500px]">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-semibold text-slate-400 text-left">Actual \ Pred</th>
              {classes.map((cls) => (
                <th key={cls} className="p-2 text-xs font-medium text-cyan-400">
                  <span className="inline-block max-w-[90px] truncate" title={cls}>
                    {cls.replace('_', ' ')}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIdx) => (
              <tr key={classes[rowIdx]} className="border-t border-navy-800">
                <td className="p-2.5 text-xs font-medium text-slate-300 text-left whitespace-nowrap">
                  {classes[rowIdx].replace('_', ' ')}
                </td>
                {row.map((val, colIdx) => {
                  const isDiagonal = rowIdx === colIdx;
                  const intensity = Math.min(Math.round((val / maxVal) * 100), 100);
                  const bgColor = val === 0
                    ? 'bg-navy-800/40 text-slate-500'
                    : isDiagonal
                      ? 'bg-cyan-500/25 text-cyan-200 font-bold border border-cyan-500/40'
                      : 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30';

                  return (
                    <td key={colIdx} className="p-1">
                      <div
                        className={`rounded-lg py-2 px-1 text-sm transition-all duration-150 ${bgColor}`}
                        title={`Actual: ${classes[rowIdx]}, Predicted: ${classes[colIdx]}, Count: ${val}`}
                      >
                        {val}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


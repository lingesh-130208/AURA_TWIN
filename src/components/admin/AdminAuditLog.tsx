import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, XCircle, Edit3 } from 'lucide-react';
import { trafficStateService } from '../../services/trafficStateService';

export const AdminAuditLog: React.FC = () => {
  const auditLogs = trafficStateService.getAuditLogs();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">OPERATIONAL AUDIT LOG</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
              IMMUTABLE RECORD
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Tamper-evident record of all human operator actions, scenario deployments, parameter modifications, and rejections.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800">
          Total Recorded Actions: <strong className="text-white">{auditLogs.length}</strong>
        </div>
      </div>

      {/* Log Table */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">OPERATOR</th>
                <th className="py-2.5 px-3">ACTION</th>
                <th className="py-2.5 px-3">SCENARIO ID</th>
                <th className="py-2.5 px-3">CORRELATION ID</th>
                <th className="py-2.5 px-3">NOTES / PARAMETERS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 px-3 text-neutral-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {log.operatorId || log.operatorUsername || 'admin'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center space-x-1 ${
                      (log.action === 'ACCEPT' || log.actionType === 'ACCEPT_INTERVENTION')
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : (log.action === 'REJECT' || log.actionType === 'REJECT_INTERVENTION')
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {(log.action === 'ACCEPT' || log.actionType === 'ACCEPT_INTERVENTION') && <CheckCircle2 className="w-3 h-3" />}
                      {(log.action === 'REJECT' || log.actionType === 'REJECT_INTERVENTION') && <XCircle className="w-3 h-3" />}
                      {(log.action === 'MODIFY' || log.actionType === 'MODIFY_INTERVENTION') && <Edit3 className="w-3 h-3" />}
                      <span>{log.action || log.actionType.replace('_INTERVENTION', '')}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-300">
                    {log.scenarioId || 'CORRIDOR-GEN'}
                  </td>
                  <td className="py-3 px-3 text-cyan-400 text-[11px]">
                    {log.correlationId}
                  </td>
                  <td className="py-3 px-3 text-neutral-300 max-w-xs truncate">
                    {log.reason || log.details || (log.parameters ? JSON.stringify(log.parameters) : 'Approved by human operator')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

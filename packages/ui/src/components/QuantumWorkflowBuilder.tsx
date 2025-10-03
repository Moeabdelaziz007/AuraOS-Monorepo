/**
 * Quantum Workflow Builder UI
 * Visual interface for building quantum-optimized workflows
 */

import React, { useState } from 'react';

interface WorkflowStep {
  id: string;
  type: 'action' | 'decision' | 'parallel' | 'wait' | 'quantum_gate';
  name: string;
  action: string;
  params: Record<string, any>;
}

interface QuantumConfig {
  enableSuperposition: boolean;
  enableAnnealing: boolean;
  enableEntanglement: boolean;
  enableTunneling: boolean;
  maxSuperpositionStates: number;
  annealingIterations: number;
}

export const QuantumWorkflowBuilder: React.FC = () => {
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [quantumConfig, setQuantumConfig] = useState<QuantumConfig>({
    enableSuperposition: true,
    enableAnnealing: true,
    enableEntanglement: true,
    enableTunneling: true,
    maxSuperpositionStates: 10,
    annealingIterations: 100,
  });
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: `step_${steps.length + 1}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${steps.length + 1}`,
      action: type === 'action' ? 'log' : type,
      params: type === 'action' ? { message: 'Step executed' } : {},
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const updateStep = (id: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const executeWorkflow = async () => {
    setExecuting(true);
    try {
      // Mock execution - will be replaced with actual quantum engine call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const result = {
        success: true,
        duration: 1847,
        quantumMetrics: {
          superpositionStates: quantumConfig.maxSuperpositionStates,
          optimalPathProbability: 0.847,
          energyLevel: 234.5,
          entanglements: 5,
          parallelizationFactor: 3.2,
        },
      };
      
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({ success: false, error: String(error) });
    } finally {
      setExecuting(false);
    }
  };

  const exportWorkflow = () => {
    const workflow = {
      name: workflowName,
      steps,
      quantumConfig,
    };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  return (
    <div className="quantum-workflow-builder">
      <div className="builder-header">
        <h2>🌌 Quantum Workflow Builder</h2>
        <p>Build workflows with quantum optimization</p>
      </div>

      <div className="builder-content">
        {/* Workflow Info */}
        <div className="section">
          <h3>📝 Workflow Information</h3>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="workflow-name-input"
            placeholder="Workflow name..."
          />
        </div>

        {/* Quantum Configuration */}
        <div className="section">
          <h3>⚛️ Quantum Configuration</h3>
          <div className="quantum-config">
            <label className="config-item">
              <input
                type="checkbox"
                checked={quantumConfig.enableSuperposition}
                onChange={(e) =>
                  setQuantumConfig({ ...quantumConfig, enableSuperposition: e.target.checked })
                }
              />
              <span>🌊 Superposition (Evaluate multiple paths)</span>
            </label>

            <label className="config-item">
              <input
                type="checkbox"
                checked={quantumConfig.enableAnnealing}
                onChange={(e) =>
                  setQuantumConfig({ ...quantumConfig, enableAnnealing: e.target.checked })
                }
              />
              <span>❄️ Annealing (Optimize configuration)</span>
            </label>

            <label className="config-item">
              <input
                type="checkbox"
                checked={quantumConfig.enableEntanglement}
                onChange={(e) =>
                  setQuantumConfig({ ...quantumConfig, enableEntanglement: e.target.checked })
                }
              />
              <span>🔗 Entanglement (Link dependencies)</span>
            </label>

            <label className="config-item">
              <input
                type="checkbox"
                checked={quantumConfig.enableTunneling}
                onChange={(e) =>
                  setQuantumConfig({ ...quantumConfig, enableTunneling: e.target.checked })
                }
              />
              <span>🚇 Tunneling (Skip unnecessary steps)</span>
            </label>

            <div className="config-slider">
              <label>
                Max Superposition States: {quantumConfig.maxSuperpositionStates}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={quantumConfig.maxSuperpositionStates}
                onChange={(e) =>
                  setQuantumConfig({
                    ...quantumConfig,
                    maxSuperpositionStates: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="config-slider">
              <label>Annealing Iterations: {quantumConfig.annealingIterations}</label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={quantumConfig.annealingIterations}
                onChange={(e) =>
                  setQuantumConfig({
                    ...quantumConfig,
                    annealingIterations: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="section">
          <h3>🔧 Workflow Steps ({steps.length})</h3>
          
          <div className="step-buttons">
            <button onClick={() => addStep('action')} className="add-step-btn">
              ➕ Action
            </button>
            <button onClick={() => addStep('decision')} className="add-step-btn">
              ➕ Decision
            </button>
            <button onClick={() => addStep('parallel')} className="add-step-btn">
              ➕ Parallel
            </button>
            <button onClick={() => addStep('wait')} className="add-step-btn">
              ➕ Wait
            </button>
            <button onClick={() => addStep('quantum_gate')} className="add-step-btn">
              ➕ Quantum Gate
            </button>
          </div>

          <div className="steps-list">
            {steps.length === 0 ? (
              <div className="empty-state">
                <p>No steps yet. Add steps to build your workflow.</p>
              </div>
            ) : (
              steps.map((step, index) => (
                <div key={step.id} className="step-card">
                  <div className="step-header">
                    <span className="step-number">{index + 1}</span>
                    <span className="step-type">{step.type}</span>
                    <button onClick={() => removeStep(step.id)} className="remove-btn">
                      ❌
                    </button>
                  </div>
                  <input
                    type="text"
                    value={step.name}
                    onChange={(e) => updateStep(step.id, { name: e.target.value })}
                    className="step-name-input"
                  />
                  <input
                    type="text"
                    value={step.action}
                    onChange={(e) => updateStep(step.id, { action: e.target.value })}
                    className="step-action-input"
                    placeholder="Action name..."
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Execution Controls */}
        <div className="section">
          <h3>▶️ Execution</h3>
          <div className="execution-controls">
            <button
              onClick={executeWorkflow}
              disabled={steps.length === 0 || executing}
              className="execute-btn"
            >
              {executing ? '⏳ Executing...' : '▶️ Execute Workflow'}
            </button>
            <button onClick={exportWorkflow} disabled={steps.length === 0} className="export-btn">
              💾 Export Workflow
            </button>
          </div>

          {executionResult && (
            <div className="execution-result">
              <h4>
                {executionResult.success ? '✅ Execution Successful' : '❌ Execution Failed'}
              </h4>
              {executionResult.success && (
                <>
                  <p>Duration: {executionResult.duration}ms</p>
                  <div className="quantum-metrics">
                    <h5>⚛️ Quantum Metrics:</h5>
                    <div className="metrics-grid">
                      <div className="metric">
                        <span className="metric-label">Superposition States:</span>
                        <span className="metric-value">
                          {executionResult.quantumMetrics.superpositionStates}
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Optimal Path Probability:</span>
                        <span className="metric-value">
                          {executionResult.quantumMetrics.optimalPathProbability.toFixed(3)}
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Energy Level:</span>
                        <span className="metric-value">
                          {executionResult.quantumMetrics.energyLevel.toFixed(2)}
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Parallelization Factor:</span>
                        <span className="metric-value">
                          {executionResult.quantumMetrics.parallelizationFactor.toFixed(1)}x
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {executionResult.error && <p className="error">{executionResult.error}</p>}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .quantum-workflow-builder {
          padding: 20px;
          background: #1a1a2e;
          color: #eee;
          border-radius: 8px;
          height: 100%;
          overflow-y: auto;
        }

        .builder-header {
          margin-bottom: 30px;
        }

        .builder-header h2 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }

        .builder-header p {
          margin: 0;
          color: #888;
        }

        .section {
          margin-bottom: 30px;
        }

        .section h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #4a9eff;
        }

        .workflow-name-input {
          width: 100%;
          padding: 12px;
          background: #16213e;
          color: #eee;
          border: 1px solid #2a3f5f;
          border-radius: 4px;
          font-size: 16px;
        }

        .quantum-config {
          background: #16213e;
          padding: 20px;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .config-item {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .config-item input[type='checkbox'] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .config-slider {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .config-slider input[type='range'] {
          width: 100%;
        }

        .step-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }

        .add-step-btn {
          padding: 8px 16px;
          background: #2a3f5f;
          color: #eee;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          transition: background 0.2s;
        }

        .add-step-btn:hover {
          background: #3a5f8f;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .step-card {
          background: #16213e;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #2a3f5f;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .step-number {
          background: #4a9eff;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .step-type {
          background: #2a3f5f;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          text-transform: uppercase;
        }

        .remove-btn {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .remove-btn:hover {
          opacity: 1;
        }

        .step-name-input,
        .step-action-input {
          width: 100%;
          padding: 8px;
          background: #0f1419;
          color: #eee;
          border: 1px solid #2a3f5f;
          border-radius: 4px;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .execution-controls {
          display: flex;
          gap: 10px;
        }

        .execute-btn,
        .export-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }

        .execute-btn {
          background: #4a9eff;
          color: white;
        }

        .execute-btn:hover:not(:disabled) {
          background: #3a8eef;
        }

        .execute-btn:disabled {
          background: #2a3f5f;
          cursor: not-allowed;
        }

        .export-btn {
          background: #2a3f5f;
          color: #eee;
        }

        .export-btn:hover:not(:disabled) {
          background: #3a5f8f;
        }

        .export-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .execution-result {
          margin-top: 20px;
          padding: 20px;
          background: #16213e;
          border-radius: 6px;
          border: 1px solid #2a3f5f;
        }

        .execution-result h4 {
          margin: 0 0 15px 0;
          font-size: 16px;
        }

        .quantum-metrics {
          margin-top: 15px;
        }

        .quantum-metrics h5 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #4a9eff;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .metric {
          background: #0f1419;
          padding: 10px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .metric-label {
          font-size: 12px;
          color: #888;
        }

        .metric-value {
          font-size: 18px;
          font-weight: bold;
          color: #0f0;
        }

        .error {
          color: #f44;
        }
      `}</style>
    </div>
  );
};

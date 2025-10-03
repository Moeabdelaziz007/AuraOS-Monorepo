import React from 'react';
import { useDebuggerStore } from '../store/debuggerStore';
import { executeCode } from '../core/executor';
import './DebugControls.css';

export const DebugControls: React.FC = () => {
  const { isRunning, isPaused, reset } = useDebuggerStore();

  const handleRun = async () => {
    const { code, setIsRunning, setError, clearOutput } = useDebuggerStore.getState();
    
    try {
      clearOutput();
      setError(null);
      setIsRunning(true);
      await executeCode(code);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    reset();
  };

  const handleStepOver = () => {
    // TODO: Implement step over
    console.log('Step over');
  };

  const handleStepInto = () => {
    // TODO: Implement step into
    console.log('Step into');
  };

  const handleStepOut = () => {
    // TODO: Implement step out
    console.log('Step out');
  };

  const handleContinue = () => {
    // TODO: Implement continue
    console.log('Continue');
  };

  return (
    <div className="debug-controls">
      <button
        className="control-btn run"
        onClick={handleRun}
        disabled={isRunning}
        title="Run (F5)"
      >
        ▶️ Run
      </button>

      {isPaused && (
        <>
          <button
            className="control-btn"
            onClick={handleContinue}
            title="Continue (F5)"
          >
            ▶️ Continue
          </button>
          
          <button
            className="control-btn"
            onClick={handleStepOver}
            title="Step Over (F10)"
          >
            ⤵️ Step Over
          </button>
          
          <button
            className="control-btn"
            onClick={handleStepInto}
            title="Step Into (F11)"
          >
            ⬇️ Step Into
          </button>
          
          <button
            className="control-btn"
            onClick={handleStepOut}
            title="Step Out (Shift+F11)"
          >
            ⬆️ Step Out
          </button>
        </>
      )}

      {(isRunning || isPaused) && (
        <button
          className="control-btn stop"
          onClick={handleStop}
          title="Stop (Shift+F5)"
        >
          ⏹️ Stop
        </button>
      )}
    </div>
  );
};

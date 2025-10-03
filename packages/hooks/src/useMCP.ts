/**
 * MCP Hook
 * React hook لاستخدام MCP Commands
 */

import { useState, useCallback, useEffect } from 'react';
import { mcpCommands } from '@auraos/core/ai/mcp-commands';

export function useMCP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // تهيئة MCP عند التحميل
  useEffect(() => {
    const init = async () => {
      try {
        await mcpCommands.initialize();
        setInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل في تهيئة MCP');
      }
    };

    init();

    // تنظيف عند الإغلاق
    return () => {
      mcpCommands.shutdown();
    };
  }, []);

  // تنفيذ أمر عام
  const execute = useCallback(async (command: string, context?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mcpCommands.execute(command, context);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل تنفيذ الأمر';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // أوامر الملفات
  const file = {
    read: useCallback(async (path: string) => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.file.read(path);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل قراءة الملف';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    write: useCallback(async (path: string, content: string) => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.file.write(path, content);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل كتابة الملف';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    list: useCallback(async (path: string = '.') => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.file.list(path);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل عرض المجلد';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    search: useCallback(async (query: string, path: string = '.') => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.file.search(query, path);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل البحث';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    delete: useCallback(async (path: string) => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.file.delete(path);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل حذف الملف';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),
  };

  // أوامر المحاكي
  const emulator = {
    run: useCallback(async (code: string) => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.emulator.run(code);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل تشغيل الكود';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    generate: useCallback(async (prompt: string) => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.emulator.generate(prompt);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل توليد الكود';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    execute: useCallback(async (prompt: string) => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.emulator.execute(prompt);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل تنفيذ الأمر';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    getState: useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.emulator.getState();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل الحصول على الحالة';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),
  };

  // أوامر AI
  const ai = {
    chat: useCallback(async (message: string, context?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.ai.chat(message, context);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل المحادثة';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    analyzeCode: useCallback(async (code: string, language: string = 'BASIC') => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.ai.analyzeCode(code, language);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل تحليل الكود';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    fixCode: useCallback(async (code: string, error: string) => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.ai.fixCode(code, error);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل إصلاح الكود';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    explainCode: useCallback(async (code: string) => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.ai.explainCode(code);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل شرح الكود';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    suggestImprovements: useCallback(async (code: string) => {
      setLoading(true);
      setError(null);
      try {
        return await mcpCommands.ai.suggestImprovements(code);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل اقتراح التحسينات';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),
  };

  return {
    loading,
    error,
    initialized,
    execute,
    file,
    emulator,
    ai,
  };
}

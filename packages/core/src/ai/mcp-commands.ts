/**
 * MCP Commands Interface
 * واجهة موحدة لتنفيذ أوامر MCP
 */

import { mcpAIBridge } from './mcp-integration';

/**
 * أوامر الملفات
 */
export const fileCommands = {
  /**
   * قراءة ملف
   */
  async read(filePath: string): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(
      `اقرأ الملف: ${filePath}`,
      { currentPath: filePath }
    );
    return result.response;
  },

  /**
   * كتابة ملف
   */
  async write(filePath: string, content: string): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(
      `اكتب في الملف ${filePath} المحتوى التالي: ${content}`
    );
    return result.response;
  },

  /**
   * عرض محتويات مجلد
   */
  async list(dirPath: string = '.'): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(
      `اعرض محتويات المجلد: ${dirPath}`
    );
    return result.response;
  },

  /**
   * البحث في الملفات
   */
  async search(query: string, path: string = '.'): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(
      `ابحث عن "${query}" في المجلد: ${path}`
    );
    return result.response;
  },

  /**
   * حذف ملف
   */
  async delete(filePath: string): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(
      `احذف الملف: ${filePath}`
    );
    return result.response;
  },
};

/**
 * أوامر المحاكي (Emulator)
 */
export const emulatorCommands = {
  /**
   * تشغيل كود BASIC
   */
  async run(code: string): Promise<{
    output: string;
    success: boolean;
    explanation?: string;
  }> {
    await mcpAIBridge.initialize();
    return mcpAIBridge.runBASICWithAI(code);
  },

  /**
   * تحويل أمر طبيعي إلى BASIC
   */
  async generate(prompt: string): Promise<string> {
    await mcpAIBridge.initialize();
    return mcpAIBridge.naturalLanguageToBASIC(prompt);
  },

  /**
   * تشغيل أمر طبيعي مباشرة
   */
  async execute(prompt: string): Promise<{
    code: string;
    output: string;
    success: boolean;
    explanation?: string;
  }> {
    await mcpAIBridge.initialize();
    
    // توليد الكود
    const code = await mcpAIBridge.naturalLanguageToBASIC(prompt);
    
    // تشغيل الكود
    const result = await mcpAIBridge.runBASICWithAI(code);
    
    return {
      code,
      ...result,
    };
  },

  /**
   * الحصول على حالة المحاكي
   */
  async getState(): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(
      'ما هي حالة المحاكي الحالية؟'
    );
    return result.response;
  },
};

/**
 * أوامر AI العامة
 */
export const aiCommands = {
  /**
   * محادثة عامة مع AI
   */
  async chat(message: string, context?: Record<string, any>): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(message, context);
    return result.response;
  },

  /**
   * تحليل كود
   */
  async analyzeCode(code: string, language: string = 'BASIC'): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(
      `حلل هذا الكود ${language}:\n${code}`
    );
    return result.response;
  },

  /**
   * إصلاح كود
   */
  async fixCode(code: string, error: string): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(
      `أصلح هذا الكود:\n${code}\n\nالخطأ: ${error}`
    );
    return result.response;
  },

  /**
   * شرح كود
   */
  async explainCode(code: string): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(
      `اشرح هذا الكود بالتفصيل:\n${code}`
    );
    return result.response;
  },

  /**
   * اقتراح تحسينات
   */
  async suggestImprovements(code: string): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(
      `اقترح تحسينات لهذا الكود:\n${code}`
    );
    return result.response;
  },
};

/**
 * واجهة موحدة لجميع الأوامر
 */
export const mcpCommands = {
  file: fileCommands,
  emulator: emulatorCommands,
  ai: aiCommands,

  /**
   * تنفيذ أمر عام
   */
  async execute(command: string, context?: Record<string, any>): Promise<string> {
    await mcpAIBridge.initialize();
    const result = await mcpAIBridge.executeAICommand(command, context);
    return result.response;
  },

  /**
   * الحصول على الأدوات المتاحة
   */
  getAvailableTools(): string[] {
    return mcpAIBridge.getAvailableTools();
  },

  /**
   * تهيئة النظام
   */
  async initialize(): Promise<void> {
    await mcpAIBridge.initialize();
  },

  /**
   * إيقاف النظام
   */
  async shutdown(): Promise<void> {
    await mcpAIBridge.shutdown();
  },
};

// تصدير كل شيء
export { mcpAIBridge } from './mcp-integration';

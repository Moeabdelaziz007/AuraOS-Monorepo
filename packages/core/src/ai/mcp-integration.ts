/**
 * MCP Integration with AI Services
 * ربط خدمات الذكاء الاصطناعي مع أدوات MCP
 */

import { MCPGateway, MCPClient } from '@auraos/ai';
import { FileSystemMCPServer } from '../mcp/filesystem';
import { EmulatorControlMCPServer } from '../mcp/emulator';
import { aiService } from './services';
import type { AIMessage } from './services/base.service';

/**
 * MCP-AI Bridge
 * جسر بين الذكاء الاصطناعي وأدوات MCP
 */
export class MCPAIBridge {
  private gateway: MCPGateway;
  private client: MCPClient;
  private initialized = false;

  constructor() {
    this.gateway = new MCPGateway({
      enableAuth: false,
      enableLogging: true,
      maxConcurrentRequests: 50,
      timeout: 30000,
    });
    this.client = new MCPClient(this.gateway, 'ai-system');
  }

  /**
   * تهيئة الـ MCP Servers
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('[MCP-AI Bridge] جاري تهيئة الخوادم...');

    // تسجيل FileSystem Server
    const fsServer = new FileSystemMCPServer('/tmp/auraos', 10 * 1024 * 1024);
    await this.gateway.registerServer(fsServer);
    logger.info('[MCP-AI Bridge] ✅ FileSystem Server جاهز');

    // تسجيل Emulator Server
    const emulatorServer = new EmulatorControlMCPServer();
    await this.gateway.registerServer(emulatorServer);
    logger.info('[MCP-AI Bridge] ✅ Emulator Server جاهز');

    this.initialized = true;
    logger.info('[MCP-AI Bridge] ✅ جميع الخوادم جاهزة');
  }

  /**
   * تنفيذ أمر AI مع MCP Tools
   */
  async executeAICommand(
    userPrompt: string,
    context?: {
      currentPath?: string;
      recentFiles?: string[];
      systemState?: Record<string, any>;
    }
  ): Promise<{
    response: string;
    toolsUsed: string[];
    results: any[];
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    // تحليل الأمر باستخدام AI
    const analysisMessages: AIMessage[] = [
      {
        role: 'system',
        content: `أنت مساعد ذكي لنظام AuraOS. لديك القدرة على استخدام الأدوات التالية:

الأدوات المتاحة:
1. fs_read - قراءة ملف
2. fs_write - كتابة ملف
3. fs_list - عرض محتويات مجلد
4. fs_delete - حذف ملف
5. fs_search - البحث في الملفات
6. emulator_run - تشغيل كود BASIC
7. emulator_step - تنفيذ خطوة واحدة
8. emulator_get_state - الحصول على حالة المحاكي

حلل طلب المستخدم وحدد الأدوات المطلوبة. أرجع JSON بهذا الشكل:
{
  "tools": [
    {
      "name": "اسم_الأداة",
      "params": { "المعاملات": "القيم" }
    }
  ],
  "explanation": "شرح ما ستفعله"
}`,
      },
      {
        role: 'user',
        content: `الطلب: ${userPrompt}\n\nالسياق: ${JSON.stringify(context || {})}`,
      },
    ];

    const aiResponse = await aiService.chat(analysisMessages, {
      temperature: 0.3,
      maxTokens: 1000,
    });

    let toolPlan;
    try {
      // محاولة استخراج JSON من الرد
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        toolPlan = JSON.parse(jsonMatch[0]);
        
        // التحقق من صحة البنية
        if (!toolPlan || typeof toolPlan !== 'object') {
          throw new Error('Invalid tool plan structure');
        }
      } else {
        // إذا لم يكن JSON، نفذ كأمر مباشر
        return {
          response: aiResponse.content,
          toolsUsed: [],
          results: [],
        };
      }
    } catch (error) {
      logger.warn('[MCP-AI Bridge] Failed to parse tool plan:', error);
      return {
        response: aiResponse.content,
        toolsUsed: [],
        results: [],
      };
    }

    // تنفيذ الأدوات
    const toolsUsed: string[] = [];
    const results: any[] = [];

    for (const tool of toolPlan.tools || []) {
      try {
        logger.info(`[MCP-AI Bridge] تنفيذ: ${tool.name}`);
        const result = await this.client.executeTool(tool.name, tool.params);
        toolsUsed.push(tool.name);
        results.push(result);
      } catch (error) {
        logger.error(`[MCP-AI Bridge] خطأ في ${tool.name}:`, error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'خطأ غير معروف',
        });
      }
    }

    // توليد الرد النهائي
    const finalMessages: AIMessage[] = [
      {
        role: 'system',
        content: 'أنت مساعد ذكي. اشرح نتائج العمليات للمستخدم بطريقة واضحة.',
      },
      {
        role: 'user',
        content: `الطلب الأصلي: ${userPrompt}\n\nالنتائج: ${JSON.stringify(results, null, 2)}\n\nاشرح ما تم إنجازه`,
      },
    ];

    const finalResponse = await aiService.chat(finalMessages, {
      temperature: 0.7,
      maxTokens: 500,
    });

    return {
      response: finalResponse.content,
      toolsUsed,
      results,
    };
  }

  /**
   * تحويل أمر طبيعي إلى كود BASIC
   */
  async naturalLanguageToBASIC(prompt: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `أنت خبير في لغة BASIC. حول الطلبات الطبيعية إلى كود BASIC صحيح.

قواعد:
- استخدم أرقام الأسطر (10, 20, 30...)
- استخدم PRINT للطباعة
- استخدم INPUT للإدخال
- استخدم GOTO للتكرار
- استخدم IF...THEN للشروط
- استخدم FOR...NEXT للحلقات

مثال:
الطلب: "اطبع مرحبا 5 مرات"
الكود:
10 FOR I = 1 TO 5
20 PRINT "مرحبا"
30 NEXT I
40 END`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await aiService.chat(messages, {
      temperature: 0.2,
      maxTokens: 500,
    });

    // استخراج الكود من الرد
    const codeMatch = response.content.match(/```(?:basic)?\n([\s\S]*?)\n```/);
    if (codeMatch) {
      return codeMatch[1].trim();
    }

    // إذا لم يكن في code block، أرجع الرد كاملاً
    return response.content.trim();
  }

  /**
   * تشغيل كود BASIC مع AI
   */
  async runBASICWithAI(code: string): Promise<{
    output: string;
    success: boolean;
    aiExplanation?: string;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    // تشغيل الكود
    const result = await this.client.executeTool('emulator_run', {
      code,
      autoStart: true,
    });

    // الحصول على شرح AI
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'أنت معلم برمجة. اشرح ما يفعله هذا الكود BASIC بطريقة بسيطة.',
      },
      {
        role: 'user',
        content: `الكود:\n${code}\n\nالنتيجة:\n${JSON.stringify(result.data, null, 2)}`,
      },
    ];

    const explanation = await aiService.chat(messages, {
      temperature: 0.7,
      maxTokens: 300,
    });

    return {
      output: result.data?.output || '',
      success: result.success,
      aiExplanation: explanation.content,
    };
  }

  /**
   * الحصول على الأدوات المتاحة
   */
  getAvailableTools(): string[] {
    return this.gateway.listServers().flatMap((server) =>
      this.gateway.listTools(server).map((tool) => `${server}.${tool.name}`)
    );
  }

  /**
   * إيقاف الخدمة
   */
  async shutdown(): Promise<void> {
    await this.gateway.shutdown();
    this.initialized = false;
  }
}

// تصدير instance واحد
export const mcpAIBridge = new MCPAIBridge();

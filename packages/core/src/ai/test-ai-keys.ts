/**
 * AI API Keys Test
 * اختبار مفاتيح API للذكاء الاصطناعي
 */

import { geminiService } from './services/gemini.service';
import { zaiService } from './services/zai.service';
import { AI_CONFIG } from './config';

export async function testAIKeys(): Promise<{
  gemini: { success: boolean; message: string; details?: any };
  zai: { success: boolean; message: string; details?: any };
}> {
  const results = {
    gemini: { success: false, message: '', details: undefined as any },
    zai: { success: false, message: '', details: undefined as any },
  };

  // اختبار Gemini
  logger.info('[AI Test] جاري اختبار Gemini API...');
  try {
    if (!AI_CONFIG.gemini.apiKey) {
      results.gemini = {
        success: false,
        message: 'مفتاح Gemini API غير موجود في المتغيرات البيئية',
      };
    } else {
      const response = await geminiService.chat([
        {
          role: 'user',
          content: 'قل مرحبا',
        },
      ], {
        temperature: 0.1,
        maxTokens: 50,
      });

      results.gemini = {
        success: true,
        message: 'Gemini API يعمل بنجاح!',
        details: {
          model: response.model,
          response: response.content.substring(0, 100),
          usage: response.usage,
        },
      };
      logger.info('[AI Test] ✅ Gemini API متصل');
    }
  } catch (error) {
    results.gemini = {
      success: false,
      message: error instanceof Error ? error.message : 'خطأ غير معروف',
      details: error,
    };
    logger.error('[AI Test] ❌ خطأ في Gemini:', error);
  }

  // اختبار z.ai
  logger.info('[AI Test] جاري اختبار z.ai API...');
  try {
    if (!AI_CONFIG.zai.apiKey) {
      results.zai = {
        success: false,
        message: 'مفتاح z.ai API غير موجود في المتغيرات البيئية',
      };
    } else {
      const response = await zaiService.chat([
        {
          role: 'user',
          content: 'Say hello',
        },
      ], {
        temperature: 0.1,
        maxTokens: 50,
      });

      results.zai = {
        success: true,
        message: 'z.ai API يعمل بنجاح!',
        details: {
          model: response.model,
          response: response.content.substring(0, 100),
          usage: response.usage,
        },
      };
      logger.info('[AI Test] ✅ z.ai API متصل');
    }
  } catch (error) {
    results.zai = {
      success: false,
      message: error instanceof Error ? error.message : 'خطأ غير معروف',
      details: error,
    };
    logger.error('[AI Test] ❌ خطأ في z.ai:', error);
  }

  return results;
}

// تشغيل الاختبار إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  testAIKeys().then((results) => {
    logger.info('\n=== نتائج اختبار AI APIs ===\n');
    
    logger.info('🤖 Gemini API:');
    logger.info('  النجاح:', results.gemini.success ? '✅' : '❌');
    logger.info('  الرسالة:', results.gemini.message);
    if (results.gemini.details) {
      logger.info('  التفاصيل:', JSON.stringify(results.gemini.details, null, 2));
    }
    
    logger.info('\n🤖 z.ai API:');
    logger.info('  النجاح:', results.zai.success ? '✅' : '❌');
    logger.info('  الرسالة:', results.zai.message);
    if (results.zai.details) {
      logger.info('  التفاصيل:', JSON.stringify(results.zai.details, null, 2));
    }

    const allSuccess = results.gemini.success && results.zai.success;
    process.exit(allSuccess ? 0 : 1);
  });
}

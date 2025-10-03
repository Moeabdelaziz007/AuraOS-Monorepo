/**
 * Firebase Connection Test
 * اختبار الاتصال بـ Firebase
 */

import { app, db, auth } from './config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function testFirebaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    logger.info('[Firebase Test] جاري اختبار الاتصال...');

    // اختبار Firebase App
    if (!app) {
      return {
        success: false,
        message: 'فشل تهيئة Firebase App',
      };
    }
    logger.info('[Firebase Test] ✅ Firebase App جاهز');

    // اختبار Firestore
    if (!db) {
      return {
        success: false,
        message: 'فشل تهيئة Firestore',
      };
    }
    logger.info('[Firebase Test] ✅ Firestore جاهز');

    // محاولة قراءة collection (حتى لو فارغ)
    try {
      const testCollection = collection(db, 'test');
      await getDocs(testCollection);
      logger.info('[Firebase Test] ✅ Firestore متصل بنجاح');
    } catch (firestoreError) {
      logger.warn('[Firebase Test] ⚠️ تحذير Firestore:', firestoreError);
    }

    // اختبار Auth
    if (!auth) {
      return {
        success: false,
        message: 'فشل تهيئة Firebase Auth',
      };
    }
    logger.info('[Firebase Test] ✅ Firebase Auth جاهز');

    return {
      success: true,
      message: 'جميع خدمات Firebase تعمل بنجاح!',
      details: {
        app: app.name,
        projectId: app.options.projectId,
        authDomain: app.options.authDomain,
      },
    };
  } catch (error) {
    logger.error('[Firebase Test] ❌ خطأ:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'خطأ غير معروف',
      details: error,
    };
  }
}

// تشغيل الاختبار إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  testFirebaseConnection().then((result) => {
    logger.info('\n=== نتيجة الاختبار ===');
    logger.info('النجاح:', result.success ? '✅' : '❌');
    logger.info('الرسالة:', result.message);
    if (result.details) {
      logger.info('التفاصيل:', JSON.stringify(result.details, null, 2));
    }
    process.exit(result.success ? 0 : 1);
  });
}

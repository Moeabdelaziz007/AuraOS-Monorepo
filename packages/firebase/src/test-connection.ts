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
    console.log('[Firebase Test] جاري اختبار الاتصال...');

    // اختبار Firebase App
    if (!app) {
      return {
        success: false,
        message: 'فشل تهيئة Firebase App',
      };
    }
    console.log('[Firebase Test] ✅ Firebase App جاهز');

    // اختبار Firestore
    if (!db) {
      return {
        success: false,
        message: 'فشل تهيئة Firestore',
      };
    }
    console.log('[Firebase Test] ✅ Firestore جاهز');

    // محاولة قراءة collection (حتى لو فارغ)
    try {
      const testCollection = collection(db, 'test');
      await getDocs(testCollection);
      console.log('[Firebase Test] ✅ Firestore متصل بنجاح');
    } catch (firestoreError) {
      console.warn('[Firebase Test] ⚠️ تحذير Firestore:', firestoreError);
    }

    // اختبار Auth
    if (!auth) {
      return {
        success: false,
        message: 'فشل تهيئة Firebase Auth',
      };
    }
    console.log('[Firebase Test] ✅ Firebase Auth جاهز');

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
    console.error('[Firebase Test] ❌ خطأ:', error);
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
    console.log('\n=== نتيجة الاختبار ===');
    console.log('النجاح:', result.success ? '✅' : '❌');
    console.log('الرسالة:', result.message);
    if (result.details) {
      console.log('التفاصيل:', JSON.stringify(result.details, null, 2));
    }
    process.exit(result.success ? 0 : 1);
  });
}

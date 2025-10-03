# @auraos/core

الحزمة الأساسية لنظام AuraOS - تحتوي على منطق الأعمال والخدمات الأساسية.

## المحتويات

### 🤖 AI Services
خدمات الذكاء الاصطناعي مع دعم متعدد المزودين:

```typescript
import { aiService, geminiService, zaiService } from '@auraos/core';

// محادثة مع AI
const response = await aiService.chat([
  { role: 'user', content: 'مرحباً' }
]);

// تحسين ملاحظة
const enhanced = await aiService.enhanceNote(
  'محتوى الملاحظة',
  'اجعلها أكثر وضوحاً'
);

// توليد أتمتة
const automation = await aiService.generateAutomation(
  'أرسل تقرير يومي عبر البريد'
);
```

### 🔧 MCP Tools
أدوات Model Context Protocol للتفاعل مع النظام:

```typescript
import { mcpCommands } from '@auraos/core';

// تهيئة النظام
await mcpCommands.initialize();

// أوامر الملفات
await mcpCommands.file.read('/path/to/file.txt');
await mcpCommands.file.write('/path/to/file.txt', 'محتوى');
await mcpCommands.file.list('/path/to/dir');
await mcpCommands.file.search('كلمة البحث', '/path');

// أوامر المحاكي
const code = await mcpCommands.emulator.generate('اطبع مرحبا 5 مرات');
const result = await mcpCommands.emulator.run(code);

// أوامر AI
const analysis = await mcpCommands.ai.analyzeCode(code, 'BASIC');
const fixed = await mcpCommands.ai.fixCode(code, 'خطأ في السطر 10');
const explanation = await mcpCommands.ai.explainCode(code);
```

### 🧠 Learning Loop
نظام التعلم الذكي لتتبع سلوك المستخدم:

```typescript
import { learningLoopService } from '@auraos/core';

// تهيئة
await learningLoopService.initialize(userId);

// تتبع الأنشطة
await learningLoopService.trackAppLaunch('terminal', 'Terminal');
await learningLoopService.trackCommand('ls -la', true);
await learningLoopService.trackAIInteraction(prompt, response, 'gemini', 1500);

// الحصول على الرؤى
const insights = await learningLoopService.getInsights(userId);
const patterns = await learningLoopService.getPatterns(userId);
```

### 🖥️ MCP Servers
خوادم MCP المتاحة:

#### FileSystem Server
```typescript
import { FileSystemMCPServer } from '@auraos/core';

const fsServer = new FileSystemMCPServer('/root/path', maxFileSize);
await fsServer.initialize();

// الأدوات المتاحة:
// - fs_read: قراءة ملف
// - fs_write: كتابة ملف
// - fs_list: عرض محتويات مجلد
// - fs_delete: حذف ملف
// - fs_search: البحث في الملفات
```

#### Emulator Server
```typescript
import { EmulatorControlMCPServer } from '@auraos/core';

const emulatorServer = new EmulatorControlMCPServer();
await emulatorServer.initialize();

// الأدوات المتاحة:
// - emulator_run: تشغيل كود BASIC
// - emulator_step: تنفيذ خطوة واحدة
// - emulator_get_state: الحصول على حالة المحاكي
// - emulator_reset: إعادة تعيين المحاكي
```

## التكوين

### AI Configuration
```typescript
// .env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_ZAI_API_KEY=your_zai_key
```

### MCP Configuration
```typescript
import { MCPGateway } from '@auraos/ai';

const gateway = new MCPGateway({
  enableAuth: false,
  enableLogging: true,
  maxConcurrentRequests: 50,
  timeout: 30000,
});
```

## الاستخدام مع React

```typescript
import { useMCP } from '@auraos/hooks';

function MyComponent() {
  const { file, emulator, ai, loading, error } = useMCP();

  const handleReadFile = async () => {
    const content = await file.read('/path/to/file.txt');
    console.log(content);
  };

  const handleGenerateCode = async () => {
    const code = await emulator.generate('اطبع الأرقام من 1 إلى 10');
    const result = await emulator.run(code);
    console.log(result);
  };

  return (
    <div>
      {loading && <p>جاري التحميل...</p>}
      {error && <p>خطأ: {error}</p>}
      <button onClick={handleReadFile}>قراءة ملف</button>
      <button onClick={handleGenerateCode}>توليد كود</button>
    </div>
  );
}
```

## المزودون المدعومون

### Gemini (Google)
- ✅ Chat (gemini-pro)
- ✅ Vision (gemini-pro-vision)
- ✅ Embeddings (embedding-001)

### z.ai
- ✅ Chat
- ✅ Completion
- ✅ Embeddings

## الترخيص

MIT

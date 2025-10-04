/**
 * SettingsPanel - Settings with AI Integration
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useStudioStore } from '../../stores/StudioStore';
import { Settings, Palette, Globe, Bot } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const { theme, language, aiProvider, setTheme, setLanguage, setAIProvider } = useStudioStore();

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-lg font-semibold">الإعدادات</h2>
        </div>
      </div>
      
      <div className="flex-1 p-6 space-y-6">
        {/* Theme Settings */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium">المظهر</h3>
          </div>
          <div className="flex space-x-2">
            {['light', 'dark', 'auto'].map((t) => (
              <motion.button
                key={t}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(t as any)}
                className={`px-4 py-2 rounded-md text-sm ${
                  theme === t
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t === 'light' ? 'فاتح' : t === 'dark' ? 'داكن' : 'تلقائي'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Language Settings */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium">اللغة</h3>
          </div>
          <div className="flex space-x-2">
            {['ar', 'en'].map((lang) => (
              <motion.button
                key={lang}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLanguage(lang as any)}
                className={`px-4 py-2 rounded-md text-sm ${
                  language === lang
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {lang === 'ar' ? 'العربية' : 'English'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* AI Provider Settings */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium">مقدم الذكاء الاصطناعي</h3>
          </div>
          <div className="flex space-x-2">
            {['openai', 'anthropic', 'local'].map((provider) => (
              <motion.button
                key={provider}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAIProvider(provider as any)}
                className={`px-4 py-2 rounded-md text-sm ${
                  aiProvider === provider
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic' : 'محلي'}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

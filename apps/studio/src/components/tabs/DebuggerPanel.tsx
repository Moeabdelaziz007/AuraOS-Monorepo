/**
 * DebuggerPanel - Debugger with AI Integration
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useStudioStore } from '../../stores/StudioStore';
import { Bug, Play, Square, RotateCcw } from 'lucide-react';

const DebuggerPanel: React.FC = () => {
  const { debugInfo, addDebugInfo } = useStudioStore();

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Bug className="w-5 h-5" />
          <h2 className="text-lg font-semibold">المصحح</h2>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>تشغيل</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
          >
            <Square className="w-4 h-4" />
            <span>إيقاف</span>
          </motion.button>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <p className="text-gray-400">المصحح جاهز للاستخدام</p>
        <p className="text-gray-400">سيتم إضافة المزيد من الميزات قريباً</p>
      </div>
    </div>
  );
};

export default DebuggerPanel;

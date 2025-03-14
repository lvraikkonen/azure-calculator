import React, { useState } from 'react';
import { Settings, X, Check } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { UserSettings as UserSettingsType } from '../../services/storage';

const UserSettings: React.FC = () => {
  const { userSettings, updateUserSettings } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<UserSettingsType>(userSettings);

  // 打开设置弹窗
  const openSettings = () => {
    setTempSettings(userSettings);
    setIsOpen(true);
  };

  // 关闭设置弹窗
  const closeSettings = () => {
    setIsOpen(false);
  };

  // 保存设置
  const saveSettings = () => {
    updateUserSettings(tempSettings);
    setIsOpen(false);
  };

  // 更新临时设置
  const handleSettingChange = (key: keyof UserSettingsType, value: string) => {
    setTempSettings({
      ...tempSettings,
      [key]: value
    });
  };

  return (
    <>
      {/* 设置按钮 */}
      <button
        onClick={openSettings}
        className="flex items-center text-gray-600 hover:text-blue-600"
        aria-label="用户设置"
      >
        <Settings size={20} />
      </button>

      {/* 设置弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">用户设置</h2>
              <button 
                onClick={closeSettings}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              {/* 主题设置 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">界面主题</label>
                <select
                  value={tempSettings.theme || 'light'}
                  onChange={(e) => handleSettingChange('theme', e.target.value as 'light' | 'dark' | 'system')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="light">浅色模式</option>
                  <option value="dark">深色模式</option>
                  <option value="system">跟随系统</option>
                </select>
              </div>

              {/* 货币设置 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">显示货币</label>
                <select
                  value={tempSettings.currency || 'USD'}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="USD">美元 ($)</option>
                  <option value="CNY">人民币 (¥)</option>
                  <option value="EUR">欧元 (€)</option>
                </select>
              </div>

              {/* 语言设置 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">界面语言</label>
                <select
                  value={tempSettings.language || 'zh-CN'}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t">
              <button
                onClick={closeSettings}
                className="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={saveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Check size={16} className="mr-1" />
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSettings;
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getFullDeviceInfo } from '../utils/deviceFingerprint';

/**
 * 設備綁定管理器
 * 負責檢查和綁定員工設備
 */
export function useDeviceBinding(employeeId) {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [binding, setBinding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsBinding, setNeedsBinding] = useState(false);

  useEffect(() => {
    if (employeeId) {
      initializeDevice();
    }
  }, [employeeId]);

  // 初始化設備資訊
  const initializeDevice = async () => {
    try {
      setLoading(true);
      
      // 1. 生成設備指紋
      const info = getFullDeviceInfo();
      setDeviceInfo(info);
      
      // 2. 檢查設備是否已綁定
      const existingBinding = await checkDeviceBinding(employeeId, info.fingerprint);
      
      if (existingBinding) {
        setBinding(existingBinding);
        setNeedsBinding(false);
        
        // 更新最後使用時間
        await updateLastSeen(existingBinding.id);
      } else {
        setNeedsBinding(true);
      }
    } catch (error) {
      console.error('Failed to initialize device:', error);
    } finally {
      setLoading(false);
    }
  };

  // 檢查設備綁定
  const checkDeviceBinding = async (empId, fingerprint) => {
    try {
      const { data, error } = await supabase
        .from('device_bindings')
        .select('*')
        .eq('employee_id', empId)
        .eq('device_fingerprint', fingerprint)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking device binding:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to check device binding:', error);
      return null;
    }
  };

  // 綁定設備
  const bindDevice = async (deviceName = null) => {
    if (!deviceInfo || !employeeId) {
      console.error('Missing device info or employee ID');
      return false;
    }

    try {
      // 設定過期時間：2 週後
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);

      const bindingData = {
        employee_id: employeeId,
        device_fingerprint: deviceInfo.fingerprint,
        device_name: deviceName || `${deviceInfo.browser} on ${deviceInfo.os}`,
        browser: deviceInfo.browser,
        browser_version: deviceInfo.browserVersion,
        os: deviceInfo.os,
        os_version: deviceInfo.osVersion,
        screen_resolution: deviceInfo.resolution,
        timezone: deviceInfo.timezone,
        canvas_hash: deviceInfo.canvas_hash,
        webgl_hash: deviceInfo.webgl_hash,
        audio_hash: deviceInfo.audio_hash,
        fonts_hash: deviceInfo.fonts_hash,
        hardware_concurrency: deviceInfo.hardwareConcurrency,
        device_memory: deviceInfo.deviceMemory,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        trust_level: 100
      };

      const { data, error } = await supabase
        .from('device_bindings')
        .insert(bindingData)
        .select()
        .single();

      if (error) {
        console.error('Error binding device:', error);
        return false;
      }

      setBinding(data);
      setNeedsBinding(false);
      
      console.log('Device bound successfully:', data);
      return true;
    } catch (error) {
      console.error('Failed to bind device:', error);
      return false;
    }
  };

  // 更新最後使用時間
  const updateLastSeen = async (bindingId) => {
    try {
      await supabase
        .from('device_bindings')
        .update({ 
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', bindingId);
    } catch (error) {
      console.error('Failed to update last seen:', error);
    }
  };

  // 解除設備綁定
  const unbindDevice = async (bindingId) => {
    try {
      const { error } = await supabase
        .from('device_bindings')
        .update({ is_active: false })
        .eq('id', bindingId);

      if (error) {
        console.error('Error unbinding device:', error);
        return false;
      }

      setBinding(null);
      setNeedsBinding(true);
      return true;
    } catch (error) {
      console.error('Failed to unbind device:', error);
      return false;
    }
  };

  // 獲取員工的所有綁定設備
  const getEmployeeDevices = async (empId) => {
    try {
      const { data, error } = await supabase
        .from('device_bindings')
        .select('*')
        .eq('employee_id', empId)
        .eq('is_active', true)
        .order('last_seen_at', { ascending: false });

      if (error) {
        console.error('Error getting employee devices:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get employee devices:', error);
      return [];
    }
  };

  return {
    deviceInfo,
    binding,
    loading,
    needsBinding,
    bindDevice,
    unbindDevice,
    getEmployeeDevices
  };
}

// 設備綁定提示組件
export function DeviceBindingPrompt({ onBind, onSkip }) {
  const [deviceName, setDeviceName] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            綁定此設備
          </h2>
          <p className="text-gray-600">
            綁定後，此設備可在 2 週內免登入使用
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            設備名稱（選填）
          </label>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="例如：我的筆電、辦公室電腦"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onBind(deviceName || null)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            綁定設備
          </button>
          <button
            onClick={onSkip}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all"
          >
            暫不綁定
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          綁定設備可提升安全性，防止未授權訪問
        </p>
      </div>
    </div>
  );
}

export default useDeviceBinding;

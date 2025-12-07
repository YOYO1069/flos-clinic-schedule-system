/**
 * 設備指紋生成器
 * 參考 browserscan.net 技術實作
 */

// 簡單的 hash 函數
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Canvas 指紋
export function generateCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    // 繪製文字
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('FLOS Clinic 🏥', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Security System', 4, 30);
    
    // 生成 hash
    const dataURL = canvas.toDataURL();
    return hashCode(dataURL);
  } catch (e) {
    console.error('Canvas fingerprint error:', e);
    return 'canvas_error';
  }
}

// WebGL 指紋
export function generateWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return 'webgl_not_supported';
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return hashCode(vendor + '|' + renderer);
    }
    
    return hashCode('webgl_basic');
  } catch (e) {
    console.error('WebGL fingerprint error:', e);
    return 'webgl_error';
  }
}

// Audio 指紋
export function generateAudioFingerprint() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return 'audio_not_supported';
    }
    
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
    
    gainNode.gain.value = 0; // 靜音
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(0);
    
    // 簡化版：使用基本參數生成指紋
    const fingerprint = `${context.sampleRate}_${analyser.fftSize}`;
    
    oscillator.stop();
    context.close();
    
    return hashCode(fingerprint);
  } catch (e) {
    console.error('Audio fingerprint error:', e);
    return 'audio_error';
  }
}

// 字體指紋
export function generateFontsFingerprint() {
  try {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New',
      'Georgia', 'Palatino', 'Garamond', 'Bookman',
      'Comic Sans MS', 'Trebuchet MS', 'Impact'
    ];
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const text = 'mmmmmmmmmmlli';
    
    const baseFontWidths = {};
    baseFonts.forEach(baseFont => {
      ctx.font = `72px ${baseFont}`;
      baseFontWidths[baseFont] = ctx.measureText(text).width;
    });
    
    const detectedFonts = [];
    testFonts.forEach(font => {
      baseFonts.forEach(baseFont => {
        ctx.font = `72px ${font}, ${baseFont}`;
        const width = ctx.measureText(text).width;
        if (width !== baseFontWidths[baseFont]) {
          if (!detectedFonts.includes(font)) {
            detectedFonts.push(font);
          }
        }
      });
    });
    
    return hashCode(detectedFonts.sort().join(','));
  } catch (e) {
    console.error('Fonts fingerprint error:', e);
    return 'fonts_error';
  }
}

// 螢幕資訊
export function getScreenInfo() {
  return {
    resolution: `${window.screen.width}x${window.screen.height}`,
    availableResolution: `${window.screen.availWidth}x${window.screen.availHeight}`,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth
  };
}

// 硬體資訊
export function getHardwareInfo() {
  return {
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: navigator.deviceMemory || 0,
    maxTouchPoints: navigator.maxTouchPoints || 0
  };
}

// 瀏覽器資訊
export function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';
  let os = 'Unknown';
  let osVersion = 'Unknown';
  
  // 檢測瀏覽器
  if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browser = 'Safari';
    version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edg') > -1) {
    browser = 'Edge';
    version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }
  
  // 檢測作業系統
  if (ua.indexOf('Win') > -1) {
    os = 'Windows';
    if (ua.indexOf('Windows NT 10.0') > -1) osVersion = '10/11';
    else if (ua.indexOf('Windows NT 6.3') > -1) osVersion = '8.1';
    else if (ua.indexOf('Windows NT 6.2') > -1) osVersion = '8';
    else if (ua.indexOf('Windows NT 6.1') > -1) osVersion = '7';
  } else if (ua.indexOf('Mac') > -1) {
    os = 'macOS';
    osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
  } else if (ua.indexOf('Linux') > -1) {
    os = 'Linux';
  } else if (ua.indexOf('Android') > -1) {
    os = 'Android';
    osVersion = ua.match(/Android (\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
    os = 'iOS';
    osVersion = ua.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
  }
  
  return {
    userAgent: ua,
    browser,
    browserVersion: version,
    os,
    osVersion,
    deviceVendor: navigator.vendor || 'Unknown',
    platform: navigator.platform || 'Unknown'
  };
}

// 軟體資訊
export function getSoftwareInfo() {
  return {
    languages: navigator.languages || [navigator.language],
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    doNotTrack: navigator.doNotTrack || 'unspecified',
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  };
}

// 生成完整設備指紋
export function generateDeviceFingerprint() {
  const canvas = generateCanvasFingerprint();
  const webgl = generateWebGLFingerprint();
  const audio = generateAudioFingerprint();
  const fonts = generateFontsFingerprint();
  const screen = getScreenInfo();
  const hardware = getHardwareInfo();
  
  // 組合所有指紋
  const combinedFingerprint = [
    canvas,
    webgl,
    audio,
    fonts,
    screen.resolution,
    hardware.hardwareConcurrency,
    hardware.deviceMemory
  ].join('|');
  
  return hashCode(combinedFingerprint);
}

// 獲取完整設備資訊
export function getFullDeviceInfo() {
  return {
    fingerprint: generateDeviceFingerprint(),
    canvas_hash: generateCanvasFingerprint(),
    webgl_hash: generateWebGLFingerprint(),
    audio_hash: generateAudioFingerprint(),
    fonts_hash: generateFontsFingerprint(),
    ...getScreenInfo(),
    ...getHardwareInfo(),
    ...getBrowserInfo(),
    ...getSoftwareInfo()
  };
}

// 檢測是否為無痕模式（簡化版）
export async function detectIncognito() {
  try {
    // 方法 1: 檢查 localStorage
    if (!window.localStorage) {
      return true;
    }
    
    // 方法 2: 檢查 indexedDB
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { quota } = await navigator.storage.estimate();
      // 無痕模式通常有較小的配額
      if (quota < 120000000) {
        return true;
      }
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

export default {
  generateDeviceFingerprint,
  getFullDeviceInfo,
  generateCanvasFingerprint,
  generateWebGLFingerprint,
  generateAudioFingerprint,
  generateFontsFingerprint,
  getScreenInfo,
  getHardwareInfo,
  getBrowserInfo,
  getSoftwareInfo,
  detectIncognito
};

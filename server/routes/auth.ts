import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// CHILL69YO 資料庫連線（用於驗證）
const supabaseCHILL = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// duolaiyuanmeng 資料庫連線（用於同步）
const supabaseDuolai = createClient(
  process.env.SUPABASE_DUOLAI_URL || '',
  process.env.SUPABASE_DUOLAI_KEY || ''
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * 統一登入端點
 * POST /api/auth/unified-login
 */
router.post('/unified-login', async (req, res) => {
  try {
    const { employee_id, password } = req.body;

    if (!employee_id || !password) {
      return res.status(400).json({ message: '請提供員工編號和密碼' });
    }

    // 從 CHILL69YO.users 查詢員工
    const { data: employee, error } = await supabaseCHILL
      .from('users')
      .select('*')
      .eq('employee_id', employee_id)
      .single();

    if (error || !employee) {
      return res.status(401).json({ message: '員工編號或密碼錯誤' });
    }

    // 驗證密碼（使用 bcrypt）
    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: '員工編號或密碼錯誤' });
    }

    // 生成 JWT token
    const token = jwt.sign(
      {
        id: employee.id,
        employee_id: employee.employee_id,
        name: employee.name,
        role: employee.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 記錄登入日誌
    await supabaseCHILL.from('login_logs').insert({
      employee_id: employee.employee_id,
      name: employee.name,
      login_time: new Date().toISOString(),
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    // 返回用戶資訊和 token
    res.json({
      success: true,
      token,
      user: {
        id: employee.id,
        employee_id: employee.employee_id,
        name: employee.name,
        role: employee.role,
        password_changed: employee.password_changed,
      },
    });
  } catch (error) {
    console.error('Unified login error:', error);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
});

/**
 * 修改密碼端點（同步到兩個資料庫）
 * POST /api/auth/change-password
 */
router.post('/change-password', async (req, res) => {
  try {
    const { employee_id, old_password, new_password } = req.body;

    if (!employee_id || !old_password || !new_password) {
      return res.status(400).json({ message: '請提供完整資訊' });
    }

    // 驗證舊密碼
    const { data: employee, error } = await supabaseCHILL
      .from('users')
      .select('*')
      .eq('employee_id', employee_id)
      .single();

    if (error || !employee) {
      return res.status(404).json({ message: '員工不存在' });
    }

    const isOldPasswordValid = await bcrypt.compare(old_password, employee.password);

    if (!isOldPasswordValid) {
      return res.status(401).json({ message: '舊密碼錯誤' });
    }

    // 加密新密碼
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // 更新 CHILL69YO.users
    const { error: updateError1 } = await supabaseCHILL
      .from('users')
      .update({
        password: hashedPassword,
        password_changed: true,
      })
      .eq('employee_id', employee_id);

    if (updateError1) {
      throw new Error('更新 CHILL69YO 密碼失敗');
    }

    // 同步到 duolaiyuanmeng.users
    const { error: updateError2 } = await supabaseDuolai
      .from('users')
      .update({
        password: hashedPassword,
        password_changed: true,
      })
      .eq('employee_id', employee_id);

    if (updateError2) {
      console.warn('同步到 duolaiyuanmeng 失敗:', updateError2);
      // 不阻止主要操作，只記錄警告
    }

    res.json({
      success: true,
      message: '密碼修改成功',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
});

/**
 * 驗證 token
 * GET /api/auth/verify
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: '未提供 token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // 從資料庫查詢最新的用戶資訊
    const { data: employee, error } = await supabaseCHILL
      .from('users')
      .select('*')
      .eq('employee_id', decoded.employee_id)
      .single();

    if (error || !employee) {
      return res.status(401).json({ message: 'Token 無效' });
    }

    res.json({
      success: true,
      user: {
        id: employee.id,
        employee_id: employee.employee_id,
        name: employee.name,
        role: employee.role,
        password_changed: employee.password_changed,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Token 無效或已過期' });
  }
});

export default router;

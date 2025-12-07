import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

// CHILL69YO 資料庫連線
const supabaseCHILL = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// duolaiyuanmeng 資料庫連線
const supabaseDuolai = createClient(
  process.env.SUPABASE_DUOLAI_URL || '',
  process.env.SUPABASE_DUOLAI_KEY || ''
);

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    // 統一登入（使用 duolaiyuanmeng.users）
    unifiedLogin: publicProcedure
      .input(z.object({
        employee_id: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { employee_id, password } = input;

        // 從 duolaiyuanmeng.users 查詢員工
        const { data: user, error } = await supabaseDuolai
          .from('users')
          .select('*')
          .eq('employee_id', employee_id)
          .single();

        if (error || !user) {
          throw new Error('員工編號或密碼錯誤');
        }

        // 驗證密碼
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('員工編號或密碼錯誤');
        }

        // 記錄登入日誌（記錄到 duolaiyuanmeng）
        try {
          await supabaseDuolai.from('login_logs').insert({
            employee_id: user.employee_id,
            name: user.name,
            role: user.role,
            login_time: new Date().toISOString(),
            success: true,
          });
        } catch (logError) {
          console.warn('登入日誌記錄失敗:', logError);
        }

        return {
          success: true,
          user: {
            id: user.id,
            employee_id: user.employee_id,
            name: user.name,
            role: user.role,
            password_changed: user.password_changed,
          },
        };
      }),
    
    // 修改密碼（使用 duolaiyuanmeng.users 作為主要資料庫）
    changePassword: publicProcedure
      .input(z.object({
        employee_id: z.string(),
        old_password: z.string(),
        new_password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { employee_id, old_password, new_password } = input;

        // 從 duolaiyuanmeng.users 驗證舊密碼
        const { data: user, error } = await supabaseDuolai
          .from('users')
          .select('*')
          .eq('employee_id', employee_id)
          .single();

        if (error || !user) {
          throw new Error('員工不存在');
        }

        const isOldPasswordValid = await bcrypt.compare(old_password, user.password);

        if (!isOldPasswordValid) {
          throw new Error('舊密碼錯誤');
        }

        // 加密新密碼
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // 更新 duolaiyuanmeng.users
        await supabaseDuolai
          .from('users')
          .update({
            password: hashedPassword,
            password_changed: true,
          })
          .eq('employee_id', employee_id);

        return {
          success: true,
          message: '密碼修改成功',
        };
      }),
    
    // 管理員重設密碼（使用 duolaiyuanmeng.users）
    resetPassword: publicProcedure
      .input(z.object({
        admin_employee_id: z.string(),
        target_employee_id: z.string(),
        new_password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { admin_employee_id, target_employee_id, new_password } = input;

        // 驗證管理員權限
        const { data: admin, error: adminError } = await supabaseDuolai
          .from('users')
          .select('*')
          .eq('employee_id', admin_employee_id)
          .single();

        if (adminError || !admin || admin.role !== 'admin') {
          throw new Error('權限不足，僅管理員可以重設密碼');
        }

        // 驗證目標員工是否存在
        const { data: targetUser, error: targetError } = await supabaseDuolai
          .from('users')
          .select('*')
          .eq('employee_id', target_employee_id)
          .single();

        if (targetError || !targetUser) {
          throw new Error('目標員工不存在');
        }

        // 加密新密碼
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // 更新 duolaiyuanmeng.users
        await supabaseDuolai
          .from('users')
          .update({
            password: hashedPassword,
            password_changed: false,
          })
          .eq('employee_id', target_employee_id);

        return {
          success: true,
          message: `已重設 ${targetUser.name} 的密碼`,
        };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;

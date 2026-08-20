"use server";

import { prisma } from "@/libs/prisma";
import { signupRequestSchema } from "@/app/_types/SignupRequest";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { SignupRequest } from "@/app/_types/SignupRequest";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ServerActionResponse } from "@/app/_types/ServerActionResponse";
import bcrypt from "bcryptjs";

// ユーザのサインアップのサーバアクション
export const signupServerAction = async (
  signupRequest: SignupRequest,
): Promise<ServerActionResponse<UserProfile | null>> => {
  try {
    const payload = signupRequestSchema.parse(signupRequest);

    // 💡スパム登録対策（1秒遅延）
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 既に登録済みユーザのサインアップではないか確認
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) {
      // 💀 このアカウントがシステムに存在することを知らせてしまうことになる。
      // 認証メールを送信するなどの方法が望ましい
      return {
        success: false,
        payload: null,
        message: "このメールアドレスは既に使用されています。",
      };
    }
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // ユーザの作成
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        name: payload.name,
      },
    });

    // レスポンスの生成
    // 💀 パスワードは無論、不要な情報はレスポンスしない。
    const res: ServerActionResponse<UserProfile> = {
      success: true,
      payload: userProfileSchema.parse(user), // 余分なプロパティを削除,
      message: "",
    };
    return res;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    return {
      success: false,
      payload: null,
      message: "サインアップのサーバーサイドの処理に失敗しました",
    };
  }
};

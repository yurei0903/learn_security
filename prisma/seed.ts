// 実行は npx prisma db seed (prisma.config.ts にコマンド定義されている)
// 実行結果は npx prisma studio で確認可能
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { prisma } from "@/libs/prisma";
import { Role, Region } from "@/generated/prisma/enums";
import { UserSeed, userSeedSchema } from "../src/app/_types/UserSeed";
const SOLT = 10;
const main = async () => {
  console.log("Seeding database...");

  // テスト用のユーザ情報の「種」となる userSeeds を作成
  const userSeeds: UserSeed[] = [
    {
      name: "高負荷 耐子",
      password: await bcrypt.hash("password1111", SOLT),
      email: "admin01@example.com",
      role: Role.ADMIN,
    },
    {
      name: "不具合 直志",
      password: await bcrypt.hash("password2222", SOLT),
      email: "admin02@example.com",
      role: Role.ADMIN,
    },
    {
      name: "構文 誤次郎",
      password: await bcrypt.hash("password1111", SOLT),
      email: "user01@example.com",
      role: Role.USER,
      aboutSlug: "gojiro",
      aboutContent: "構文誤次郎です。<br>よろしくお願いします。",
    },
    {
      name: "仕様 曖昧子",
      password: await bcrypt.hash("password2222", SOLT),
      email: "user02@example.com",
      role: Role.USER,
      aboutSlug: "aimaiko",
      aboutContent: "仕様曖昧子と申します。仲良くしてください。",
    },
  ];

  // userSeedSchema を使って UserSeeds のバリデーション
  try {
    await Promise.all(
      userSeeds.map(async (userSeed, index) => {
        const result = userSeedSchema.safeParse(userSeed);
        if (result.success) return;
        console.error(
          `Validation error in record ${index}:\n${JSON.stringify(userSeed, null, 2)}`,
        );
        console.error("▲▲▲ Validation errors ▲▲▲");
        console.error(
          JSON.stringify(result.error.flatten().fieldErrors, null, 2),
        );
        throw new Error(`Validation failed at record ${index}`);
      }),
    );
  } catch (error) {
    throw error;
  }

  // 各テーブルの全レコードを削除
  await prisma.user.deleteMany();
  await prisma.session.deleteMany();

  // ユーザ（user）テーブルにテストデータを挿入
  await prisma.user.createMany({
    data: userSeeds.map((userSeed) => ({
      id: uuid(),
      name: userSeed.name,
      password: userSeed.password,
      role: userSeed.role,
      email: userSeed.email,
      aboutSlug: userSeed.aboutSlug || null,
      aboutContent: userSeed.aboutContent || "",
    })),
  });
};

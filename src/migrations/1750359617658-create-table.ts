import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTable1750359617658 implements MigrationInterface {
    name = 'CreateTable1750359617658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar(255) NOT NULL, "lastName" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "password" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "hashtags" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tag" varchar(255) NOT NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0b4ef8e83392129fb3373fdb3a" ON "hashtags" ("tag") `);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text(3000) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userIdId" integer)`);
        await queryRunner.query(`CREATE TABLE "likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "likedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_74b9b8cd79a1014e50135f266f" ON "likes" ("userId", "postId") `);
        await queryRunner.query(`CREATE TABLE "follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "followedAt" datetime NOT NULL DEFAULT (datetime('now')), "unfollowedAt" datetime, "followerId" integer, "followingId" integer)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_105079775692df1f8799ed0fac" ON "follows" ("followerId", "followingId") `);
        await queryRunner.query(`CREATE TABLE "activities" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "reference_id" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`);
        await queryRunner.query(`CREATE INDEX "IDX_bbe617daf59c7445c7e988f1ec" ON "activities" ("userId", "createdAt") `);
        await queryRunner.query(`CREATE TABLE "posts_hashtags_hashtags" ("postsId" integer NOT NULL, "hashtagsId" integer NOT NULL, PRIMARY KEY ("postsId", "hashtagsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c52d9ed78d930e7dc28c5a93cf" ON "posts_hashtags_hashtags" ("postsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4664ee7d5459af42a58502b413" ON "posts_hashtags_hashtags" ("hashtagsId") `);
        await queryRunner.query(`CREATE TABLE "temporary_posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text(3000) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userIdId" integer, CONSTRAINT "FK_869a05340ed4bc3b904ed040206" FOREIGN KEY ("userIdId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_posts"("id", "content", "createdAt", "userIdId") SELECT "id", "content", "createdAt", "userIdId" FROM "posts"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(`DROP INDEX "IDX_74b9b8cd79a1014e50135f266f"`);
        await queryRunner.query(`CREATE TABLE "temporary_likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "likedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer, CONSTRAINT "FK_cfd8e81fac09d7339a32e57d904" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_likes"("id", "likedAt", "userId", "postId") SELECT "id", "likedAt", "userId", "postId" FROM "likes"`);
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`ALTER TABLE "temporary_likes" RENAME TO "likes"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_74b9b8cd79a1014e50135f266f" ON "likes" ("userId", "postId") `);
        await queryRunner.query(`DROP INDEX "IDX_105079775692df1f8799ed0fac"`);
        await queryRunner.query(`CREATE TABLE "temporary_follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "followedAt" datetime NOT NULL DEFAULT (datetime('now')), "unfollowedAt" datetime, "followerId" integer, "followingId" integer, CONSTRAINT "FK_fdb91868b03a2040db408a53331" FOREIGN KEY ("followerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_ef463dd9a2ce0d673350e36e0fb" FOREIGN KEY ("followingId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_follows"("id", "followedAt", "unfollowedAt", "followerId", "followingId") SELECT "id", "followedAt", "unfollowedAt", "followerId", "followingId" FROM "follows"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`ALTER TABLE "temporary_follows" RENAME TO "follows"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_105079775692df1f8799ed0fac" ON "follows" ("followerId", "followingId") `);
        await queryRunner.query(`DROP INDEX "IDX_bbe617daf59c7445c7e988f1ec"`);
        await queryRunner.query(`CREATE TABLE "temporary_activities" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "reference_id" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, CONSTRAINT "FK_5a2cfe6f705df945b20c1b22c71" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_activities"("id", "type", "reference_id", "createdAt", "userId") SELECT "id", "type", "reference_id", "createdAt", "userId" FROM "activities"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`ALTER TABLE "temporary_activities" RENAME TO "activities"`);
        await queryRunner.query(`CREATE INDEX "IDX_bbe617daf59c7445c7e988f1ec" ON "activities" ("userId", "createdAt") `);
        await queryRunner.query(`DROP INDEX "IDX_c52d9ed78d930e7dc28c5a93cf"`);
        await queryRunner.query(`DROP INDEX "IDX_4664ee7d5459af42a58502b413"`);
        await queryRunner.query(`CREATE TABLE "temporary_posts_hashtags_hashtags" ("postsId" integer NOT NULL, "hashtagsId" integer NOT NULL, CONSTRAINT "FK_c52d9ed78d930e7dc28c5a93cff" FOREIGN KEY ("postsId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_4664ee7d5459af42a58502b4139" FOREIGN KEY ("hashtagsId") REFERENCES "hashtags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("postsId", "hashtagsId"))`);
        await queryRunner.query(`INSERT INTO "temporary_posts_hashtags_hashtags"("postsId", "hashtagsId") SELECT "postsId", "hashtagsId" FROM "posts_hashtags_hashtags"`);
        await queryRunner.query(`DROP TABLE "posts_hashtags_hashtags"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts_hashtags_hashtags" RENAME TO "posts_hashtags_hashtags"`);
        await queryRunner.query(`CREATE INDEX "IDX_c52d9ed78d930e7dc28c5a93cf" ON "posts_hashtags_hashtags" ("postsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4664ee7d5459af42a58502b413" ON "posts_hashtags_hashtags" ("hashtagsId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_4664ee7d5459af42a58502b413"`);
        await queryRunner.query(`DROP INDEX "IDX_c52d9ed78d930e7dc28c5a93cf"`);
        await queryRunner.query(`ALTER TABLE "posts_hashtags_hashtags" RENAME TO "temporary_posts_hashtags_hashtags"`);
        await queryRunner.query(`CREATE TABLE "posts_hashtags_hashtags" ("postsId" integer NOT NULL, "hashtagsId" integer NOT NULL, PRIMARY KEY ("postsId", "hashtagsId"))`);
        await queryRunner.query(`INSERT INTO "posts_hashtags_hashtags"("postsId", "hashtagsId") SELECT "postsId", "hashtagsId" FROM "temporary_posts_hashtags_hashtags"`);
        await queryRunner.query(`DROP TABLE "temporary_posts_hashtags_hashtags"`);
        await queryRunner.query(`CREATE INDEX "IDX_4664ee7d5459af42a58502b413" ON "posts_hashtags_hashtags" ("hashtagsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c52d9ed78d930e7dc28c5a93cf" ON "posts_hashtags_hashtags" ("postsId") `);
        await queryRunner.query(`DROP INDEX "IDX_bbe617daf59c7445c7e988f1ec"`);
        await queryRunner.query(`ALTER TABLE "activities" RENAME TO "temporary_activities"`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "reference_id" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`);
        await queryRunner.query(`INSERT INTO "activities"("id", "type", "reference_id", "createdAt", "userId") SELECT "id", "type", "reference_id", "createdAt", "userId" FROM "temporary_activities"`);
        await queryRunner.query(`DROP TABLE "temporary_activities"`);
        await queryRunner.query(`CREATE INDEX "IDX_bbe617daf59c7445c7e988f1ec" ON "activities" ("userId", "createdAt") `);
        await queryRunner.query(`DROP INDEX "IDX_105079775692df1f8799ed0fac"`);
        await queryRunner.query(`ALTER TABLE "follows" RENAME TO "temporary_follows"`);
        await queryRunner.query(`CREATE TABLE "follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "followedAt" datetime NOT NULL DEFAULT (datetime('now')), "unfollowedAt" datetime, "followerId" integer, "followingId" integer)`);
        await queryRunner.query(`INSERT INTO "follows"("id", "followedAt", "unfollowedAt", "followerId", "followingId") SELECT "id", "followedAt", "unfollowedAt", "followerId", "followingId" FROM "temporary_follows"`);
        await queryRunner.query(`DROP TABLE "temporary_follows"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_105079775692df1f8799ed0fac" ON "follows" ("followerId", "followingId") `);
        await queryRunner.query(`DROP INDEX "IDX_74b9b8cd79a1014e50135f266f"`);
        await queryRunner.query(`ALTER TABLE "likes" RENAME TO "temporary_likes"`);
        await queryRunner.query(`CREATE TABLE "likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "likedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer)`);
        await queryRunner.query(`INSERT INTO "likes"("id", "likedAt", "userId", "postId") SELECT "id", "likedAt", "userId", "postId" FROM "temporary_likes"`);
        await queryRunner.query(`DROP TABLE "temporary_likes"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_74b9b8cd79a1014e50135f266f" ON "likes" ("userId", "postId") `);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text(3000) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userIdId" integer)`);
        await queryRunner.query(`INSERT INTO "posts"("id", "content", "createdAt", "userIdId") SELECT "id", "content", "createdAt", "userIdId" FROM "temporary_posts"`);
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`DROP INDEX "IDX_4664ee7d5459af42a58502b413"`);
        await queryRunner.query(`DROP INDEX "IDX_c52d9ed78d930e7dc28c5a93cf"`);
        await queryRunner.query(`DROP TABLE "posts_hashtags_hashtags"`);
        await queryRunner.query(`DROP INDEX "IDX_bbe617daf59c7445c7e988f1ec"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP INDEX "IDX_105079775692df1f8799ed0fac"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`DROP INDEX "IDX_74b9b8cd79a1014e50135f266f"`);
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP INDEX "IDX_0b4ef8e83392129fb3373fdb3a"`);
        await queryRunner.query(`DROP TABLE "hashtags"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}

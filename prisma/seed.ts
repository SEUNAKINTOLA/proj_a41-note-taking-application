import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// bcrypt work factor used for all seeded passwords.
const BCRYPT_COST = 12;

// Shared plaintext password for every seeded user (development only).
const SEED_PASSWORD = 'Password123!';

// Folder names created for each user, in order.
const FOLDER_NAMES = ['Travel', 'Daily Life', 'Work', 'Family', 'Hobbies'];

const USERS_COUNT = 3;
const VLOGS_PER_USER = 10;

/**
 * Builds a deterministic, format-valid UUID from two integer seeds so that
 * reseeding always produces the same primary keys (stable across runs).
 */
const fixedUuid = (group: number, index: number): string => {
  const hex = (value: number, length: number): string =>
    (value >>> 0)
      .toString(16)
      .padStart(length, '0')
      .slice(-length);

  return [
    hex(group * 100003 + index, 8),
    hex(index, 4),
    `4${hex(group, 3)}`,
    `8${hex(index, 3)}`,
    hex(group * 1000000 + index, 12),
  ].join('-');
};

async function main(): Promise<void> {
  // Clear existing data in dependency order (vlogs reference folders and users,
  // folders reference users) so foreign-key constraints are respected.
  await prisma.vlog.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_COST);

  for (let userIndex = 0; userIndex < USERS_COUNT; userIndex += 1) {
    const userId = fixedUuid(1, userIndex);

    await prisma.user.create({
      data: {
        id: userId,
        email: `user${userIndex + 1}@example.com`,
        password_hash: passwordHash,
      },
    });

    // Create one folder per configured name for this user.
    const folderIds: string[] = [];
    for (let folderIndex = 0; folderIndex < FOLDER_NAMES.length; folderIndex += 1) {
      const folderId = fixedUuid(2, userIndex * FOLDER_NAMES.length + folderIndex);
      folderIds.push(folderId);

      await prisma.folder.create({
        data: {
          id: folderId,
          user_id: userId,
          name: FOLDER_NAMES[folderIndex],
          sort_order: folderIndex,
        },
      });
    }

    // Create vlogs with placeholder media URLs and deterministic folder assignment.
    for (let vlogIndex = 0; vlogIndex < VLOGS_PER_USER; vlogIndex += 1) {
      const vlogId = fixedUuid(3, userIndex * VLOGS_PER_USER + vlogIndex);
      const assignedFolderId = folderIds[(userIndex * 7 + vlogIndex * 3) % folderIds.length];

      await prisma.vlog.create({
        data: {
          id: vlogId,
          user_id: userId,
          folder_id: assignedFolderId,
          title: `Vlog ${vlogIndex + 1} by user ${userIndex + 1}`,
          description: `Sample vlog #${vlogIndex + 1} for user ${userIndex + 1} used for development and testing.`,
          video_url: `https://example.com/video-${vlogId}.mp4`,
          thumbnail_url: `https://example.com/thumbnail-${vlogId}.jpg`,
        },
      });
    }
  }

  const userTotal = USERS_COUNT;
  const folderTotal = USERS_COUNT * FOLDER_NAMES.length;
  const vlogTotal = USERS_COUNT * VLOGS_PER_USER;
  console.log(
    `Seed complete: ${userTotal} users, ${folderTotal} folders, ${vlogTotal} vlogs created.`,
  );
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

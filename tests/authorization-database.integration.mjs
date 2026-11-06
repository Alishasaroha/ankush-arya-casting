import "dotenv/config";

import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

import { buildAccessibleTalentProfileWhere } from "../src/lib/server/auth/authorization-queries.ts";
import { resolveTalentProfileAccess } from "../src/lib/server/auth/authorization-policy.ts";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    "Set TEST_DATABASE_URL to a dedicated PostgreSQL test database before running integration tests.",
  );
}

const testUrl = new URL(testDatabaseUrl);
const testDatabaseName = decodeURIComponent(testUrl.pathname.replace(/^\/+/, ""));

if (!/test/i.test(testDatabaseName)) {
  throw new Error(
    "Safety check failed: TEST_DATABASE_URL database name must contain 'test'. Use a separate database such as ankush_arya_casting_test.",
  );
}

if (process.env.DATABASE_URL) {
  const developmentUrl = new URL(process.env.DATABASE_URL);
  const sameDatabase =
    developmentUrl.hostname === testUrl.hostname &&
    developmentUrl.port === testUrl.port &&
    decodeURIComponent(developmentUrl.pathname) === decodeURIComponent(testUrl.pathname);

  if (sameDatabase) {
    throw new Error(
      "Safety check failed: TEST_DATABASE_URL points to the same database as DATABASE_URL.",
    );
  }
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: testDatabaseUrl }),
});

const fixtureTag = randomUUID();
const fixtureEmails = [];
const fixtureProfileIds = [];
const fixtureUserIds = [];
const fixture = {};

async function createUser(roleName, label) {
  const email = `integration-${label}-${fixtureTag}@example.invalid`;
  fixtureEmails.push(email);

  const user = await prisma.user.create({
    data: {
      email,
      fullName: `Integration ${label}`,
      passwordHash: "not-a-real-password-hash",
      emailVerifiedAt: new Date(),
    },
    select: { id: true, email: true, fullName: true },
  });

  fixtureUserIds.push(user.id);

  const role = await prisma.role.upsert({
    where: { name: roleName },
    update: {},
    create: { name: roleName },
  });

  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id },
  });

  return user;
}

async function createProfile(data) {
  const profile = await prisma.talentProfile.create({
    data,
    select: { id: true, fullName: true, ownerUserId: true, primaryGuardianUserId: true },
  });

  fixtureProfileIds.push(profile.id);
  return profile;
}

before(async () => {
  await prisma.$connect();

  fixture.owner = await createUser("TALENT", "owner");
  fixture.guardian = await createUser("GUARDIAN", "guardian");
  fixture.managerActive = await createUser("MANAGER", "manager-active");
  fixture.managerRevoked = await createUser("MANAGER", "manager-revoked");
  fixture.managerNoGrant = await createUser("MANAGER", "manager-no-grant");
  fixture.otherTalent = await createUser("TALENT", "other-talent");
  fixture.admin = await createUser("ADMIN", "admin");

  fixture.ownedProfile = await createProfile({
    fullName: "Integration Owned Profile",
    ownerUserId: fixture.owner.id,
  });

  fixture.childProfile = await createProfile({
    fullName: "Integration Guardian Child",
    primaryGuardianUserId: fixture.guardian.id,
    guardianRelationship: "Parent",
    guardianConsentAt: new Date(),
  });

  await prisma.managerAccessGrant.create({
    data: {
      talentProfileId: fixture.ownedProfile.id,
      managerUserId: fixture.managerActive.id,
      grantedByUserId: fixture.owner.id,
    },
  });

  await prisma.managerAccessGrant.create({
    data: {
      talentProfileId: fixture.ownedProfile.id,
      managerUserId: fixture.managerRevoked.id,
      grantedByUserId: fixture.owner.id,
      revokedAt: new Date(),
      revokedByUserId: fixture.owner.id,
    },
  });

  await prisma.talentProfilePhoto.create({
    data: {
      talentProfileId: fixture.ownedProfile.id,
      url: "https://example.invalid/integration-photo.jpg",
      altText: "Integration test photo",
      sortOrder: 0,
    },
  });
});

after(async () => {
  try {
    if (fixtureProfileIds.length > 0 || fixtureUserIds.length > 0) {
      await prisma.managerAccessGrant.deleteMany({
        where: {
          OR: [
            ...(fixtureProfileIds.length ? [{ talentProfileId: { in: fixtureProfileIds } }] : []),
            ...(fixtureUserIds.length ? [{ managerUserId: { in: fixtureUserIds } }] : []),
            ...(fixtureUserIds.length ? [{ grantedByUserId: { in: fixtureUserIds } }] : []),
            ...(fixtureUserIds.length ? [{ revokedByUserId: { in: fixtureUserIds } }] : []),
          ],
        },
      });
    }

    if (fixtureProfileIds.length > 0) {
      await prisma.talentProfile.deleteMany({
        where: { id: { in: fixtureProfileIds } },
      });
    }

    if (fixtureEmails.length > 0) {
      await prisma.user.deleteMany({
        where: { email: { in: fixtureEmails } },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});

async function listFor(user) {
  return prisma.talentProfile.findMany({
    where: buildAccessibleTalentProfileWhere(user),
    select: { id: true, fullName: true },
  });
}

test("PostgreSQL ownership and guardian relations scope account profile lists", async () => {
  const ownerProfiles = await listFor({
    userId: fixture.owner.id,
    roles: ["TALENT"],
  });
  const guardianProfiles = await listFor({
    userId: fixture.guardian.id,
    roles: ["GUARDIAN"],
  });
  const unrelatedProfiles = await listFor({
    userId: fixture.otherTalent.id,
    roles: ["TALENT"],
  });

  assert.deepEqual(ownerProfiles.map((item) => item.id), [fixture.ownedProfile.id]);
  assert.deepEqual(guardianProfiles.map((item) => item.id), [fixture.childProfile.id]);
  assert.deepEqual(unrelatedProfiles, []);
});

test("PostgreSQL admin visibility is agency-wide", async () => {
  const adminProfiles = await listFor({
    userId: fixture.admin.id,
    roles: ["ADMIN"],
  });

  const ids = new Set(adminProfiles.map((item) => item.id));
  assert.equal(ids.has(fixture.ownedProfile.id), true);
  assert.equal(ids.has(fixture.childProfile.id), true);
});

test("PostgreSQL manager relation returns only actively granted profiles", async () => {
  const activeManagerProfiles = await listFor({
    userId: fixture.managerActive.id,
    roles: ["MANAGER"],
  });
  const revokedManagerProfiles = await listFor({
    userId: fixture.managerRevoked.id,
    roles: ["MANAGER"],
  });
  const noGrantManagerProfiles = await listFor({
    userId: fixture.managerNoGrant.id,
    roles: ["MANAGER"],
  });

  assert.deepEqual(activeManagerProfiles.map((item) => item.id), [fixture.ownedProfile.id]);
  assert.deepEqual(revokedManagerProfiles, []);
  assert.deepEqual(noGrantManagerProfiles, []);

  await assert.rejects(
    prisma.managerAccessGrant.create({
      data: {
        talentProfileId: fixture.ownedProfile.id,
        managerUserId: fixture.managerActive.id,
        grantedByUserId: fixture.owner.id,
      },
    }),
    (error) => error && typeof error === "object" && "code" in error && error.code === "P2002",
  );

  const access = resolveTalentProfileAccess(
    { userId: fixture.managerActive.id, roles: ["MANAGER"] },
    fixture.ownedProfile,
    true,
  );

  assert.equal(access?.canRead, true);
  assert.equal(access?.canEdit, false);
  assert.equal(access?.canManageManagerAccess, false);
});

test("PostgreSQL grant creation exposes a profile and revocation removes it", async () => {
  const grant = await prisma.managerAccessGrant.create({
    data: {
      talentProfileId: fixture.ownedProfile.id,
      managerUserId: fixture.managerNoGrant.id,
      grantedByUserId: fixture.owner.id,
    },
    select: { id: true, grantedAt: true, revokedAt: true },
  });

  assert.ok(grant.id);
  assert.equal(grant.revokedAt, null);

  const afterGrant = await listFor({
    userId: fixture.managerNoGrant.id,
    roles: ["MANAGER"],
  });
  assert.equal(afterGrant.some((item) => item.id === fixture.ownedProfile.id), true);

  const revocationTime = new Date();
  const revoked = await prisma.managerAccessGrant.updateMany({
    where: {
      id: grant.id,
      talentProfileId: fixture.ownedProfile.id,
      managerUserId: fixture.managerNoGrant.id,
      revokedAt: null,
    },
    data: {
      revokedAt: revocationTime,
      revokedByUserId: fixture.owner.id,
    },
  });

  assert.equal(revoked.count, 1);

  const storedGrant = await prisma.managerAccessGrant.findUnique({
    where: { id: grant.id },
    select: { revokedAt: true, revokedByUserId: true },
  });

  assert.equal(storedGrant?.revokedByUserId, fixture.owner.id);
  assert.ok(storedGrant?.revokedAt instanceof Date);

  const afterRevoke = await listFor({
    userId: fixture.managerNoGrant.id,
    roles: ["MANAGER"],
  });
  assert.deepEqual(afterRevoke, []);

  // Revocation retains the old row; a later consent creates a new grant row.
  const renewedGrant = await prisma.managerAccessGrant.create({
    data: {
      talentProfileId: fixture.ownedProfile.id,
      managerUserId: fixture.managerNoGrant.id,
      grantedByUserId: fixture.owner.id,
    },
    select: { id: true, revokedAt: true },
  });

  assert.notEqual(renewedGrant.id, grant.id);
  assert.equal(renewedGrant.revokedAt, null);

  const grantHistory = await prisma.managerAccessGrant.findMany({
    where: {
      talentProfileId: fixture.ownedProfile.id,
      managerUserId: fixture.managerNoGrant.id,
    },
    orderBy: { grantedAt: "asc" },
    select: { id: true, revokedAt: true, revokedByUserId: true },
  });

  assert.equal(grantHistory.length, 2);
  assert.ok(grantHistory[0]?.revokedAt instanceof Date);
  assert.equal(grantHistory[0]?.revokedByUserId, fixture.owner.id);
  assert.equal(grantHistory[1]?.revokedAt, null);
});

test("a manager can read photo metadata through an active grant but remains non-editable", async () => {
  const visibleProfile = await prisma.talentProfile.findFirst({
    where: {
      id: fixture.ownedProfile.id,
      managerAccessGrants: {
        some: {
          managerUserId: fixture.managerActive.id,
          revokedAt: null,
        },
      },
    },
    select: {
      photos: {
        select: { id: true, altText: true },
      },
    },
  });

  assert.equal(visibleProfile?.photos.length, 1);
  assert.equal(visibleProfile?.photos[0]?.altText, "Integration test photo");

  const access = resolveTalentProfileAccess(
    { userId: fixture.managerActive.id, roles: ["MANAGER"] },
    fixture.ownedProfile,
    true,
  );

  assert.equal(access?.canEdit, false);
});

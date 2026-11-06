import test from "node:test";
import assert from "node:assert/strict";

import {
  canManageTalentProfileManagerGrants,
  resolveTalentProfileAccess,
} from "../src/lib/server/auth/authorization-policy.ts";

const profile = {
  ownerUserId: "talent-1",
  primaryGuardianUserId: "guardian-1",
};

test("admin can read and edit agency profiles but cannot grant manager consent", () => {
  const user = { userId: "admin-1", roles: ["ADMIN"] };

  assert.deepEqual(resolveTalentProfileAccess(user, profile), {
    canRead: true,
    canEdit: true,
    canManageManagerAccess: false,
    isManagerView: false,
  });
  assert.equal(canManageTalentProfileManagerGrants(user, profile), false);
});

test("talent owner can read, edit, and manage manager access", () => {
  const user = { userId: "talent-1", roles: ["TALENT"] };
  const access = resolveTalentProfileAccess(user, profile);

  assert.equal(access?.canRead, true);
  assert.equal(access?.canEdit, true);
  assert.equal(access?.canManageManagerAccess, true);
  assert.equal(access?.isManagerView, false);
  assert.equal(canManageTalentProfileManagerGrants(user, profile), true);
});

test("another talent account cannot access an unshared profile", () => {
  const user = { userId: "talent-2", roles: ["TALENT"] };

  assert.equal(resolveTalentProfileAccess(user, profile), null);
  assert.equal(canManageTalentProfileManagerGrants(user, profile), false);
});

test("assigned guardian can read, edit, and manage manager access", () => {
  const user = { userId: "guardian-1", roles: ["GUARDIAN"] };
  const access = resolveTalentProfileAccess(user, profile);

  assert.equal(access?.canRead, true);
  assert.equal(access?.canEdit, true);
  assert.equal(access?.canManageManagerAccess, true);
  assert.equal(canManageTalentProfileManagerGrants(user, profile), true);
});

test("a different guardian cannot access the child profile", () => {
  const user = { userId: "guardian-2", roles: ["GUARDIAN"] };

  assert.equal(resolveTalentProfileAccess(user, profile), null);
  assert.equal(canManageTalentProfileManagerGrants(user, profile), false);
});

test("manager with an active profile-specific grant receives read-only access", () => {
  const user = { userId: "manager-1", roles: ["MANAGER"] };
  const access = resolveTalentProfileAccess(user, profile, true);

  assert.deepEqual(access, {
    canRead: true,
    canEdit: false,
    canManageManagerAccess: false,
    isManagerView: true,
  });
  assert.equal(canManageTalentProfileManagerGrants(user, profile), false);
});

test("manager without an active grant is denied", () => {
  const user = { userId: "manager-1", roles: ["MANAGER"] };

  assert.equal(resolveTalentProfileAccess(user, profile, false), null);
});

test("revoked manager grant is treated as no active grant", () => {
  const user = { userId: "manager-1", roles: ["MANAGER"] };
  const hasActiveGrant = false;

  assert.equal(resolveTalentProfileAccess(user, profile, hasActiveGrant), null);
});

test("manager role alone never grants profile editing or consent authority", () => {
  const user = { userId: "manager-1", roles: ["MANAGER"] };
  const access = resolveTalentProfileAccess(user, profile, true);

  assert.equal(access?.canEdit, false);
  assert.equal(access?.canManageManagerAccess, false);
  assert.equal(canManageTalentProfileManagerGrants(user, profile), false);
});

test("unknown roles cannot access or manage profile permissions", () => {
  const user = { userId: "support-1", roles: ["SUPPORT"] };

  assert.equal(resolveTalentProfileAccess(user, profile, true), null);
  assert.equal(canManageTalentProfileManagerGrants(user, profile), false);
});

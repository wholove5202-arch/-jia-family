// 身故确认、身后传承、年度头像：正式本地领域模型
export const DEATH_CONFIRM_MIN_OTHER_CONFIRMERS = 2;

export function createDeathCase(personId, initiatorId) {
  return {
    id: `death_${Date.now()}`,
    personId,
    initiatorId,
    status: "pending",
    confirmations: [],
    objections: [],
    createdAt: new Date().toISOString(),
    completedAt: null
  };
}

export function confirmDeath(caseData, memberId) {
  if (memberId === caseData.initiatorId) return caseData;
  if (caseData.confirmations.includes(memberId)) return caseData;
  if (caseData.objections.length) return caseData;
  const confirmations=[...caseData.confirmations, memberId];
  return {
    ...caseData,
    confirmations,
    status: confirmations.length >= DEATH_CONFIRM_MIN_OTHER_CONFIRMERS ? "confirmed" : "pending",
    completedAt: confirmations.length >= DEATH_CONFIRM_MIN_OTHER_CONFIRMERS ? new Date().toISOString() : null
  };
}

export function objectDeath(caseData, memberId) {
  return {...caseData, objections:[...new Set([...caseData.objections,memberId])], status:"disputed"};
}

export function createLegacySettings(ownerId) {
  return {
    ownerId,
    enabled:false,
    grants: [], // {contentId, contentType, recipientIds, releaseMode, releaseAt}
    updatedAt:new Date().toISOString()
  };
}

// 只有本人预设授权可释放；确认身故不等于获得账号/私密空间权限。
export function releasableGrants(settings, deathCase, now=new Date()) {
  if (!settings?.enabled || deathCase?.status !== "confirmed") return [];
  return settings.grants.filter(g => {
    if (g.releaseMode === "after_death_confirmation") return true;
    if (g.releaseMode === "date_after_death" && g.releaseAt) return now >= new Date(g.releaseAt);
    return false;
  });
}

export function createAnnualAvatarSuggestion(personId, mediaId, year) {
  return {id:`avatar_${Date.now()}`,personId,mediaId,year,status:"pending_owner_confirmation"};
}
export function confirmAnnualAvatar(suggestion, actingPersonId) {
  if (actingPersonId !== suggestion.personId) return suggestion;
  return {...suggestion,status:"confirmed",confirmedAt:new Date().toISOString()};
}

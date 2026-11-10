// Roles / titles shown by the typewriter under the name in the portfolio hero.

export const MAX_ROLES = 8;
export const MAX_ROLE_LENGTH = 60;

// Previously hard-coded in the hero for anyone whose bio was "software developer".
const LEGACY_DEFAULT_ROLES = ['software developer', 'mern stack developer', 'problem solver', 'frontend engineer'];

// The roles to show for a page. Saved roles win; pages that have never saved
// roles keep the old behaviour (bio split on , ; |) so nothing changes for them.
export function getHeroRoles(page) {
  if (Array.isArray(page?.roles) && page.roles.length > 0) return page.roles;

  const fromBio = (page?.bio || '').split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  if (fromBio.length === 1 && fromBio[0].toLowerCase() === 'software developer') {
    return LEGACY_DEFAULT_ROLES;
  }
  return fromBio;
}

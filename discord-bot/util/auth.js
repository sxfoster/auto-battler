function isGM(interaction) {
  const roles = interaction.member && interaction.member.roles;
  if (!roles) return false;
  let roleList = [];
  if (roles.cache) {
    roleList = Array.from(roles.cache.values());
  } else if (Array.isArray(roles)) {
    roleList = roles;
  }
  return roleList.some(r => r && (r.name === 'GM' || r.name === 'Developer'));
}

module.exports = { isGM };

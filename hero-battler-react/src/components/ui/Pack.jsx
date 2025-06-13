import React from 'react';

export default function Pack({ packType, onOpen }) {
  const isWeapon = packType === 'weapon';
  const classes = isWeapon ? 'weapon-pack' : 'booster-pack';
  const icon = isWeapon ? 'fa-box' : 'fa-user-group';
  return (
    <div className={classes} onClick={onOpen}>
      <i className={`fa-solid ${icon} text-8xl text-yellow-200 opacity-80`} />
    </div>
  );
}

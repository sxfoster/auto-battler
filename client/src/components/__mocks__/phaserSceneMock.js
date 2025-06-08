import { EventEmitter } from 'events';

export function createEventEmitterMock() {
  const emitter = new EventEmitter();
  return {
    events: emitter,
    emit: (...args) => emitter.emit(...args),
  };
}

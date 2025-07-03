// stub for @discord/embedded-app-sdk
export class DiscordSDK {
  constructor(clientId) {
    this.clientId = clientId;
    console.warn('DiscordSDK stub initialized');
  }
  ready() {
    return Promise.resolve();
  }
}

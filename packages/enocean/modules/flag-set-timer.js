export class FlagSetTimer {
  constructor(options) {
    this.enocean = options.enocean;
    this.timer = null;
    this.flagName = options.flagName;
    this.timeout = options.timeout || 60000; // ms
    this.countdown = null;
    this.startEventName = options.startEventName;
    this.stopEventName = options.stopEventName;
    this.countdownEventName = options.countdownEventName;
    this.countdownInterval = options.countdownInterval || 1000; // ms
    this.oldTimeout = this.timeout;
  }
  start(timeout) {
    console.log("FlagSetTimer: start", this.flagName, timeout);
    this.oldTimeout = this.timeout;
    if (timeout) {
      this.timeout = timeout;
    }
    if (this.teachInTimer) {
      this.stop();
      clearTimeout(this.timer);
    }
    this.enocean[this.flagName] = true;
    this.timer = setTimeout(() => {
      this.stop();
    }, this.timeout);
    const startTime = Date.now();
    this.countdown = setInterval(() => {
      this.enocean.emit(this.countdownEventName, {
        timeLeft: this.timeout - (Date.now() - startTime),
      });
    }, this.countdownInterval);
    this.enocean.emit(this.startEventName, { timeout: this.timeout });
    return { success: true, timeout: this.timeout };
  }
  stop() {
    let success = false;
    if (this.timer) {
      clearTimeout(this.timer);
      clearInterval(this.countdown);
      this.timer = null;
    }
    if (this.enocean[this.flagName]) {
      success = true;
      this.enocean.emit(this.stopEventName, { timeout: this.timeout });
    }
    this.timeout = this.oldTimeout;
    this.enocean[this.flagName] = false;
    return { success: success, timeout: this.timeout };
  }
}

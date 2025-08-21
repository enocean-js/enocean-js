class EnoceanButton {
  constructor(enocean, options) {
    this.enocean = enocean;
    this.enocean.sender.send();
  }
}

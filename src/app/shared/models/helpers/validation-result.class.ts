export class ValidationResult {
  get isValid() {
    return this.validationErrors.length <= 0;
  }

  constructor(readonly validationErrors: string[]) {}

  buildToastErrorMessage() {
    return `<div class="custom-toast-error-container"><ul>${this.validationErrors.reduce(
      (previous, current, index, array) =>
        previous +
        `<li>${current}${index === array.length - 1 ? '.' : ','}</li>`,
      ''
    )}</ul></div>`;
  }
}

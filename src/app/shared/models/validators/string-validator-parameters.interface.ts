export interface StringValidatorParameters {
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly isRequired: boolean;
    readonly regexPattern?: string;
    readonly errorMessage?: string;
  }
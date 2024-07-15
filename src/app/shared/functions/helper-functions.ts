import { ParamMap, Router } from '@angular/router';

export function isInStringEnum(
  value: string | null | undefined,
  destinationEnum: any
): value is typeof destinationEnum {
  return value != undefined || Object.values(destinationEnum).includes(value);
}

export function nameof<T>(name: Extract<keyof T, string>): string {
  return name;
}

export function isInEnum<T extends string, TEnumValue extends string>(
  value: string | undefined | null,
  enumVariable: { [key in T]: TEnumValue }
): value is TEnumValue {
  return value == undefined
    ? false
    : Object.values(enumVariable).includes(value);
}

export function containDuplicates(array: string[]) {
  return new Set(array).size !== array.length;
}

export function initialQueryParamMapIsValid(
  paramMap: ParamMap,
  availableQueryKey?: string[]
) {
  for (const key of paramMap.keys) {
    if (
      paramMap.getAll(key).length <= 0 ||
      paramMap.getAll(key).length > 1 ||
      paramMap.get(key) == null ||
      paramMap.get(key) == '' ||
      (availableQueryKey && !availableQueryKey.includes(key))
    ) {
      return false;
    }
  }

  return true;
}

export function hasKeyDuplicatesInQueryParams(queryParamMap: ParamMap) {
  for (const key of queryParamMap.keys) {
    if (queryParamMap.getAll(key).length > 1) {
      return true;
    }
  }

  return false;
}

export function navigateToInvalidFiltersPaged(route: any[], router: Router) {
  router.navigate(route, {
    replaceUrl: true,
  });
}

export function isNullOrWhitespace(
  value: string | undefined | null
): value is null | undefined {
  if (!value) {
    return true;
  }

  return value.trim().length <= 0;
}

export function isNullOrEmpty(values: any[] | undefined | null) {
  if (!values) {
    return true;
  }

  return values.length <= 0;
}

export function containsNullOrWhitespaceValues(values: string[]) {
  for (const value of values) {
    if (!value) {
      return true;
    }
  }

  return false;
}

export function isDate(value: any): value is Date {
  return !isNaN(Date.parse(value));
}

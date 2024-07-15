export interface TimestampQueryParams {
  fromDate?: Date | string | number;
  toDate?: Date | string | number;
  inclusiveFromDate?: boolean;
  inclusiveToDate?: boolean;
}

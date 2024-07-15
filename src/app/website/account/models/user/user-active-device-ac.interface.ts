export interface UserActiveDeviceAc {
  browserFullName: string;
  browserVersion?: string;
  operatingSystem: string;
  isMobile: boolean;
  lastActivity: Date;
  isCurrentDevice: boolean;
}

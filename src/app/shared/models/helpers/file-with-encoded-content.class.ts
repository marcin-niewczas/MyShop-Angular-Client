export class FileWithEncodedContent {
  constructor(readonly file: File, readonly url: string) {}
}

export function isFileWithEncodedContent(
  value: any
): value is FileWithEncodedContent {
  return value instanceof FileWithEncodedContent;
}

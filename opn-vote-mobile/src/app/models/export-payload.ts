export interface ExportPayload<T> {
  type: "ballot" | "master-key";
  version: number;
  data: T;
}
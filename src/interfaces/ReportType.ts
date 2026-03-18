export interface ReportType {
  RprtName: string;
  WordBlob: string | null;
  FirmRprtID: string | number;
  RprtImg: string;
  WordID: string | number;
  RprtType: string;
  RprtID: string | number;
  FirmRprtName: string;
  Rprt?: string;
  Modl?: string;
}
export interface UseReportTypes {
  FirmID: string;
  GetModelWordFile?: boolean;
}

// eslint-disable-next-line no-shadow
export enum FileStatus {
  WaitingImport = 0,
  Processing = 1,
  WaitingApprove = 2,
  Error = 3,
  WaitingDispatcher = 4,
  Sending = 5,
  Finished = 6,
  Refused = 7
}

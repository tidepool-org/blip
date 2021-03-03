import { AppConfig } from "../../yourloops/models/config";
import { User } from "../../yourloops/models/shoreline";
import { PatientData } from "../../yourloops/models/device-data";
import { MessageNote /*, MessagesThread */ } from "../../yourloops/models/message";

import ProfileDialog from "../../yourloops/components/profile-dialog";

export interface BlipApi {
  loadPatientData: (patient: User) => Promise<PatientData>;
  startMessageThread: (message: MessageNote) => Promise<string>;
  getMessages: (userId: string) => Promise<MessageNote[]> ;
  getMessageThread: (messageId: string) => Promise<MessageNote[]>;
}

export interface BlipProperties {
  config: AppConfig;
  api: BlipApi;
  patient: User;
  profileDialog: typeof ProfileDialog;
}
declare function Blip(props: BlipProperties): JSX.Element;
export default Blip;

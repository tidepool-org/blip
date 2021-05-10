import { Session } from "../../lib/auth/models";
import { Profile } from "../../models/shoreline";

export enum NotificationType {
  directshare = "careteam_invitation",
  careteam = "medicalteam_invitation",
  careteamPatient = "medicalteam_patient_invitation",
  careteamDoAdmin = "medicalteam_do_admin",
  careteamRemoveMember = "medicalteam_remove",
}

/** Some comments heres on the fields will be welcomed :-) */
export interface INotification {
  id: string,
  type: NotificationType;
  creator: {
    userid: string;
    profile: Profile;
  };
  created: string;
  target?: {
    id: string,
    name: string,
  };
}

export interface NotificationContext {
  count: number,
  getPendingInvitations: (userId: string | undefined) => Promise<INotification[]>;
  accept: (id: string, creatorId: string | undefined,targetId: string | undefined, type: NotificationType) => Promise<void>;
  decline: (id: string, creatorId: string | undefined, targetId: string | undefined, type: NotificationType) => Promise<void>;
}

export interface NotificationAPI {
  getPendingInvitations: (auth: Readonly<Session>, userId: string) => Promise<INotification[]>;
  accept: (auth: Readonly<Session>, id: string, creatorId: string | undefined, targetId: string | undefined, type: NotificationType) => Promise<void>;
  decline: (auth: Readonly<Session>, id: string, creatorId: string | undefined, targetId: string | undefined, type: NotificationType) => Promise<void>;
}

export interface NotificationProvider {
  children: React.ReactNode;
  /** Used to test the hook */
  api?: NotificationAPI;
  /** Used for test components which need this hook */
  value?: NotificationContext;
}

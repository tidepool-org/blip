/**
 * Copyright (c) 2020, Diabeloop
 * Models for profile page
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import { HcpProfession } from "../../models/hcp-profession";

interface SwitchRoleDialogProps {
  open: boolean;
}

export interface SwitchRoleConsequencesDialogProps extends SwitchRoleDialogProps {
  title: string;
  onAccept: () => void;
  onCancel: () => void;
}

export interface SwitchRoleConsentDialogProps extends SwitchRoleDialogProps {
  onAccept: (feedback: boolean) => void;
  onCancel: () => void;
}

export interface SwitchRoleProfessionDialogProps extends SwitchRoleDialogProps {
  onAccept: (profession : HcpProfession) => void;
  onCancel: () => void;
}

export interface SwitchRoleDialogsProps {
  open: boolean;
  onCancel: () => void;
}

export enum SwitchRoleToHcpSteps {
  none,
  consequences,
  consent,
  profession,
  update, // Update in progress => backend API call
}

import { authHandlers } from './auth.handlers';
import { agentHandlers } from './agent.handlers';
import { patchHandlers } from './patch.handlers';
import { assetHandlers } from './asset.handlers';
import { settingsHandlers } from './settings.handlers';
import { categoryHandlers } from './category.handlers';
import { tagHandlers } from './tag.handlers';
import { notificationHandlers } from './notification.handlers';

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...agentHandlers,
  ...patchHandlers,
  ...assetHandlers,
  ...settingsHandlers,
  ...categoryHandlers,
  ...tagHandlers,
  ...notificationHandlers,
];

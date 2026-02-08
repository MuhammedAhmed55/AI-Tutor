import { ResourceType, ActionType } from "@/types/types";

// Resource-specific actions mapping
export const RESOURCE_ACTIONS: Record<ResourceType, ActionType[]> = {
  [ResourceType.DASHBOARD]: [ActionType.VIEW],
  
  [ResourceType.USERS]: [
    ActionType.VIEW,
    ActionType.CREATE,
    ActionType.DELETE,
    ActionType.EDIT,
  ],
  [ResourceType.ROLES]: [ActionType.VIEW],
  [ResourceType.PERMISSIONS]: [ActionType.VIEW],
  [ResourceType.SETTINGS]: [ActionType.VIEW],
  [ResourceType.AI_MANAGER]: [ActionType.VIEW],
  [ResourceType.USER_DASHBOARD]: [ActionType.VIEW],
  [ResourceType.UPLOAD]: [ActionType.VIEW],
  [ResourceType.MCQS]: [ActionType.VIEW],
  [ResourceType.CHATBOT]: [ActionType.VIEW],
  [ResourceType.TOOLS]: [ActionType.VIEW],
  [ResourceType.STUDY_PLANS]: [ActionType.VIEW],
  [ResourceType.USERSETTINGS]: [ActionType.VIEW],
};

// Helper to get display name for resource
export const getResourceDisplayName = (resource: ResourceType): string => {
  const names: Record<ResourceType, string> = {
    [ResourceType.DASHBOARD]: "Dashboard",
    [ResourceType.USERS]: "Users",
    [ResourceType.ROLES]: "Roles",
    [ResourceType.PERMISSIONS]: "Permissions",  
    [ResourceType.AI_MANAGER]: "AI Manager",
    [ResourceType.SETTINGS]: "Settings",
    [ResourceType.USER_DASHBOARD]: "User Dashboard",
    [ResourceType.UPLOAD]: "Upload",
    [ResourceType.MCQS]: "MCQS",
    [ResourceType.CHATBOT]: "Chatbot",
    [ResourceType.TOOLS]: "Tools",
    [ResourceType.STUDY_PLANS]: "Study Plans",
    [ResourceType.USERSETTINGS]: "User Settings",
  };
  return names[resource] || resource;
};

// Helper to get display name for action
export const getActionDisplayName = (action: ActionType): string => {
  const names: Record<ActionType, string> = {
    [ActionType.VIEW]: "View",
    [ActionType.CREATE]: "Create",
    [ActionType.EDIT]: "Edit",
    [ActionType.DELETE]: "Delete",
    [ActionType.EXPORT]: "Export",
  };
  return names[action] || action;
};

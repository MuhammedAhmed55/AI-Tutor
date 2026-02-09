import {
  ActionType,
  MenuItem,
  MenuSection,
  ResourceType,
  User,
  UserRoles,
} from "@/types/types";
import {
  LayoutDashboard,
  Settings,
  Shield,
  User as UserIcon,
  UserCog,
  MessageCircle,
  BookOpen,
  Upload,
  Wrench,
  Calendar,
  FileText,
  BookMarked,
  HelpCircle,
  Lightbulb,
  LayoutGrid,
} from "lucide-react";

// Permission check function unchanged
const hasViewPermission = (
  userProfile: User,
  resource: ResourceType
): boolean => {
  try {
    if (!userProfile?.roles?.role_accessCollection?.edges) {
      return false;
    }

    return userProfile.roles.role_accessCollection.edges.some(
      (access: { node: { resource: string; action: string } }) =>
        access.node.resource === resource &&
        access.node.action === ActionType.VIEW
    );
  } catch (error) {
    console.error("Error checking menu permissions:", error);
    return false;
  }
};

const filterMenuItems = (items: MenuItem[], userProfile: User): MenuItem[] => {
  return items.filter((item) => {
    if (
      !item.resource || // <-- important: if no resource, allow by default
      item?.resource === ResourceType.DASHBOARD ||
      userProfile?.roles?.name === UserRoles.ADMIN
    ) {
      return true;
    }
    return hasViewPermission(userProfile, item.resource);
  });
};

const filterMenuSections = (
  sections: MenuSection[],
  userProfile: User
): MenuSection[] => {
  return sections
    .map((section) => ({
      ...section,
      items: filterMenuItems(section?.items, userProfile),
    }))
    .filter((section) => section?.items?.length > 0);
};

// NAV
export const getNavData = (user: User) => {
  console.log("Generating menu for user:", user?.roles?.name);
  const isAdminOrAgent = user?.roles?.name === UserRoles.ADMIN;

  // Main menu items for all users
  const sectionsItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboard className="size-4 text-primary" />,
      isActive: false,
    },
  ] as unknown as MenuItem[];

  // User dashboard items (only for non-admin users)
  const userDashboardItems =
    UserRoles.USER === user?.roles?.name
      ? [
          {
            title: "Chatbot",
            url: "/user-dashboard/chatbot",
            icon: <MessageCircle className="size-4 text-primary" />,
            isActive: false,
            // Removed resource here
          },
          {
            title: "Study Plan",
            url: "/user-dashboard/study-plan",
            icon: <Calendar className="size-4 text-primary" />,
            isActive: false,
          },
          {
            title: "Tools",
            url: "/user-dashboard/tools",
            icon: <Wrench className="size-4 text-primary" />,
            isActive: false,
            // items: [
            //   {
            //     title: "Flashcards",
            //     url: "/user-dashboard/tools/flashcards",
            //     icon: <LayoutGrid className="size-4 text-primary" />,
            //     isActive: false,
            //   },
            //   {
            //     title: "Important Topics",
            //     url: "/user-dashboard/tools/important-topics",
            //     icon: <Lightbulb className="size-4 text-primary" />,
            //     isActive: false,
            //   },
            //   {
            //     title: "MCQs",
            //     url: "/user-dashboard/tools/mcqs",
            //     icon: <HelpCircle className="size-4 text-primary" />,
            //     isActive: false,
            //   },
            //   {
            //     title: "Past Papers",
            //     url: "/user-dashboard/tools/past-papers",
            //     icon: <FileText className="size-4 text-primary" />,
            //     isActive: false,
            //   },
            //   {
            //     title: "Short Questions",
            //     url: "/user-dashboard/tools/short-questions",
            //     icon: <BookMarked className="size-4 text-primary" />,
            //     isActive: false,
            //   },
            //   {
            //     title: "Summary",
            //     url: "/user-dashboard/tools/summary",
            //     icon: <BookOpen className="size-4 text-primary" />,
            //     isActive: false,
            //   },
            // ] as unknown as MenuItem[],
          },
          {
            title: "Upload",
            url: "/user-dashboard/upload",
            icon: <Upload className="size-4 text-primary" />,
            isActive: false,
          },
          {
            title: "Settings",
            url: "/user-dashboard/userSettings",
            icon: <Settings className="size-4 text-primary" />,
            isActive: false,
          },
        ]
      : [];

  // Admin items, unique icons and with resources (protected)
  const adminItems = [
    {
      title: "Users",
      url: "/users",
      icon: <UserIcon className="size-4 text-primary" />,
      isActive: false,
      resource: ResourceType.USERS,
    },
    {
      title: "Roles",
      url: "/roles",
      icon: <UserCog className="size-4 text-primary" />,
      isActive: false,
      resource: ResourceType.ROLES,
    },
    {
      title: "Permissions",
      url: "/permissions",
      icon: <Shield className="size-4 text-primary" />,
      isActive: false,
      resource: ResourceType.PERMISSIONS,
    },
  ];

  if (isAdminOrAgent) {
    adminItems.unshift({
      title: "Settings",
      url: "/settings",
      icon: <Settings className="size-4 text-primary" />,
      isActive: false,
      resource: ResourceType.SETTINGS,
    });
  }

  const navMain: MenuSection[] = [
    {
      title: "Menu",
      url: "#",
      items: sectionsItems as unknown as MenuItem[],
    },
    ...(userDashboardItems.length > 0
      ? [
          {
            title: "Sections",
            url: "#",
            items: userDashboardItems as unknown as MenuItem[],
          },
        ]
      : []),
    ...(isAdminOrAgent
      ? [
          {
            title: "Admin Area",
            url: "#",
            items: adminItems as unknown as MenuItem[],
          },
        ]
      : []),
  ];

  const filteredNavMain = filterMenuSections(navMain, user);
  console.log("Filtered menu sections:", filteredNavMain);

  return {
    navMain: filteredNavMain,
  };
};

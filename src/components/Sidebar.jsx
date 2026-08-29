import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  MapPin,
  Briefcase,
  ShoppingBag,
  Store,
  Coins,
  BarChart,
  Layers,
  Bell,
  Image,
  Settings,
  ChevronDown,
  HeartPulse,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    icon: Home,
    route: "/",
  },
  // {
  //   label: "Manage Users",
  //   icon: Users,
  //   route: "/usersmanagement",
  // },
  {
    label: "Local Tasks",
    icon: MapPin,
    route: "/needsManagement",
  },
  {
    label: "Jobs",
    icon: Briefcase,
    children: [
      { label: " Part-Time Jobs", route: "/PartTimeJobs" },
      { label: " Full-Time Jobs", route: "/FullTimeJobs" },
    ],
  },
  {
    label: "All Admin",
    icon: Users,
    route: "/all-admin",
  },
  {
    label: "All Users",
    icon: Users,
    route: "/all-users",
  },
  {
    label: "Blood Request",
    icon: HeartPulse,
    route: "/blood-request",
  },
  {
    label: "Marketplace",
    icon: ShoppingBag,
    route: "/Marketplace",
  },
  {
    label: "Shops",
    icon: Store,
    route: "/shop-management",
  },
  {
    label: "Credits",
    icon: Coins,
    children: [
      { label: " Plans", route: "/credit" },
      { label: " Coupon", route: "/coupon" },
    ],
  },
  {
    label: "Business verifies",
    icon: BarChart,
    route: "/business",
  },
  {
    label: "Categories",
    icon: Layers,
    children: [
      { label: "Shop", route: "/cat-shop" },
      { label: "Items", route: "/cat-item" },
      { label: "Jobs", route: "/cat-jobs" },
    ],
  },
  {
    label: "Notifications",
    icon: Bell,
    route: "/notifications",
  },
  {
    label: "Banner Management",
    icon: Image,
    route: "/banner-management",
  },
  {
    label: "Settings",
    icon: Settings,
    route: "/systemsetting",
  },
];

const Sidebar=({ sidebarOpen, closeSidebar })=> {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "auto";
  }, [sidebarOpen]);

  useEffect(() => {
    menuItems.forEach((item, index) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => child.route === location.pathname,
        );
        if (isChildActive) {
          setOpenMenu(index);
        }
      }
    });
  }, [location.pathname]);

  const isMenuItemActive = (route) => {
    return location.pathname === route;
  };

  const isParentActive = (children) => {
    return children?.some((child) => child.route === location.pathname);
  };

  const handleMenuClick = (item, index) => {
    if (item.children) {
      setOpenMenu(openMenu === index ? null : index);
    } else {
      navigate(item.route);
      closeSidebar();
    }
  };

  const handleSubMenuClick = (route) => {
    navigate(route);
    closeSidebar();
  };

  return (
    <>
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-21 left-0 z-40 w-68 h-[calc(100vh-64px)]
        bg-white  shadow-lg p-4 overflow-y-auto
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        scrollbar-hide`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`
          aside::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <nav className="space-y-2 m-1">
          {menuItems.map((item, index) => {
            const isActive = isMenuItemActive(item.route);
            const isParentMenuActive = isParentActive(item.children);

            return (
              <div key={index}>
                <div
                  onClick={() => handleMenuClick(item, index)}
                  className={`flex items-center justify-between p-3 rounded-xl
                  cursor-pointer transition-colors duration-200
                  ${
                    isActive || isParentMenuActive
                      ? "bg-orange-100 text-[#FE702E]"
                      : "text-gray-700 hover:bg-orange-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.children && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        openMenu === index ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>

                {item.children && openMenu === index && (
                  <div className="ml-10 mt-1 space-y-1">
                    {item.children.map((sub, i) => {
                      const isSubActive = isMenuItemActive(sub.route);

                      return (
                        <div
                          key={i}
                          onClick={() => handleSubMenuClick(sub.route)}
                          className={`text-sm p-2 rounded-lg cursor-pointer transition-colors duration-200
                          ${
                            isSubActive
                              ? "bg-orange-100 text-[#FE702E] font-medium"
                              : "text-gray-600 hover:text-[#FE702E] hover:bg-orange-50"
                          }`}
                        >
                          {sub.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
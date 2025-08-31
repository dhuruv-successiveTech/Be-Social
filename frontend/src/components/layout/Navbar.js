import { Fragment, useState } from "react";
import Link from "next/link";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { 
  BellIcon, 
  Bars3Icon, 
  XMarkIcon, 
  SunIcon, 
  MoonIcon,
  HomeIcon,
  GlobeAltIcon,
  ChatBubbleOvalLeftIcon,
  UserCircleIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import NotificationList from "../notification/NotificationList";

const navigation = [
  { name: "Home", href: "/", current: true, icon: HomeIcon },
  { name: "Explore", href: "/explore", current: false, icon: GlobeAltIcon },
  { name: "Messages", href: "/messages", current: false, icon: ChatBubbleOvalLeftIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  return (
    <Disclosure as="nav" className={`bg-gray-800 text-gray-100 shadow-cool shadow-md sticky top-0 z-50 transition-all duration-200`}>
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className={`inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:bg-gray-700 focus:ring-indigo-400 focus:outline-none focus:ring-2 transition-all duration-200`}>
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex-1 flex items-center justify-between sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/">
                    <span className={`text-xl font-bold transition-colors text-gray-100 hover:text-indigo-400`}>
                      Social App
                    </span>
                  </Link>
                </div>
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-indigo-500 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "px-3 py-2 rounded-md text-sm font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            

                {/* Notifications */}
                <div className="relative ml-3">
                  <button
                    type="button"
                    className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    onClick={() => setShowNotifications((prev) => !prev)}
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 z-50">
                      <NotificationList onClose={handleCloseNotifications}/>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <Menu as="div" className="ml-3 relative">
                  <div>
                    <Menu.Button className="bg-gray-100 dark:bg-gray-700 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 p-0.5 transition-colors duration-200">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                        src={user?.avatar || "https://via.placeholder.com/40"}
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none transition-colors duration-200">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={`/profile/${user?.id}`}
                            className={classNames(
                              active ? "bg-gray-100 dark:bg-gray-700" : "",
                              "block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200"
                            )}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/settings"
                            className={classNames(
                              active ? "bg-gray-100 dark:bg-gray-700" : "",
                              "block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200"
                            )}
                          >
                            Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={classNames(
                              active ? "bg-gray-100 dark:bg-gray-700" : "",
                              "block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-indigo-500 text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;

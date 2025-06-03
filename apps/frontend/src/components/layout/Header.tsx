// apps/frontend/src/components/layout/Header.tsx
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4 md:px-6">
        {/* Main Site Title/Logo Link */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold sm:inline-block text-xl">
            Wholesale Portal
          </span>
        </Link>

        {/* Main Navigation for Products/Collections */}
        <NavigationMenu className="hidden md:flex"> {/* This is for the main group of nav items */}
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/products" legacyBehavior={false} passHref>
                {/* Setting legacyBehavior to false explicitly */}
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Products
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/collections" legacyBehavior={false} passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Collections
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            {/* More links can be added here following the same pattern */}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right-aligned items, e.g., Login/Account */}
        <div className="flex flex-1 items-center justify-end space-x-4"> {/* Added space-x-4 for potential multiple items */}
          {/* Login Link - needs to be part of a NavigationMenu structure if using NavigationMenuLink */}
          <NavigationMenu> {/* Each distinct interactive element group should be a NavigationMenu */}
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/login" legacyBehavior={false} passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Login
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              {/* You could add an "Account" link here later in its own NavigationMenuItem */}
            </NavigationMenuList>
          </NavigationMenu>
          {/* You could add other elements here like a Theme Toggle Button, etc. */}
        </div>
      </div>
    </header>
  );
}
import { useTheme } from "@/hooks/useTheme";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = 'light' | 'dark' | 'system';

export const ThemeToggle = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="ghost"
          size="sm"
          className="min-w-unit-8 w-unit-8 h-unit-8 p-0"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'light' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Theme selection"
        selectedKeys={[theme]}
        onSelectionChange={(keys) => {
          const selectedTheme = Array.from(keys)[0] as Theme;
          setTheme(selectedTheme);
        }}
      >
        <DropdownItem key="light" startContent={<Sun className="h-4 w-4" />}>
          Light
        </DropdownItem>
        <DropdownItem key="dark" startContent={<Moon className="h-4 w-4" />}>
          Dark
        </DropdownItem>
        <DropdownItem key="system" startContent={<Monitor className="h-4 w-4" />}>
          System
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

// Simple toggle button version
export const ThemeToggleButton = () => {
  const { resolvedTheme, toggleTheme } = useTheme();

  const Icon = resolvedTheme === 'light' ? Sun : Moon;
  return (
      <Icon onClick={toggleTheme} className="h-4 w-4 cursor-pointer hover:text-primary hover:fill-primary" />
  );
};

"use client";
import React, { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface TabData {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface TabProps {
  href?: string;
  tab: TabData;
  isActive: boolean;
  onClick?: () => void;
}

export interface TabContainerProps {
  tabs?: TabData[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

const Tab: React.FC<TabProps> = ({ href, tab, isActive, onClick }) => {
  const router = useRouter();
  return (
    <button
      className={`flex relative gap-0.5 cursor-pointer justify-center items-center self-stretch px-4 py-1.5 rounded-lg flex-[1_0_0] max-md:px-3 max-md:py-1.5 max-sm:p-2 max-sm:min-h-[30px] transition-colors duration-200 hover:bg-neutral-800 focus:outline-none ${
        isActive ? "bg-neutral-800" : ""
      }`}
      onClick={() => {
        if (href) {
          router.push(href);
        } else {
          onClick?.();
        }
      }}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${tab.id}`}
      id={`tab-${tab.id}`}
    >
      <span className="relative text-base tracking-tight leading-5 text-white max-md:text-sm max-md:tracking-tight max-sm:text-xs max-sm:tracking-tight max-sm:leading-3">
        <span className="text-base text-white max-sm:text-xs">{tab.label}</span>
      </span>
    </button>
  );
};

export const TabContainer: React.FC<TabContainerProps> = ({ tabs, defaultActiveTab, onTabChange, className }) => {
  const pathname = usePathname();
  const getTabIdFromPath = useCallback(() => {
    // Find a tab whose id is included in the pathname
    return tabs?.find(tab => pathname?.includes(tab.id))?.id || tabs?.[0]?.id || "";
  }, [pathname, tabs]);

  const [activeTab, setActiveTab] = useState<string>(defaultActiveTab || getTabIdFromPath());

  React.useEffect(() => {
    if (!tabs) return;
    const firstNonHrefTab = tabs.find(tab => !tab.href);
    if (firstNonHrefTab) {
      setActiveTab(firstNonHrefTab.id);
      onTabChange?.(firstNonHrefTab.id);
    }
  }, [tabs, onTabChange]);

  if (!tabs) return null;

  return (
    <div
      className={`flex relative shrink-0 gap-1.5 justify-center items-center p-1 mx-auto my-0 rounded-xl bg-neutral-950 h-[34px] max-md:p-1 max-md:w-full max-md:max-w-[600px] max-sm:p-0.5 max-sm:w-full max-sm:h-auto max-sm:rounded-xl ${className}`}
      role="tablist"
      aria-label="Transaction tabs"
    >
      {tabs.map(tab => {
        const isHrefTab = !!tab.href;
        const isActive = isHrefTab ? pathname === tab.href : activeTab === tab.id;
        return (
          <Tab
            key={tab.id}
            href={tab.href}
            tab={tab}
            isActive={isActive}
            onClick={
              !isHrefTab
                ? () => {
                    setActiveTab(tab.id);
                    onTabChange?.(tab.id);
                    tab.onClick?.();
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
};

export default TabContainer;

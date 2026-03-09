import React, { useRef, useState, useEffect, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Home, Film, Tv, Search } from "lucide-react";

// Icon mapping for mobile view
const TAB_ICONS = {
    Home: Home,
    Movies: Film,
    "TV Shows": Tv,
    Search: Search
};

export const SlideTabs = memo(({ onTabSelect, currentTab = 0, scrolled = false }) => {
    const [position, setPosition] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    });
    // State to track the currently selected tab, defaulting to the first tab (index 0)
    const [selected, setSelected] = useState(currentTab);
    const tabsRef = useRef([]);

    // Use the specific tabs that make sense for this app
    const TABS = ["Home", "Movies", "TV Shows", "Search"];

    // Sync prop changes
    useEffect(() => {
        setSelected(currentTab);
    }, [currentTab]);

    // This effect runs when the component mounts or when the selected tab changes.
    // It calculates the position of the selected tab and sets the cursor.
    useEffect(() => {
        const selectedTab = tabsRef.current[selected];
        if (selectedTab) {
            const { width } = selectedTab.getBoundingClientRect();
            setPosition({
                left: selectedTab.offsetLeft,
                width,
                opacity: 1,
            });
        }
    }, [selected]);

    const handleMouseLeave = useCallback(() => {
        // When the mouse leaves the container, reset the cursor
        // to the position of the currently selected tab.
        const selectedTab = tabsRef.current[selected];
        if (selectedTab) {
            const { width } = selectedTab.getBoundingClientRect();
            setPosition({
                left: selectedTab.offsetLeft,
                width,
                opacity: 1,
            });
        }
    }, [selected]);

    return (
        <ul
            onMouseLeave={handleMouseLeave}
            className={`relative mx-auto flex w-fit rounded-full slide-tabs-container ${scrolled ? 'scrolled' : ''}`}
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: scrolled ? '6px' : '8px 32px',
                gap: scrolled ? '8px' : '14px',
                listStyle: 'none'
            }}
        >
            {TABS.map((tab, i) => (
                <React.Fragment key={tab}>
                    <Tab
                        ref={(el) => (tabsRef.current[i] = el)}
                        setPosition={setPosition}
                        onClick={() => {
                            setSelected(i);
                            if (onTabSelect) onTabSelect(tab, i);
                        }}
                        icon={TAB_ICONS[tab]}
                    >
                        {tab}
                    </Tab>
                    {i < TABS.length - 1 && (
                        <div className="tab-divider" />
                    )}
                </React.Fragment>
            ))}

            <Cursor position={position} />
        </ul>
    );
});

// The Tab component is wrapped in forwardRef to accept a ref from its parent.
const Tab = React.forwardRef(({ children, setPosition, onClick, icon: Icon }, ref) => {
    return (
        <li
            ref={ref}
            onClick={onClick}
            onMouseEnter={() => {
                if (!ref?.current) return;

                const { width } = ref.current.getBoundingClientRect();

                setPosition({
                    left: ref.current.offsetLeft,
                    width,
                    opacity: 1,
                });
            }}
            className="slide-tab-item relative z-10 block cursor-pointer px-4 py-2 text-xs md:text-sm transition-colors"
            style={{ whiteSpace: 'nowrap', fontWeight: '600' }}
        >
            {Icon && <Icon className="tab-icon" size={18} />}
            <span className="tab-label">{children}</span>
        </li>
    );
});


const Cursor = memo(({ position }) => {
    return (
        <motion.div
            animate={{
                ...position,
            }}
            initial={false}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 30
            }}
            className="slide-tab-cursor absolute z-0 h-7 md:h-9 rounded-full"
            style={{
                position: 'absolute',
                pointerEvents: 'none',
                top: 0
            }}
        />
    );
});

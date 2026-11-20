import { useEffect, useRef } from 'react';

export type DropdownMenuKey = 'theme' | 'mascot' | null;

export interface DropdownOption<T extends string> {
    value: T;
    label: string;
}

export interface CozyDropdownProps<T extends string> {
    menuKey: Exclude<DropdownMenuKey, null>;
    openMenu: DropdownMenuKey;
    setOpenMenu: (menu: DropdownMenuKey) => void;
    value: T;
    options: DropdownOption<T>[];
    onChange: (nextValue: T) => void;
    prefixLabel?: string;
}

export function CozyDropdown<T extends string>({
    menuKey,
    openMenu,
    setOpenMenu,
    value,
    options,
    onChange,
    prefixLabel,
}: CozyDropdownProps<T>) {
    const isOpen = openMenu === menuKey;
    const containerRef = useRef<HTMLDivElement | null>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpenMenu(null);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenMenu(null);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, setOpenMenu]);

    return (
        <div className="cozy-dropdown" ref={containerRef}>
            <button
                type="button"
                className="cozy-dropdown-trigger"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                onClick={() => setOpenMenu(isOpen ? null : menuKey)}
            >
                <span>
                    {prefixLabel ? `${prefixLabel}: ` : ''}
                    {selectedOption ? selectedOption.label : value}
                </span>
                <span className="cozy-dropdown-caret" aria-hidden="true">
                    {isOpen ? '▴' : '▾'}
                </span>
            </button>

            {isOpen && (
                <div className="cozy-dropdown-menu" role="listbox">
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                className={`cozy-dropdown-option ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpenMenu(null);
                                }}
                            >
                                <span className="cozy-dropdown-check" aria-hidden="true">
                                    {isSelected ? '✦' : '·'}
                                </span>
                                <span>{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
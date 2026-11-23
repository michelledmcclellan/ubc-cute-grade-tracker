import { useState } from 'react';
import { type Assignment, type SubItem, calculateSubcategoryStats } from '../grades';


interface AssignmentRowProps {
    row: Assignment;
    onChange: (id: string, field: keyof Assignment, value: string) => void;
    onToggleVisibility: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdateRow: (updatedRow: Assignment) => void;
}


export function AssignmentRow({
    row,
    onChange,
    onToggleVisibility,
    onDelete,
    onUpdateRow,
}: AssignmentRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const hasSubItems = Boolean(row.subItems && row.subItems.length > 0);
    const subStats = hasSubItems ? calculateSubcategoryStats(row) : null;

    const handleAddSubItem = () => {
        const current = row.subItems ?? [];
        const baseName = row.name.trim() || 'Item';
        const nextItem: SubItem = {
            id: crypto.randomUUID(),
            name: `${baseName} ${current.length + 1}`,
            grade: '',
        };

        // Spread operator `[...current, nextItem]` creates a new array without mutating the old one
        onUpdateRow({ ...row, subItems: [...current, nextItem] });
    };

    const handleSubItemChange = (
        subId: string,
        field: 'name' | 'grade',
        value: string
    ) => {
        // `.map()` returns a brand-new array, swapping only the matching sub-item
        const updatedSubs = (row.subItems ?? []).map((sub) =>
            sub.id === subId ? { ...sub, [field]: value } : sub
        );
        onUpdateRow({ ...row, subItems: updatedSubs });
    };

    const handleDeleteSubItem = (subId: string) => {
        // `.filter()` creates a new array keeping everything EXCEPT `subId`
        const remaining = (row.subItems ?? []).filter((sub) => sub.id !== subId);

        if (remaining.length === 0) {
            onUpdateRow({ ...row, subItems: undefined, dropLowest: 0 });
            setIsExpanded(false);
        } else {
            onUpdateRow({ ...row, subItems: remaining });
        }
    };

    const handleDropLowestChange = (value: string) => {
        // `|| 0` handles when the user backspaces the box empty (NaN becomes 0)
        const num = Math.max(0, parseInt(value, 10) || 0);
        onUpdateRow({ ...row, dropLowest: num });
    };

    return (
        <div className="assignment-group">

            <div className="assignment-row">
                <div className="name-cell">
                    <button
                        type="button"
                        className="expand-btn"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={hasSubItems ? 'Toggle sub-items' : 'Split into sub-items'}
                    >
                        {isExpanded ? '▾' : '▸'}
                    </button>
                    <input
                        type="text"
                        placeholder="e.g. Midterm 1"
                        value={row.name}
                        onChange={(e) => onChange(row.id, 'name', e.target.value)}
                    />
                </div>
                <input
                    type={row.isHidden || hasSubItems ? 'text' : 'number'}
                    className={row.isHidden ? 'is-hidden' : ''}
                    placeholder="--"
                    readOnly={Boolean(row.isHidden || hasSubItems)}
                    aria-label={row.isHidden ? 'Grade hidden' : 'Grade percentage'}
                    value={
                        row.isHidden
                            ? '⟢ ฅ՞•ﻌ•՞ฅ'
                            : hasSubItems
                                ? subStats && subStats.average !== null
                                    ? subStats.average.toFixed(1)
                                    : '--'
                                : row.grade
                    }
                    onChange={(e) => {
                        if (!row.isHidden && !hasSubItems) {
                            onChange(row.id, 'grade', e.target.value);
                        }
                    }}
                />
                <div className="weight-input-wrapper">
                    <input
                        type="number"
                        placeholder="0"
                        value={row.weight}
                        onChange={(e) =>
                            onChange(row.id, 'weight', e.target.value)
                        }
                    />
                    <span className="percent-sign">%</span>
                </div>
                <button
                    type="button"
                    className="visibility-btn"
                    onClick={() => onToggleVisibility(row.id)}
                    aria-pressed={Boolean(row.isHidden)}
                    aria-label={row.isHidden ? `Show grade for ${row.name || 'assignment'}` : `Hide grade for ${row.name || 'assignment'}`}
                    title={row.isHidden ? 'Show grade' : 'Hide grade'}
                >
                    {row.isHidden ? '(ᴗ_ ᴗ。)' : '(◉_ ◉。)'}
                </button>
                <button
                    className="remove-row-btn"
                    onClick={() => onDelete(row.id)}
                    title="Remove row"
                >
                    [x]
                </button>
            </div>

            {isExpanded && (
                <div className="subcategory-drawer">
                    <div className="subcategory-controls">
                        <button type="button" className="sub-action-btn" onClick={handleAddSubItem}>
                            + add sub-item
                        </button>

                        {hasSubItems && (
                            <label className="sub-control-label">
                                drop lowest:
                                <input
                                    type="number"
                                    min={0}
                                    max={Math.max(0, (row.subItems?.length ?? 1) - 1)}
                                    value={row.dropLowest ?? 0}
                                    onChange={(e) => handleDropLowestChange(e.target.value)}
                                    className="sub-mini-input"
                                />
                            </label>
                        )}
                    </div>

                    {hasSubItems && (
                        <div className="sub-item-list">
                            {(row.subItems ?? []).map((sub) => (
                                <div key={sub.id} className="sub-item-row">
                                    <input
                                        type="text"
                                        placeholder="Sub-item name"
                                        value={sub.name}
                                        onChange={(e) => handleSubItemChange(sub.id, 'name', e.target.value)}
                                    />
                                    <input
                                        type={row.isHidden ? 'text' : 'number'}
                                        className={row.isHidden ? 'is-hidden' : ''}
                                        placeholder="--"
                                        readOnly={Boolean(row.isHidden)}
                                        value={row.isHidden ? '⟢ ฅ՞•ﻌ•՞ฅ' : sub.grade}
                                        onChange={(e) => {
                                            if (!row.isHidden) {
                                                handleSubItemChange(sub.id, 'grade', e.target.value);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="remove-row-btn"
                                        onClick={() => handleDeleteSubItem(sub.id)}
                                        title="Remove sub-item"
                                    >
                                        [x]
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
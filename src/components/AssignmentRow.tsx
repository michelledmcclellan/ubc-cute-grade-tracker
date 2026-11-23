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
    const [splitCount, setSplitCount] = useState(4);

    const hasSubItems = Boolean(row.subItems && row.subItems.length > 0);
    const subStats = hasSubItems ? calculateSubcategoryStats(row) : null;

    return (
        <div className="assignment-group">

            <div className="assignment-row">
                <input
                    type="text"
                    placeholder="e.g. Midterm 1"
                    value={row.name}
                    onChange={(e) =>
                        onChange(row.id, 'name', e.target.value)
                    }
                />
                <input
                    type={row.isHidden ? 'text' : 'number'}
                    className={row.isHidden ? 'is-hidden' : ''}
                    placeholder="--"
                    readOnly={Boolean(row.isHidden)}
                    aria-label={row.isHidden ? 'Grade hidden' : 'Grade percentage'}
                    value={row.isHidden ? '⟢ ฅ՞•ﻌ•՞ฅ' : row.grade}
                    onChange={(e) => {
                        if (!row.isHidden) {
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

        </div>
    );
}
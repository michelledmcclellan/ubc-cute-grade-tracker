import { useState } from "react";
import { DEFAULT_UBC_SCHEME, type GradeTier, type GradeScheme } from "../grades";

interface GradeSchemeModalProps {
    currentScheme?: GradeScheme;
    onSave: (scheme: GradeScheme | undefined) => void;
    onClose: () => void;
}

export function GradeSchemeModal({
    currentScheme, onSave, onClose,
}: GradeSchemeModalProps) {
    const initial = currentScheme ?? DEFAULT_UBC_SCHEME;
    const [name, setName] = useState(initial.name);
    const [rows, setRows] = useState<GradeTier[]>(
        initial.tiers.map((tier) => ({ ...tier }))
    );

    const handleRowChange = (
        index: number,
        field: keyof GradeTier,
        rawValue: string
    ) => {
        setRows((prev) =>
            prev.map((row, i) => {
                if (i !== index) return row;
                if (field === 'letter') return { ...row, letter: rawValue };
                if (field === 'min') return { ...row, min: Number(rawValue) || 0 };
                // Optional GPA: blank string becomes undefined
                return { ...row, gpa: rawValue.trim() === '' ? undefined : Number(rawValue) };
            })
        );
    };

    const handleAddTier = () => {
        setRows((prev) => [...prev, { min: 0, letter: '', gpa: undefined }]);
    };

    const handleDeleteTier = (index: number) => {
        if (rows.length <= 1) return;
        setRows((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleaned = rows
            .filter((r) => r.letter.trim() !== '')
            .sort((a, b) => b.min - a.min);

        if (cleaned.length === 0) return;
        onSave({ name: name.trim() || 'Custom', tiers: cleaned });
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card cozy-surface" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span>✿ Grade Scale Settings</span>
                    <button type="button" className="remove-row-btn" onClick={onClose}>
                        [x]
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="scheme-form">
                    <div className="scheme-name-row">
                        <label htmlFor="scheme-name">Scale Label:</label>
                        <input
                            className="cozy-input"
                            id="scheme-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. UBC, 4.0 Scale, Izzy Mode"
                        />
                    </div>

                    <div className="scheme-table-header">
                        <span>Letter</span>
                        <span>Min %</span>
                        <span>GPA (optional)</span>
                        <span></span>
                    </div>

                    <div className="scheme-rows">
                        {rows.map((row, index) => (
                            <div key={index} className="scheme-row">
                                <input
                                    className="cozy-input"
                                    type="text"
                                    value={row.letter}
                                    onChange={(e) => handleRowChange(index, 'letter', e.target.value)}
                                    placeholder="A+"
                                />
                                <input
                                    className="cozy-input"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={row.min}
                                    onChange={(e) => handleRowChange(index, 'min', e.target.value)}
                                />
                                <input
                                    className="cozy-input"
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.01"
                                    value={row.gpa ?? ''}
                                    onChange={(e) => handleRowChange(index, 'gpa', e.target.value)}
                                    placeholder="--"
                                />
                                <button
                                    type="button"
                                    className="remove-row-btn"
                                    onClick={() => handleDeleteTier(index)}
                                    title="Remove grade tier"
                                >
                                    [x]
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cozy-btn" onClick={handleAddTier}>
                            + add tier
                        </button>
                        <button
                            type="button"
                            className="cozy-btn"
                            onClick={() => {
                                onSave(undefined); // Resets back to default UBC scale
                                onClose();
                            }}
                        >
                            reset to UBC
                        </button>
                        <button type="submit" className="cozy-btn primary">
                            save scale
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
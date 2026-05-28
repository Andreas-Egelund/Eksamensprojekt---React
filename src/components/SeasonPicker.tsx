import { CalendarDays } from 'lucide-react';
import { getSeasonOptions } from '../api/f1Api';

type SeasonPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SeasonPicker({ value, onChange }: SeasonPickerProps) {
  return (
    <label className="season-picker">
      <span>
        <CalendarDays size={16} aria-hidden="true" />
        Season
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {getSeasonOptions().map((season) => (
          <option key={season} value={season}>
            {season === 'current' ? 'Current' : season}
          </option>
        ))}
      </select>
    </label>
  );
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/** The admin's standard underline search box (same idiom as ProductsTab / CountriesTab). */
export default function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full max-w-md bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
    />
  );
}

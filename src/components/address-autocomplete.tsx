"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface Suggestion {
  display_name: string;
}

interface AddressAutocompleteProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export const AddressAutocomplete = forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({ value, onChange, ...props }, ref) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          value,
        )}`,
      )
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data);
          setOpen(true);
        })
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [value]);

  const handleSelect = (address: string) => {
    onChange(address);
    setOpen(false);
  };

  const handleBlur = () => {
    // delay closing so click can register
    setTimeout(() => setOpen(false), 100);
  };

    return (
      <div className="relative">
        <Input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          autoComplete="off"
          {...props}
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-background shadow-lg">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                onMouseDown={() => handleSelect(s.display_name)}
                className="cursor-pointer px-3 py-2 hover:bg-accent"
              >
                {s.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

AddressAutocomplete.displayName = "AddressAutocomplete";

"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Select } from '@/components/ui/Select/Select';

interface HeroSearchFormProps {
  className?: string;
  inputGroupClassName?: string;
  controlsClassName?: string;
}

const PROPERTY_TYPES = [
  { value: "", label: "Any Property Type" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "ROOM", label: "Room" },
  { value: "COMMERCIAL", label: "Commercial" },
];

export function HeroSearchForm({ className, inputGroupClassName, controlsClassName }: HeroSearchFormProps) {
  const [propertyType, setPropertyType] = useState("");

  return (
    <form className={className} action="/properties">
      <div className={inputGroupClassName}>
        <Input 
          name="q" 
          placeholder="Enter area, neighborhood, or city" 
          fullWidth 
        />
      </div>
      <div className={controlsClassName}>
        <Select 
          name="propertyType"
          value={propertyType}
          onChange={setPropertyType}
          options={PROPERTY_TYPES}
        />
        <Button type="submit" size="lg">Search</Button>
      </div>
    </form>
  );
}

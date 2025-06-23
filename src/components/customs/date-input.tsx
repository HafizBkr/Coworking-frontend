"use client"
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateInput({ name, placeholder }:{ name?: string, placeholder?: string }) {
  const [date, setDate] = React.useState<Date>()

  return (
    <div>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          data-empty={!date}
          className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>{placeholder || "selectionner une date"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <Calendar 
        captionLayout="dropdown" 
        mode="single" 
        selected={date} 
        onSelect={setDate} />
      </PopoverContent>
    </Popover>
    <input type="hidden" name={name} value={date?.toDateString()}/>
    </div>
  )
}
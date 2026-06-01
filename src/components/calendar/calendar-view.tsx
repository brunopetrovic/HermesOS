'use client';

import React from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent } from '@/types';
import { Card } from '@/components/ui/card';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

export function CalendarView({ events, onSelectEvent, onSelectSlot }: CalendarViewProps) {
  const formattedEvents = events.map((event) => ({
    ...event,
    start: new Date(event.startDate),
    end: new Date(event.endDate || event.startDate),
  }));

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = 'var(--accent)';
    
    // Customize colors based on instance if needed
    if (event.instance === 'personal') backgroundColor = '#c9a84c';
    if (event.instance === 'brand') backgroundColor = '#f093fb';
    if (event.instance === 'business') backgroundColor = '#dc2626';

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        padding: '2px 5px',
      },
    };
  };

  return (
    <Card className="p-2 md:p-4 h-[calc(100vh-250px)] min-h-[400px] md:min-h-[500px] bg-surface border-border shadow-xl overflow-hidden">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.MONTH}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        className="custom-calendar"
      />
      <style jsx global>{`
        .custom-calendar .rbc-header {
          padding: 10px;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
        }
        .custom-calendar .rbc-off-range-bg {
          background: var(--bg-secondary);
          opacity: 0.3;
        }
        .custom-calendar .rbc-today {
          background: var(--accent-glow);
        }
        .custom-calendar .rbc-event {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .custom-calendar .rbc-month-view, 
        .custom-calendar .rbc-time-view,
        .custom-calendar .rbc-agenda-view {
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-primary);
        }
        .custom-calendar .rbc-toolbar button {
          color: var(--text-primary);
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: 4px;
        }
        .custom-calendar .rbc-toolbar button:hover {
          background: var(--bg-secondary);
        }
        .custom-calendar .rbc-toolbar button.rbc-active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
        .custom-calendar .rbc-toolbar-label {
          font-weight: 700;
          color: var(--text-primary);
        }
      `}</style>
    </Card>
  );
}

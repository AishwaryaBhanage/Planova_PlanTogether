"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Sparkles,
  Check,
  X,
  Plus,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Loader2,
  Navigation,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  itineraryAPI,
  type Itinerary,
  type ItineraryDay,
  type ItineraryActivity,
  type PlanMember,
} from "@/services/api";
import { toast } from "sonner";

interface ItineraryTabProps {
  planId: string;
  members: PlanMember[];
}

const activityTypeColors: Record<string, string> = {
  food: "bg-orange-100 text-orange-700",
  transport: "bg-blue-100 text-blue-700",
  activity: "bg-emerald-100 text-emerald-700",
  accommodation: "bg-purple-100 text-purple-700",
  sightseeing: "bg-pink-100 text-pink-700",
  shopping: "bg-amber-100 text-amber-700",
  rest: "bg-slate-100 text-slate-600",
};

const emptyActivity: ItineraryActivity = {
  time: "",
  title: "",
  description: "",
  location: "",
  type: "activity",
  estimatedCost: 0,
};

export default function ItineraryTab({ planId }: ItineraryTabProps) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ItineraryDay>>({});
  const [showAddDay, setShowAddDay] = useState(false);
  const [newDay, setNewDay] = useState<Partial<ItineraryDay>>({
    title: "",
    date: "",
    activities: [],
    notes: "",
  });

  const fetchItinerary = async () => {
    try {
      const { data } = await itineraryAPI.get(planId);
      setItinerary(data.itinerary);
      // Auto-expand all days
      if (data.itinerary?.days?.length) {
        setExpandedDays(new Set(data.itinerary.days.map((d) => d.id)));
      }
    } catch {
      setItinerary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, [planId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await itineraryAPI.generate(planId);
      setItinerary(data.itinerary);
      if (data.itinerary?.days?.length) {
        setExpandedDays(new Set(data.itinerary.days.map((d) => d.id)));
      }
      toast.success("Itinerary generated!");
    } catch {
      toast.error("Failed to generate itinerary");
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = async () => {
    try {
      const { data } = await itineraryAPI.accept(planId);
      setItinerary(data.itinerary);
      toast.success("Itinerary accepted!");
    } catch {
      toast.error("Failed to accept itinerary");
    }
  };

  const handleDecline = async () => {
    try {
      const { data } = await itineraryAPI.decline(planId);
      setItinerary(data.itinerary);
      toast.info("Itinerary declined. You can generate a new one.");
    } catch {
      toast.error("Failed to decline itinerary");
    }
  };

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  const startEditDay = (day: ItineraryDay) => {
    setEditingDay(day.id);
    setEditForm({ title: day.title, notes: day.notes, activities: [...day.activities] });
  };

  const handleSaveDay = async (dayId: string) => {
    try {
      await itineraryAPI.updateDay(planId, dayId, editForm);
      setEditingDay(null);
      fetchItinerary();
      toast.success("Day updated");
    } catch {
      toast.error("Failed to update day");
    }
  };

  const handleAddDay = async () => {
    if (!newDay.title?.trim()) return;
    try {
      await itineraryAPI.addDay(planId, newDay);
      setShowAddDay(false);
      setNewDay({ title: "", date: "", activities: [], notes: "" });
      fetchItinerary();
      toast.success("Day added");
    } catch {
      toast.error("Failed to add day");
    }
  };

  const addActivityToEdit = () => {
    setEditForm((prev) => ({
      ...prev,
      activities: [...(prev.activities || []), { ...emptyActivity }],
    }));
  };

  const updateEditActivity = (index: number, field: keyof ItineraryActivity, value: string | number) => {
    setEditForm((prev) => {
      const activities = [...(prev.activities || [])];
      activities[index] = { ...activities[index], [field]: value };
      return { ...prev, activities };
    });
  };

  const removeEditActivity = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      activities: (prev.activities || []).filter((_, i) => i !== index),
    }));
  };

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const totalCost = (activities: ItineraryActivity[]) =>
    activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      </div>
    );
  }

  // Empty state — no itinerary yet
  const status = itinerary?.status || "empty";

  if (status === "empty" || !itinerary) {
    return (
      <div className="space-y-4">
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
              <Sparkles className="h-7 w-7 text-primary/60" />
            </div>
            <p className="font-semibold text-foreground">Create your itinerary</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Let AI generate a day-by-day plan based on your trip details, or add days manually.
            </p>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowAddDay(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Day Manually
              </Button>
            </div>
          </CardContent>
        </Card>

        {showAddDay && (
          <AddDayForm
            day={newDay}
            onChange={setNewDay}
            onSave={handleAddDay}
            onCancel={() => setShowAddDay(false)}
          />
        )}
      </div>
    );
  }

  // AI Generated — show review UI
  if (status === "ai_generated") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Generated Itinerary
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Review the suggested plan. Accept it to start editing, or decline to start over.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAccept}>
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={handleDecline}>
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
            <Button size="sm" variant="ghost" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <DaysList
          days={itinerary.days}
          expandedDays={expandedDays}
          toggleDay={toggleDay}
          fmtDate={fmtDate}
          totalCost={totalCost}
          readOnly
        />
      </div>
    );
  }

  // Accepted — editable timeline
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          Itinerary ({itinerary.days.length} {itinerary.days.length === 1 ? "day" : "days"})
        </h3>
        <Button size="sm" onClick={() => setShowAddDay(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Day
        </Button>
      </div>

      {showAddDay && (
        <AddDayForm
          day={newDay}
          onChange={setNewDay}
          onSave={handleAddDay}
          onCancel={() => setShowAddDay(false)}
        />
      )}

      <DaysList
        days={itinerary.days}
        expandedDays={expandedDays}
        toggleDay={toggleDay}
        fmtDate={fmtDate}
        totalCost={totalCost}
        editingDay={editingDay}
        editForm={editForm}
        onStartEdit={startEditDay}
        onSaveEdit={handleSaveDay}
        onCancelEdit={() => setEditingDay(null)}
        onEditFormChange={setEditForm}
        onAddActivity={addActivityToEdit}
        onUpdateActivity={updateEditActivity}
        onRemoveActivity={removeEditActivity}
      />

      {itinerary.days.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <CalendarDays className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No days yet. Add your first day above.</p>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function DaysList({
  days,
  expandedDays,
  toggleDay,
  fmtDate,
  totalCost,
  readOnly,
  editingDay,
  editForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
  onAddActivity,
  onUpdateActivity,
  onRemoveActivity,
}: {
  days: ItineraryDay[];
  expandedDays: Set<string>;
  toggleDay: (id: string) => void;
  fmtDate: (d: string) => string;
  totalCost: (a: ItineraryActivity[]) => number;
  readOnly?: boolean;
  editingDay?: string | null;
  editForm?: Partial<ItineraryDay>;
  onStartEdit?: (day: ItineraryDay) => void;
  onSaveEdit?: (dayId: string) => void;
  onCancelEdit?: () => void;
  onEditFormChange?: (form: Partial<ItineraryDay>) => void;
  onAddActivity?: () => void;
  onUpdateActivity?: (index: number, field: keyof ItineraryActivity, value: string | number) => void;
  onRemoveActivity?: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      {days.map((day) => {
        const isExpanded = expandedDays.has(day.id);
        const isEditing = editingDay === day.id;
        const dayCost = totalCost(day.activities);

        return (
          <Card key={day.id} className="border-border overflow-hidden">
            {/* Day header */}
            <button
              onClick={() => toggleDay(day.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{day.dayNumber}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{day.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.date ? fmtDate(day.date) : `Day ${day.dayNumber}`}
                    {" · "}
                    {day.activities.length} {day.activities.length === 1 ? "activity" : "activities"}
                    {dayCost > 0 && ` · $${dayCost.toFixed(0)} est.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!readOnly && !isEditing && onStartEdit && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEdit(day);
                    }}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-border">
                {isEditing && editForm ? (
                  <div className="p-4 space-y-4">
                    <div className="space-y-3">
                      <Input
                        value={editForm.title || ""}
                        onChange={(e) => onEditFormChange?.({ ...editForm, title: e.target.value })}
                        placeholder="Day title"
                      />
                      <Input
                        value={editForm.notes || ""}
                        onChange={(e) => onEditFormChange?.({ ...editForm, notes: e.target.value })}
                        placeholder="Notes for this day"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Activities</p>
                      {(editForm.activities || []).map((activity, i) => (
                        <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-muted/30 rounded-lg">
                          <Input
                            placeholder="Time (e.g. 9:00 AM)"
                            value={activity.time}
                            onChange={(e) => onUpdateActivity?.(i, "time", e.target.value)}
                          />
                          <Input
                            placeholder="Title"
                            value={activity.title}
                            onChange={(e) => onUpdateActivity?.(i, "title", e.target.value)}
                          />
                          <Input
                            placeholder="Location"
                            value={activity.location}
                            onChange={(e) => onUpdateActivity?.(i, "location", e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Cost"
                              value={activity.estimatedCost || ""}
                              onChange={(e) => onUpdateActivity?.(i, "estimatedCost", Number(e.target.value))}
                              className="w-full"
                            />
                            <button
                              onClick={() => onRemoveActivity?.(i)}
                              className="p-2 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={onAddActivity}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Activity
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => onSaveEdit?.(day.id)}>
                        Save Changes
                      </Button>
                      <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    {day.activities.length > 0 ? (
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

                        <div className="space-y-4">
                          {day.activities.map((activity, i) => (
                            <div key={i} className="flex gap-3 relative">
                              {/* Timeline dot */}
                              <div className="h-[30px] w-[30px] rounded-full bg-background border-2 border-primary/30 flex items-center justify-center shrink-0 z-10">
                                <div className="h-2 w-2 rounded-full bg-primary/60" />
                              </div>

                              <div className="flex-1 pb-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                                    {activity.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                                    )}
                                  </div>
                                  {activity.estimatedCost > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 shrink-0 ml-2">
                                      <DollarSign className="h-3 w-3 mr-0.5" />
                                      {activity.estimatedCost}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                  {activity.time && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {activity.time}
                                    </span>
                                  )}
                                  {activity.location && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Navigation className="h-3 w-3" />
                                      {activity.location}
                                    </span>
                                  )}
                                  {activity.type && (
                                    <Badge
                                      variant="secondary"
                                      className={cn("text-[10px]", activityTypeColors[activity.type] || "bg-slate-100 text-slate-600")}
                                    >
                                      {activity.type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No activities for this day</p>
                    )}

                    {day.notes && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Notes:</span> {day.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function AddDayForm({
  day,
  onChange,
  onSave,
  onCancel,
}: {
  day: Partial<ItineraryDay>;
  onChange: (d: Partial<ItineraryDay>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">Add a new day</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Day title (e.g. Arrival & City Tour)"
            value={day.title || ""}
            onChange={(e) => onChange({ ...day, title: e.target.value })}
          />
          <Input
            type="date"
            value={day.date || ""}
            onChange={(e) => onChange({ ...day, date: e.target.value })}
          />
        </div>
        <Input
          placeholder="Notes (optional)"
          value={day.notes || ""}
          onChange={(e) => onChange({ ...day, notes: e.target.value })}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={onSave}>
            Add Day
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

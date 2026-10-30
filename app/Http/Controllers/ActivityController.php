<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreActivityRequest;
use App\Models\Activity;
use App\Models\ActivityRecord;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    /**
     * Display a listing of activities.
     */
    public function index(Request $request): Response
    {
        $query = Activity::with(['project', 'record', 'user']);

        // Filter by project
        if ($request->filled('project_id')) {
            $query->where('project_id', $request->input('project_id'));
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Search in title/notes
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        $activities = $query->orderBy('activity_date', 'desc')->get()->map(function ($activity) {
            return [
                'id' => $activity->id,
                'project_name' => $activity->project->name,
                'project_id' => $activity->project->id,
                'type' => $activity->type,
                'title' => $activity->title,
                'activity_date' => $activity->activity_date->format('Y-m-d H:i'),
                'activity_date_human' => $activity->activity_date->diffForHumans(),
                'user_name' => $activity->user->name,
                'notes' => $activity->notes,
                'record' => $activity->record ? $activity->record->data : null,
            ];
        });

        $projects = Project::all(['id', 'name']);

        return Inertia::render('Activities/Index', [
            'activities' => $activities,
            'projects' => $projects,
            'filters' => $request->only(['project_id', 'type', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new activity.
     */
    public function create(Request $request): Response
    {
        // Get only active and planning projects
        $projects = Project::whereIn('status', ['active', 'planning'])->get(['id', 'name']);

        return Inertia::render('Activities/Create', [
            'projects' => $projects,
            'selected_project_id' => $request->input('project_id'),
        ]);
    }

    /**
     * Store a newly created activity in storage.
     */
    public function store(StoreActivityRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Add current authenticated user ID
        $validated['user_id'] = $request->user()->id;

        // Create core activity
        $activity = Activity::create($validated);

        // Extract extra fields based on type for the activity record
        $recordData = [];
        $type = $validated['type'];

        if ($type === 'feeding') {
            $recordData = [
                'feed_type' => $request->input('feed_type'),
                'quantity' => (float) $request->input('quantity'),
                'unit' => $request->input('unit'),
            ];
        } elseif ($type === 'water_quality') {
            $recordData = [
                'ph' => (float) $request->input('ph'),
                'temperature' => (float) $request->input('temperature'),
                'do' => (float) $request->input('do'),
                'salinity' => (float) $request->input('salinity'),
            ];
        } elseif ($type === 'sampling') {
            $recordData = [
                'sample_count' => (int) $request->input('sample_count'),
                'average_weight' => (float) $request->input('average_weight'),
                'estimated_biomass' => (float) $request->input('estimated_biomass'),
            ];
        } elseif ($type === 'mortality') {
            $recordData = [
                'quantity' => (int) $request->input('quantity'),
                'cause' => $request->input('cause'),
            ];
        }

        if (! empty($recordData)) {
            ActivityRecord::create([
                'activity_id' => $activity->id,
                'data' => $recordData,
            ]);
        }

        return redirect()->route('projects.show', $validated['project_id'])
            ->with('success', 'Aktivitas berhasil dicatat.');
    }

    /**
     * Remove the specified activity from storage.
     */
    public function destroy(Activity $activity): RedirectResponse
    {
        $projectId = $activity->project_id;
        $activity->delete();

        return redirect()->route('projects.show', $projectId)
            ->with('success', 'Aktivitas berhasil dihapus.');
    }
}

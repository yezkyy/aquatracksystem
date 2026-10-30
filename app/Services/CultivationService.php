<?php

namespace App\Services;

use App\Models\ActivityRecord;
use App\Models\Project;

class CultivationService
{
    /**
     * Calculate total mortality for a project.
     */
    public function getTotalMortality(Project $project): int
    {
        $activityIds = $project->activities()
            ->where('type', 'mortality')
            ->pluck('id');

        return (int) ActivityRecord::whereIn('activity_id', $activityIds)
            ->get()
            ->sum(fn ($record) => $record->data['quantity'] ?? 0);
    }

    /**
     * Calculate survival rate (SR) in percentage.
     */
    public function getSurvivalRate(Project $project): float
    {
        if ($project->initial_stock <= 0) {
            return 0.0;
        }

        $totalMortality = $this->getTotalMortality($project);
        $live = $project->initial_stock - $totalMortality;

        $sr = ($live / $project->initial_stock) * 100;

        return round(max(0.0, min(100.0, $sr)), 1);
    }

    /**
     * Get the latest average weight (gram) from sampling records.
     */
    public function getAverageWeight(Project $project): float
    {
        $latestSampling = $project->activities()
            ->where('type', 'sampling')
            ->with('record')
            ->orderBy('activity_date', 'desc')
            ->first();

        if (! $latestSampling || ! $latestSampling->record) {
            return 0.0;
        }

        return (float) ($latestSampling->record->data['average_weight'] ?? 0.0);
    }

    /**
     * Calculate current biomass (in kg).
     */
    public function getBiomass(Project $project): float
    {
        $totalMortality = $this->getTotalMortality($project);
        $liveStock = $project->initial_stock - $totalMortality;

        if ($liveStock <= 0) {
            return 0.0;
        }

        $averageWeightGram = $this->getAverageWeight($project);

        // Biomass in kg = (Live Stock * Average Weight in grams) / 1000
        $biomassKg = ($liveStock * $averageWeightGram) / 1000;

        return round($biomassKg, 2);
    }

    /**
     * Calculate total feed given (in kg).
     */
    public function getTotalFeed(Project $project): float
    {
        $activityIds = $project->activities()
            ->where('type', 'feeding')
            ->pluck('id');

        return (float) ActivityRecord::whereIn('activity_id', $activityIds)
            ->get()
            ->sum(fn ($record) => $record->data['quantity'] ?? 0.0);
    }

    /**
     * Calculate Feed Conversion Ratio (FCR).
     */
    public function getFcr(Project $project): float
    {
        $currentBiomass = $this->getBiomass($project);

        if ($currentBiomass <= 0) {
            return 0.0;
        }

        $totalFeed = $this->getTotalFeed($project);

        return round($totalFeed / $currentBiomass, 2);
    }

    /**
     * Get running days (hari berjalan) for a project.
     */
    public function getRunningDays(Project $project): int
    {
        $startDate = $project->start_date;
        $now = now()->startOfDay();

        if ($now->lt($startDate)) {
            return 0;
        }

        return (int) $startDate->diffInDays($now) + 1;
    }

    /**
     * Get target duration of cycle in days.
     */
    public function getTargetDurationDays(Project $project): int
    {
        return (int) $project->start_date->diffInDays($project->target_harvest_date);
    }

    /**
     * Get cultivation progress percentage.
     */
    public function getProgressPercentage(Project $project): int
    {
        $duration = $this->getTargetDurationDays($project);
        if ($duration <= 0) {
            return 0;
        }

        $running = $this->getRunningDays($project);
        $progress = ($running / $duration) * 100;

        return (int) max(0, min(100, $progress));
    }
}

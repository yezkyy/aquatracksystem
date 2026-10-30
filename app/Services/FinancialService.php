<?php

namespace App\Services;

use App\Models\Project;

class FinancialService
{
    /**
     * Get total expenses for a project.
     */
    public function getTotalExpenses(Project $project): float
    {
        return (float) $project->expenses()->sum('amount');
    }

    /**
     * Get total revenue for a project.
     */
    public function getTotalRevenue(Project $project): float
    {
        return (float) $project->harvests()->sum('revenue');
    }

    /**
     * Get profit (revenue - expenses) for a project.
     */
    public function getProfit(Project $project): float
    {
        return $this->getTotalRevenue($project) - $this->getTotalExpenses($project);
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('commodity');
            $table->string('location');
            $table->date('start_date');
            $table->date('target_harvest_date');
            $table->integer('initial_stock')->default(0);
            $table->foreignId('person_in_charge_id')->constrained('users')->onDelete('restrict');
            $table->string('status')->default('planning'); // planning, active, completed, archived
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type'); // feeding, water_quality, sampling, mortality, other
            $table->dateTime('activity_date');
            $table->string('title');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('activity_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->onDelete('cascade');
            $table->json('data');
            $table->timestamps();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('category'); // seed, feed, medicine, operation, labor, other
            $table->decimal('amount', 15, 2);
            $table->date('expense_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('harvests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('harvest_date');
            $table->decimal('quantity', 12, 2); // in kg
            $table->decimal('price_per_kg', 15, 2);
            $table->decimal('revenue', 15, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('harvests');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('activity_records');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('projects');
    }
};

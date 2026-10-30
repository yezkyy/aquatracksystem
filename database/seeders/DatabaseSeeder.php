<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ActivityRecord;
use App\Models\Expense;
use App\Models\Harvest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'Administrator']);
        $managerRole = Role::firstOrCreate(['name' => 'Pengelola']);
        $operatorRole = Role::firstOrCreate(['name' => 'Operator']);

        // 2. Create Users
        $budi = User::firstOrCreate(
            ['email' => 'budi@aquatrack.com'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'avatar' => null,
            ]
        );
        $budi->assignRole($adminRole);

        $andi = User::firstOrCreate(
            ['email' => 'andi@aquatrack.com'],
            [
                'name' => 'Andi Pratama',
                'password' => Hash::make('password'),
                'avatar' => null,
            ]
        );
        $andi->assignRole($managerRole);

        $siti = User::firstOrCreate(
            ['email' => 'siti@aquatrack.com'],
            [
                'name' => 'Siti Rahma',
                'password' => Hash::make('password'),
                'avatar' => null,
            ]
        );
        $siti->assignRole($operatorRole);

        // 3. Create Projects
        // Project 1: Active Shrimp
        $shrimpProject = Project::firstOrCreate(
            ['name' => 'Budidaya Udang Vaname - Tambak A'],
            [
                'commodity' => 'Udang Vaname',
                'location' => 'Tambak A',
                'start_date' => now()->subDays(86)->startOfDay(),
                'target_harvest_date' => now()->addDays(34)->startOfDay(), // 120 days total
                'initial_stock' => 150000,
                'person_in_charge_id' => $andi->id,
                'status' => 'active',
                'latitude' => -8.2192,
                'longitude' => 114.3692,
                'province' => 'Jawa Timur',
                'notes' => 'Tebar benur kepadatan tinggi. Pastikan operasional kincir air berjalan 24 jam.',
            ]
        );

        // Project 2: Active Tilapia
        $tilapiaProject = Project::firstOrCreate(
            ['name' => 'Budidaya Ikan Nila - Kolam B'],
            [
                'commodity' => 'Ikan Nila',
                'location' => 'Kolam B',
                'start_date' => now()->subDays(10)->startOfDay(),
                'target_harvest_date' => now()->addDays(80)->startOfDay(), // 90 days total
                'initial_stock' => 5000,
                'person_in_charge_id' => $siti->id,
                'status' => 'active',
                'latitude' => -6.5658,
                'longitude' => 107.7589,
                'province' => 'Jawa Barat',
                'notes' => 'Pemberian pakan pellet grower 3 kali sehari. Jaga debit air pintu masuk.',
            ]
        );

        // Project 3: Completed Shrimp (used for financial historical records)
        $completedProject = Project::firstOrCreate(
            ['name' => 'Budidaya Udang Vaname - Tambak C (Siklus 01)'],
            [
                'commodity' => 'Udang Vaname',
                'location' => 'Tambak C',
                'start_date' => now()->subDays(125)->startOfDay(),
                'target_harvest_date' => now()->subDays(5)->startOfDay(), // 120 days total
                'initial_stock' => 120000,
                'person_in_charge_id' => $andi->id,
                'status' => 'completed',
                'latitude' => -5.7118,
                'longitude' => 105.5898,
                'province' => 'Lampung',
                'notes' => 'Siklus panen total memuaskan.',
            ]
        );

        // 4. Create Activities & Records for Active Shrimp (Tambak A)
        // Water quality today
        $wq1 = Activity::create([
            'project_id' => $shrimpProject->id,
            'user_id' => $siti->id,
            'type' => 'water_quality',
            'activity_date' => now()->subHours(2),
            'title' => 'Pengecekan Kualitas Air Pagi',
            'notes' => 'DO normal, cuaca agak mendung.',
        ]);
        ActivityRecord::create([
            'activity_id' => $wq1->id,
            'data' => [
                'ph' => 7.8,
                'temperature' => 29.4,
                'do' => 5.2,
                'salinity' => 15.0,
            ],
        ]);

        // Feeding today
        $feed1 = Activity::create([
            'project_id' => $shrimpProject->id,
            'user_id' => $siti->id,
            'type' => 'feeding',
            'activity_date' => now()->subHours(4),
            'title' => 'Pemberian Pakan Pagi',
            'notes' => 'Udang merespon pakan dengan sangat agresif.',
        ]);
        ActivityRecord::create([
            'activity_id' => $feed1->id,
            'data' => [
                'feed_type' => 'Pellet Grower A',
                'quantity' => 25.0,
                'unit' => 'kg',
            ],
        ]);

        // Sampling 2 days ago
        $samp1 = Activity::create([
            'project_id' => $shrimpProject->id,
            'user_id' => $andi->id,
            'type' => 'sampling',
            'activity_date' => now()->subDays(2),
            'title' => 'Sampling Rutin Mingguan',
            'notes' => 'Bobot merata, usus udang penuh dan aktif.',
        ]);
        ActivityRecord::create([
            'activity_id' => $samp1->id,
            'data' => [
                'sample_count' => 100,
                'average_weight' => 18.5, // 18.5 grams average
                'estimated_biomass' => 2682.5, // calculated biomass (kg)
            ],
        ]);

        // Mortality 10 days ago
        $mort1 = Activity::create([
            'project_id' => $shrimpProject->id,
            'user_id' => $siti->id,
            'type' => 'mortality',
            'activity_date' => now()->subDays(10),
            'title' => 'Kematian Udang Harian',
            'notes' => 'Ditemukan mati di dasar dekat pintu pembuangan.',
        ]);
        ActivityRecord::create([
            'activity_id' => $mort1->id,
            'data' => [
                'quantity' => 520,
                'cause' => 'Fluktuasi suhu ekstrim malam hari',
            ],
        ]);

        // Historical feedings to build FCR (approx 4200kg total feed)
        for ($i = 1; $i <= 5; $i++) {
            $f = Activity::create([
                'project_id' => $shrimpProject->id,
                'user_id' => $siti->id,
                'type' => 'feeding',
                'activity_date' => now()->subDays($i * 10),
                'title' => "Feeding Log Hari -{$i}0",
                'notes' => 'Rutinitas pakan.',
            ]);
            ActivityRecord::create([
                'activity_id' => $f->id,
                'data' => [
                    'feed_type' => 'Pellet Starter A',
                    'quantity' => 800.0,
                    'unit' => 'kg',
                ],
            ]);
        }

        // 5. Create Activities for Tilapia (Kolam B)
        $wq2 = Activity::create([
            'project_id' => $tilapiaProject->id,
            'user_id' => $siti->id,
            'type' => 'water_quality',
            'activity_date' => now()->subHours(1),
            'title' => 'Cek Parameter Air Rutin',
            'notes' => 'Kondisi air jernih dan mengalir.',
        ]);
        ActivityRecord::create([
            'activity_id' => $wq2->id,
            'data' => [
                'ph' => 7.2,
                'temperature' => 27.5,
                'do' => 5.5,
                'salinity' => 0.0,
            ],
        ]);

        $feed2 = Activity::create([
            'project_id' => $tilapiaProject->id,
            'user_id' => $siti->id,
            'type' => 'feeding',
            'activity_date' => now()->subHours(3),
            'title' => 'Pemberian Pakan Pagi',
            'notes' => 'Pakan apung grower.',
        ]);
        ActivityRecord::create([
            'activity_id' => $feed2->id,
            'data' => [
                'feed_type' => 'Pellet Apung Nila',
                'quantity' => 10.0,
                'unit' => 'kg',
            ],
        ]);

        $samp2 = Activity::create([
            'project_id' => $tilapiaProject->id,
            'user_id' => $siti->id,
            'type' => 'sampling',
            'activity_date' => now()->subDays(1),
            'title' => 'Sampling Awal Siklus',
            'notes' => 'Pertumbuhan pasca tebar terpantau normal.',
        ]);
        ActivityRecord::create([
            'activity_id' => $samp2->id,
            'data' => [
                'sample_count' => 50,
                'average_weight' => 25.0,
                'estimated_biomass' => 125.0,
            ],
        ]);

        // 6. Create Expenses
        // Tambak A
        Expense::create([
            'project_id' => $shrimpProject->id,
            'user_id' => $budi->id,
            'title' => 'Pembelian Benur Udang Vaname SPF 150rb Ekor',
            'category' => 'seed',
            'amount' => 12000000.00,
            'expense_date' => now()->subDays(85),
            'notes' => 'Suplier Hatchery Carita.',
        ]);
        Expense::create([
            'project_id' => $shrimpProject->id,
            'user_id' => $budi->id,
            'title' => 'Pembelian Pakan Udang Pellet (Pakan A & B) 4.2 Ton',
            'category' => 'feed',
            'amount' => 32500000.00,
            'expense_date' => now()->subDays(60),
            'notes' => 'Distributor Gajah Mada.',
        ]);
        Expense::create([
            'project_id' => $shrimpProject->id,
            'user_id' => $budi->id,
            'title' => 'Suplemen & Vitamin C Probiotik',
            'category' => 'medicine',
            'amount' => 2500000.00,
            'expense_date' => now()->subDays(45),
            'notes' => 'Penguat imunitas udang.',
        ]);
        Expense::create([
            'project_id' => $shrimpProject->id,
            'user_id' => $budi->id,
            'title' => 'Biaya Listrik Dinamo Kincir Air',
            'category' => 'operation',
            'amount' => 6200000.00,
            'expense_date' => now()->subDays(10),
            'notes' => 'Pembayaran tagihan listrik PLN token.',
        ]);
        Expense::create([
            'project_id' => $shrimpProject->id,
            'user_id' => $budi->id,
            'title' => 'Gaji Bulanan Operator Tambak',
            'category' => 'labor',
            'amount' => 4000000.00,
            'expense_date' => now()->subDays(5),
            'notes' => 'Gaji Siti Rahma.',
        ]);

        // Kolam B
        Expense::create([
            'project_id' => $tilapiaProject->id,
            'user_id' => $budi->id,
            'title' => 'Pembelian Bibit Ikan Nila Hitam 5000 Ekor',
            'category' => 'seed',
            'amount' => 2500000.00,
            'expense_date' => now()->subDays(9),
            'notes' => 'Bibit unggulan Sukabumi.',
        ]);

        // Tambak C (Completed)
        Expense::create([
            'project_id' => $completedProject->id,
            'user_id' => $budi->id,
            'title' => 'Pembelian Benur Udang 120rb Ekor',
            'category' => 'seed',
            'amount' => 9600000.00,
            'expense_date' => now()->subDays(124),
        ]);
        Expense::create([
            'project_id' => $completedProject->id,
            'user_id' => $budi->id,
            'title' => 'Pembelian Pakan Total Siklus',
            'category' => 'feed',
            'amount' => 26000000.00,
            'expense_date' => now()->subDays(80),
        ]);
        Expense::create([
            'project_id' => $completedProject->id,
            'user_id' => $budi->id,
            'title' => 'Biaya Operasional & Kincir',
            'category' => 'operation',
            'amount' => 5000000.00,
            'expense_date' => now()->subDays(20),
        ]);

        // 7. Create Harvests (Tambak C)
        Harvest::create([
            'project_id' => $completedProject->id,
            'user_id' => $andi->id,
            'harvest_date' => now()->subDays(10),
            'quantity' => 1500.0, // 1.5 tons
            'price_per_kg' => 65000.00,
            'revenue' => 97500000.00, // 1500 * 65000
            'notes' => 'Panen parsial pertama size 80.',
        ]);
        Harvest::create([
            'project_id' => $completedProject->id,
            'user_id' => $andi->id,
            'harvest_date' => now()->subDays(5),
            'quantity' => 2800.0, // 2.8 tons
            'price_per_kg' => 72000.00,
            'revenue' => 201600000.00, // 2800 * 72000
            'notes' => 'Panen total size 60.',
        ]);
    }
}

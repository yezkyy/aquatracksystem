<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActivityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            'project_id' => 'required|exists:projects,id',
            'type' => 'required|in:feeding,water_quality,sampling,mortality,other',
            'activity_date' => 'required|date',
            'title' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ];

        $type = $this->input('type');

        if ($type === 'feeding') {
            $rules['feed_type'] = 'required|string|max:255';
            $rules['quantity'] = 'required|numeric|min:0';
            $rules['unit'] = 'required|string|max:10';
        } elseif ($type === 'water_quality') {
            $rules['ph'] = 'required|numeric|between:0,14';
            $rules['temperature'] = 'required|numeric|between:0,100';
            $rules['do'] = 'required|numeric|min:0';
            $rules['salinity'] = 'required|numeric|min:0';
        } elseif ($type === 'sampling') {
            $rules['sample_count'] = 'required|integer|min:1';
            $rules['average_weight'] = 'required|numeric|min:0.01';
            $rules['estimated_biomass'] = 'required|numeric|min:0';
        } elseif ($type === 'mortality') {
            $rules['quantity'] = 'required|integer|min:1';
            $rules['cause'] = 'nullable|string|max:255';
        }

        return $rules;
    }

    /**
     * Get the validation error messages.
     */
    public function messages(): array
    {
        return [
            'project_id.required' => 'Proyek wajib dipilih.',
            'project_id.exists' => 'Proyek tidak valid.',
            'type.required' => 'Jenis aktivitas wajib dipilih.',
            'type.in' => 'Jenis aktivitas tidak valid.',
            'activity_date.required' => 'Tanggal & waktu wajib diisi.',
            'activity_date.date' => 'Tanggal & waktu tidak valid.',
            'title.required' => 'Judul aktivitas wajib diisi.',

            // Feeding
            'feed_type.required' => 'Jenis pakan wajib diisi.',
            'quantity.required' => 'Jumlah wajib diisi.',
            'quantity.numeric' => 'Jumlah harus berupa angka.',
            'quantity.min' => 'Jumlah tidak boleh kurang dari 0.',
            'unit.required' => 'Satuan pakan wajib diisi.',

            // Water Quality
            'ph.required' => 'pH wajib diisi.',
            'ph.numeric' => 'pH harus berupa angka.',
            'ph.between' => 'pH harus bernilai antara 0 sampai 14.',
            'temperature.required' => 'Suhu wajib diisi.',
            'temperature.numeric' => 'Suhu harus berupa angka.',
            'temperature.between' => 'Suhu harus bernilai antara 0 sampai 100.',
            'do.required' => 'Oksigen terlarut (DO) wajib diisi.',
            'do.numeric' => 'Oksigen terlarut (DO) harus berupa angka.',
            'do.min' => 'Oksigen terlarut (DO) tidak boleh kurang dari 0.',
            'salinity.required' => 'Salinitas wajib diisi.',
            'salinity.numeric' => 'Salinitas harus berupa angka.',
            'salinity.min' => 'Salinitas tidak boleh kurang dari 0.',

            // Sampling
            'sample_count.required' => 'Jumlah sampel wajib diisi.',
            'sample_count.integer' => 'Jumlah sampel harus berupa angka bulat.',
            'sample_count.min' => 'Jumlah sampel minimal 1.',
            'average_weight.required' => 'Bobot rata-rata wajib diisi.',
            'average_weight.numeric' => 'Bobot rata-rata harus berupa angka.',
            'average_weight.min' => 'Bobot rata-rata harus lebih besar dari 0.',
            'estimated_biomass.required' => 'Perkiraan biomassa wajib diisi.',
            'estimated_biomass.numeric' => 'Perkiraan biomassa harus berupa angka.',
            'estimated_biomass.min' => 'Perkiraan biomassa tidak boleh kurang dari 0.',

            // Mortality
            'quantity.integer' => 'Jumlah kematian harus berupa angka bulat.',
        ];
    }
}

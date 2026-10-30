<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
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
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'commodity' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'start_date' => 'required|date',
            'target_harvest_date' => 'required|date|after_or_equal:start_date',
            'initial_stock' => 'required|integer|min:0',
            'person_in_charge_id' => 'required|exists:users,id',
            'status' => 'required|in:planning,active,completed,archived',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'province' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama proyek wajib diisi.',
            'commodity.required' => 'Komoditas wajib diisi.',
            'location.required' => 'Lokasi wajib diisi.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Tanggal mulai tidak valid.',
            'target_harvest_date.required' => 'Target panen wajib diisi.',
            'target_harvest_date.date' => 'Target panen tidak valid.',
            'target_harvest_date.after_or_equal' => 'Tanggal target panen harus setelah atau sama dengan tanggal mulai.',
            'initial_stock.required' => 'Jumlah tebar awal wajib diisi.',
            'initial_stock.integer' => 'Jumlah tebar awal harus berupa angka.',
            'initial_stock.min' => 'Jumlah tebar awal tidak boleh negatif.',
            'person_in_charge_id.required' => 'Penanggung jawab wajib diisi.',
            'person_in_charge_id.exists' => 'Penanggung jawab tidak terdaftar di sistem.',
            'status.required' => 'Status proyek wajib ditentukan.',
            'status.in' => 'Status proyek tidak valid.',
        ];
    }
}

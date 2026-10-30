<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display settings page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Settings/Index', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->getRoleNames()->first() ?? 'Operator',
            ],
            'status' => session('status'),
        ]);
    }

    /**
     * Update user profile information.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'avatar_file' => 'nullable|image|max:2048', // max 2MB image
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Alamat email tidak valid.',
            'email.unique' => 'Alamat email sudah digunakan oleh pengguna lain.',
            'avatar_file.image' => 'File avatar harus berupa gambar.',
            'avatar_file.max' => 'Ukuran gambar avatar tidak boleh melebihi 2MB.',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        // Handle Avatar upload
        if ($request->hasFile('avatar_file')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                // If it is stored locally, delete it
                $oldPath = str_replace('/storage/', '', $user->avatar);
                Storage::disk('public')->delete($oldPath);
            }

            // Save new avatar
            $path = $request->file('avatar_file')->store('avatars', 'public');
            $user->avatar = '/storage/'.$path;
        }

        $user->save();

        return redirect()->route('settings.index')
            ->with('success', 'Profil Anda berhasil diperbarui.');
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string', function ($attribute, $value, $fail) use ($user) {
                if (! Hash::check($value, $user->password)) {
                    $fail('Kata sandi saat ini salah.');
                }
            }],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ], [
            'current_password.required' => 'Kata sandi saat ini wajib diisi.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
            'password.min' => 'Kata sandi baru minimal harus 8 karakter.',
        ]);

        $user->password = Hash::make($validated['password']);
        $user->save();

        return redirect()->route('settings.index')
            ->with('success', 'Kata sandi Anda berhasil diperbarui.');
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lottery;
use App\Models\LotteryImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LotteryController extends Controller
{
    public function index(): Response
    {
        $lotteries = Lottery::query()
            ->withCount('tickets')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('admin/lotteries/index', [
            'lotteries' => $lotteries,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/lotteries/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:5120'],
            'description' => ['nullable', 'string'],
            'bank_account' => ['nullable', 'string', 'max:255'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'price_per_ticket' => ['required', 'integer', 'min:1000'],
            'total_tickets' => ['required', 'integer', 'min:1'],
            'starts_at' => ['required', 'date'],
            'draws_at' => ['required', 'date', 'after:starts_at'],
        ]);

        $validated['slug'] = Str::slug($validated['name']).'-'.Str::random(6);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('lotteries', 'public');
        }

        Lottery::create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Сугалаа амжилттай үүсгэлээ.']);

        return to_route('admin.lotteries.index');
    }

    public function edit(Lottery $lottery): Response
    {
        $lottery->load('images');

        return Inertia::render('admin/lotteries/edit', [
            'lottery' => $lottery,
        ]);
    }

    public function update(Request $request, Lottery $lottery): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:5120'],
            'description' => ['nullable', 'string'],
            'bank_account' => ['nullable', 'string', 'max:255'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'price_per_ticket' => ['required', 'integer', 'min:1000'],
            'total_tickets' => ['required', 'integer', 'min:1'],
            'starts_at' => ['required', 'date'],
            'draws_at' => ['required', 'date', 'after:starts_at'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('lotteries', 'public');
        }

        $lottery->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Сугалаа амжилттай шинэчлэгдлээ.']);

        return to_route('admin.lotteries.index');
    }

    public function toggle(Lottery $lottery): RedirectResponse
    {
        $lottery->update(['is_active' => ! $lottery->is_active]);

        $status = $lottery->is_active ? 'идэвхжүүллээ' : 'идэвхгүй боллоо';
        Inertia::flash('toast', ['type' => 'success', 'message' => "Сугалаа амжилттай {$status}."]);

        return back();
    }

    public function uploadImages(Request $request, Lottery $lottery): RedirectResponse
    {
        $request->validate([
            'images' => ['required', 'array', 'max:10'],
            'images.*' => ['required', 'image', 'max:5120'],
        ]);

        $maxOrder = $lottery->images()->max('sort_order') ?? 0;

        foreach ($request->file('images') as $file) {
            $lottery->images()->create([
                'path' => $file->store('lotteries/gallery', 'public'),
                'sort_order' => ++$maxOrder,
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => count($request->file('images')).' зураг нэмэгдлээ.']);

        return back();
    }

    public function deleteImage(LotteryImage $lotteryImage): RedirectResponse
    {
        Storage::disk('public')->delete($lotteryImage->path);
        $lotteryImage->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Зураг устгагдлаа.']);

        return back();
    }
}

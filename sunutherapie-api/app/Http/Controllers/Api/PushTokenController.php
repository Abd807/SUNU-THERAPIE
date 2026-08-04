<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PushTokenController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['push_token' => 'required|string|max:255']);

        $user = $request->user();
        $user->push_token = $request->push_token;
        $user->save();

        return response()->json(['success' => true]);
    }
}

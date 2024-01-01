<?php

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\HistoryChat;
use App\Http\Controllers\ChatController;

Route::get('/', [ChatController::class, 'showChat']);

Route::post('/messages', function (Request $request) {
    $message = $request->input('message');
    $type = $request->input('type');
    $newMessage = HistoryChat::create([
        'message' => $message,
        'type' => $type
    ]);

    return response()->json(['message' => 'Pesan disimpan di database.', 'data' => $newMessage], 201);
});
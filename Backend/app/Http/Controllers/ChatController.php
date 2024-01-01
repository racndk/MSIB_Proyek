<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;

class ChatController extends Controller
{
    public function showChat()
    {
        $messages = Message::all(); 

        return view('welcome', ['messages' => $messages]);
    }
}
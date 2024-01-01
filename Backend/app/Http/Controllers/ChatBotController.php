<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use OpenAI\Laravel\Facades\OpenAI;
use App\Models\HistoryChat;

class ChatBotController extends Controller
{
    public function sendChat(Request $request)
    {
        $result = OpenAI::completions()->create([
            'max_tokens' => 200,
            'model' => 'text-davinci-003',
            'prompt' => $request->input
        ]);

        $response = array_reduce(
            $result->toArray()['choices'],
            fn (string $result, array $choice) => $result . $choice['text'],
            ""
        );

        $historyChat = new HistoryChat();
        $historyChat->message = $response;
        $historyChat->type = 'receive';
        $historyChat->save();

        return $response;
    }
}

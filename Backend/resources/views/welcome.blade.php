<!DOCTYPE html>
<html>
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>ChatBot</title>
</head>
<body>
    <div id="messages">
        <ul>
            @foreach($messages as $message)
                <li>{{ $message->message }}</li>
            @endforeach
        </ul>
    </div>
</body>
</html>
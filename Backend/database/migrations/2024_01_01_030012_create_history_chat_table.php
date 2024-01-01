<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHistoryChatTable extends Migration
{
    public function up()
    {
        Schema::create('history_chat', function (Blueprint $table) {
            $table->id();
            $table->text('message');
            $table->enum('type', ['sent', 'received']); 
            $table->date('tanggal')->default(DB::raw('CURRENT_DATE'));
            $table->time('jam')->default(DB::raw('CURRENT_TIME')); 
            $table->timestamp('created_at')->useCurrent(); 
            $table->timestamp('updated_at')->useCurrent(); 
        });
    }

    public function down()
    {
        Schema::dropIfExists('history_chat');
    }
}

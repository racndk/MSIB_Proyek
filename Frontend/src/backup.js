import React from 'react';
import './App.css';

const initialMessages = [
  { text: 'Halo, ada yang bisa saya bantu ?', type: 'received' }
  // Tambahkan template pertanyaan dan jawaban di sini sesuai kebutuhan
];

const Message = ({ text, type }) => {
  const messageType = type === 'sent' ? 'sent' : 'received';
  return <div className={`message ${messageType}`}>{text}</div>;
};

class ChatApp extends React.Component {
  state = {
    messages: initialMessages,
    recommendedQuestions: [
        { text: 'Bagaimana cara melakukan pemesanan?', answer: 'Anda dapat melakukan pemesanan melalui halaman kami dengan mengklik tombol "Beli" pada produk yang Anda inginkan.' },
        { text: 'Apakah produk ini tersedia dalam warna lain?', answer: 'Ya, produk kami tersedia dalam beberapa varian warna. Silakan cek halaman produk untuk melihat pilihan warna yang tersedia.' },
        { text: 'Berapa lama pengiriman produk?', answer: 'Waktu pengiriman bervariasi tergantung lokasi Anda. Umumnya, pengiriman memakan waktu sekitar 3-5 hari kerja setelah proses verifikasi pembayaran.' }
        // Tambahkan jawaban untuk setiap pertanyaan di sini
    ],
    showRecommended: false,
    selectedQuestion: '',
    chatEnded: false,
    typingEffect: false // State untuk mengontrol efek mengetik
  };
  endChat = () => {
    this.setState({
      chatEnded: true,
    });
    // Nonaktifkan input pesan dan tombol kirim
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('sendButton');
    if (messageInput && sendButton) {
      messageInput.disabled = true;
      sendButton.disabled = true;
    }
  };
  sendMessage = () => {
    const messageInput = document.getElementById('message-input');
    if (!messageInput || this.state.chatEnded) {
      return; // Jika chat telah berakhir atau input pesan tidak ditemukan, hentikan pengiriman pesan
    }
    if (messageInput.trim() !== '') {
      const newMessage = { text: messageInput, type: 'sent' };
      this.setState(
        prevState => ({
          messages: [...prevState.messages, newMessage]
        }),
        () => {
          const chatBox = document.getElementById('chat-box');
          chatBox.scrollTop = chatBox.scrollHeight;
          this.handleBotResponse(messageInput);
        }
      );
      messageInput.value = '';
      


      // Mengirim data ke Laravel menggunakan fetch
      fetch('http://127.0.0.1:8000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: messageInput,
          type: 'sent' // Sesuaikan dengan struktur data yang diharapkan oleh Laravel
        })
      }).then(response => response.json())
        .then(data => {
          console.log('Pesan berhasil disimpan:', data);
          // Lakukan sesuatu setelah pesan berhasil disimpan ke database
        })
        .catch(error => {
          console.log( error);
        });
    }
    console.log(messageInput);
  };
  
  handleBotResponse = messageInput => {
    const { recommendedQuestions } = this.state;
    const foundQuestion = recommendedQuestions.find(
      question => question.text.toLowerCase() === messageInput.toLowerCase()
    );
  
    if (foundQuestion) {
      const newMessage = { text: foundQuestion.answer, type: 'received' };
      this.setState(
        prevState => ({
          messages: [...prevState.messages, newMessage],
          showRecommended: false,
          selectedQuestion: ''
        }),
        () => {
          const chatBox = document.getElementById('chat-box');
          chatBox.scrollTop = chatBox.scrollHeight;
  
          fetch('http://127.0.0.1:8000/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              message: foundQuestion.text,
              type: 'sent' // Sesuaikan dengan struktur data yang diharapkan oleh Laravel
            })
          })
          .then(response => response.json())
          .then(data => {
            console.log('Pesan pengguna berhasil disimpan:', data);
  
            return fetch('http://127.0.0.1:8000/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                message: foundQuestion.answer,
                type: 'received' // Sesuaikan dengan struktur data yang diharapkan oleh Laravel
              })
            });
          })
          .then(response => response.json())
          .then(data => {
            console.log('Pesan balasan berhasil disimpan:', data);
          })
          .catch(error => {
            console.log(error);
          });
        }
      );
    } else {
      this.setState(
        {
          typingEffect: true // Aktifkan efek mengetik
        },
        () => {
          const API_URL = "https://api.openai.com/v1/chat/completions";
          const requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer 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`
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: messageInput }]
            })
          };
  
          fetch(API_URL, requestOptions)
            .then(res => res.json())
            .then(data => {
              const gptResponse = data.choices[0].message.content;
              const newMessage = { text: gptResponse, type: 'received' };
              this.setState(
                prevState => ({
                  messages: [...prevState.messages, newMessage],
                  showRecommended: false,
                  selectedQuestion: '',
                  typingEffect: false // Matikan efek mengetik setelah menerima respons
                }),
                () => {
                  const chatBox = document.getElementById('chat-box');
                  chatBox.scrollTop = chatBox.scrollHeight;
  
                  fetch('http://127.0.0.1:8000/messages', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                      message: gptResponse,
                      type: 'received' // Sesuaikan dengan struktur data yang diharapkan oleh Laravel
                    })
                  })
                  .then(response => response.json())
                  .then(data => {
                    console.log('Pesan balasan berhasil disimpan:', data);
                  })
                  .catch(error => {
                    console.log(error);
                  });
                }
              );
            })
            .catch(error => {
              console.error('Error fetching data:', error);
              const newMessage = {
                text: "Terjadi kesalahan dalam memproses pertanyaan. Mohon maaf atas ketidaknyamanan ini.",
                type: 'received'
              };
              this.setState(
                prevState => ({
                  messages: [...prevState.messages, newMessage],
                  showRecommended: true,
                  selectedQuestion: messageInput,
                  typingEffect: false // Matikan efek mengetik setelah menerima respons
                }),
                () => {
                  const chatBox = document.getElementById('chat-box');
                  chatBox.scrollTop = chatBox.scrollHeight;
                }
              );
            });
        }
      );
    }
  };
  

  handleQuestionClick = question => {
    const newMessage = { text: question.text, type: 'sent' };
    this.setState(prevState => ({
      messages: [...prevState.messages, newMessage],
      showRecommended: false,
      selectedQuestion: question.text
    }), () => {
      this.handleBotResponse(question.text);
    });
  };

  toggleRecommended = () => {
    this.setState(prevState => ({
      showRecommended: !prevState.showRecommended
    }));
  };

  render() {
    const { messages, recommendedQuestions, showRecommended, selectedQuestion, typingEffect, chatEnded } = this.state;

    if (chatEnded) {
      return (
        <div className="container">
          <div className="chat">
            <div className="chat-box" id="chat-box">
              {messages.map((message, index) => (
                <Message key={index} text={message.text} type={message.type} />
              ))}
            </div>
            <div className="btn-recomendation-container">
              <button className="btn-recomendation" onClick={() => this.setState({ chatEnded: false })}>
                Buka Sesi Chat Sebelumnya
              </button>
              <button className="btn-recomendation" onClick={() => window.location.reload()}>
                Mulai Chat Baru
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="container">
        <div className="header">
          <img src="../asset/bot.png" alt="Foto Profil" className="profile-pic" />
          <h3>Mariyadi | Virtual Assistant</h3>
        </div>
        <div className="chat">
          <div className="chat-box" id="chat-box">
            {messages.map((message, index) => (
              <Message key={index} text={message.text} type={message.type} />
            ))}
            {typingEffect && ( // Tampilkan efek mengetik jika typingEffect aktif
              <div className="message received typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
          </div>
          {showRecommended && (
            <div className="recommended-questions">
              <p>Pertanyaan rekomendasi:</p>
              <div className="recommended-questions-list">
                {recommendedQuestions.map((question, index) => (
                  <div
                    key={index}
                    className={
                      question.text === selectedQuestion
                        ? 'recommended-question selected'
                        : 'recommended-question'
                    }
                    onClick={() => this.handleQuestionClick(question)}
                  >
                    {question.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="btn-recomendation-container">
        <button className = "btn-recomendation" onClick={this.toggleRecommended}>
          {showRecommended ? 'Sembunyikan Pertanyaan Rekomendasi' : 'Tampilkan Pertanyaan Rekomendasi'}
        </button>
        </div>
        <div className="input">
        <input type="text" id="message-input" placeholder="Tulis pesan..." />
        <button id="sendButton" onClick={this.sendMessage} disabled={chatEnded}>
          Kirim
        </button>
        <button onClick={this.endChat}>
            Akhiri Chat
          </button>
      </div>
      </div>
    );
  }
}

export default ChatApp;

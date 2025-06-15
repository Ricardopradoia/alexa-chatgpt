require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const app = express();
const port = process.env.PORT || 3000;

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Sua chave da API OpenAI
});

app.use(express.json());

// Middleware para verificar se a requisição vem da Alexa (opcional, mas recomendado)
const verifyAlexaRequest = (req, res, next) => {
  // Aqui você pode adicionar verificação de segurança da Alexa
  // Por simplicidade, vamos pular essa parte inicialmente
  next();
};

// Endpoint principal que a Alexa vai chamar
app.post('/alexa', verifyAlexaRequest, async (req, res) => {
  try {
    const alexaRequest = req.body;
    
    // Verificar o tipo de requisição
    if (alexaRequest.request.type === 'LaunchRequest') {
      // Quando o usuário abre a skill
      const response = {
        version: '1.0',
        response: {
          outputSpeech: {
            type: 'PlainText',
            text: 'Olá! Sou sua Alexa inteligente. O que você gostaria de saber?'
          },
          shouldEndSession: false
        }
      };
      return res.json(response);
    }
    
    if (alexaRequest.request.type === 'IntentRequest') {
      const intent = alexaRequest.request.intent;
      
      if (intent.name === 'ChatGPTIntent') {
        // Pegar a pergunta do usuário
        const userQuestion = intent.slots.question.value;
        
        if (!userQuestion) {
          const response = {
            version: '1.0',
            response: {
              outputSpeech: {
                type: 'PlainText',
                text: 'Desculpe, não entendi sua pergunta. Pode repetir?'
              },
              shouldEndSession: false
            }
          };
          return res.json(response);
        }
        
        // Enviar pergunta para ChatGPT
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Você é uma assistente inteligente integrada à Alexa. Responda de forma clara, concisa e natural para ser falada em voz alta. Limite suas respostas a 2-3 frases quando possível."
            },
            {
              role: "user",
              content: userQuestion
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
        });
        
        const chatgptResponse = completion.choices[0].message.content;
        
        // Responder para a Alexa
        const response = {
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: chatgptResponse
            },
            shouldEndSession: false
          }
        };
        
        return res.json(response);
      }
      
      // Intent para encerrar
      if (intent.name === 'AMAZON.StopIntent' || intent.name === 'AMAZON.CancelIntent') {
        const response = {
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: 'Até logo!'
            },
            shouldEndSession: true
          }
        };
        return res.json(response);
      }
    }
    
    if (alexaRequest.request.type === 'SessionEndedRequest') {
      // Sessão encerrada
      return res.json({});
    }
    
  } catch (error) {
    console.error('Erro:', error);
    
    const errorResponse = {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'Desculpe, ocorreu um erro. Tente novamente.'
        },
        shouldEndSession: true
      }
    };
    
    return res.json(errorResponse);
  }
});

// Endpoint de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📡 Endpoint da Alexa: http://0.0.0.0:${port}/alexa`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../core/services/chat-service';
import { DocumentService } from '../../../core/services/document-service';
import { ChatMessage } from '../../../core/model/chat-message';
import { DocumentModel } from '../../../core/model/document-model';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.css'
})
export class ChatPage {

  message = '';

  messages = signal<ChatMessage[]>([]);  isLoading = signal(false);

  constructor(private chatService: ChatService,
    private documentService: DocumentService) {}

    uploadMessage = signal('');
    documents = signal<DocumentModel[]>([]);

  
sendMessage() {

  if (!this.message.trim()) {
    return;
  }

  const userMessage = this.message;

  this.addUserMessage(userMessage);

  this.addLoadingMessage();

  this.message = '';

  this.chatService.askQuestion(

    this.buildChatRequest(userMessage)

  ).subscribe({

    next: (response) => {

      this.updateLastAssistantMessage(
        response.answer
      );

    },

    error: () => {

      this.updateLastAssistantMessage(
        'Erreur serveur'
      );

    }

  });

}

private addUserMessage(
  content: string
) {

  this.messages.update(messages => [

    ...messages,

    {
      role: 'user',
      content: content
    }

  ]);

}


private addLoadingMessage() {

  this.messages.update(messages => [

    ...messages,

    {
      role: 'assistant',
      content: '',
      loading: true
    }

  ]);

}


private buildChatRequest(
  message: string
) {

  return {

    message: message,

    documentIds:

      this.documents()

        .filter(document =>
            document.selected
        )

        .map(document =>
            document.id
        )

  };

}


private updateLastAssistantMessage(
  content: string
) {

  this.messages.update(messages => {

    const updated = [...messages];

    updated[updated.length - 1] = {

      role: 'assistant',

      content: content,

      loading: false

    };

    return updated;

  });

}

onFileSelected(event: any) {

  const file = event.target.files[0];

  if (!file) {
    return;
  }
this.documentService.upload(file)
  .subscribe({

    next: (response) => {

      this.uploadMessage.set(
        `✅ ${response.filename} uploadé`
      );

      this.documents.update(documents => [
      ...documents,
  {
    id: response.id,

      name: response.filename,

      selected: true
  }
]);
    },

    error: () => {

      this.uploadMessage.set(
        `❌ erreur upload`
      );

    }

  });

  event.target.value = '';

}

toggleDocument(id: string) {

  this.documents.update(documents =>

    documents.map(document => ({

      ...document,

      selected:
        document.id === id
          ? !document.selected
          : document.selected

    }))

  );
}

}
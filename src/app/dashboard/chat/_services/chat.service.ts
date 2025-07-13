"use server";
import api from "@/interceptors/axios.interceptor";
import { APIResponse } from "@/services/types/definition.type";

export interface SendMessageData {
  chatId: string;
  content: string;
  attachments?: string[];
}

export interface ChatMessage {
  _id: string;
  chatId: string;
  sender: {
    _id: string;
    username: string;
    email: string;
  };
  content: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

const endpoint = "/chats/workspace/";

export async function getGeneralChatId(workspaceId: string): Promise<APIResponse> {
  console.log({ workspaceId });
  const res = await api.get(endpoint + workspaceId);
  console.log({ chatGeneral: res.data });

  if (res?.data?.error) {
    return {
      success: false,
      message: res?.data.error || "Une erreur s'est produite de la recuperation de l'ID du chat general",
    }
  }

  return {
    success: true,
    message: "Recuperation de l'ID reussie !",
    data: res.data.data
  }
}

export async function getChatMessages(chatId: string, limit = 10, before?: string): Promise<APIResponse> {
  try {
    let url = `/chats/${chatId}/messages?limit=${limit}`;
    if (before) {
      url += `&before=${before}`;
    }
    
    const res = await api.get(url);
    
    if (res?.data?.error) {
      return {
        success: false,
        message: res?.data.error || "Une erreur s'est produite lors de la récupération des messages",
      }
    }

    return {
      success: true,
      message: "Messages récupérés avec succès !",
      data: res.data.data
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return {
      success: false,
      message: "Une erreur s'est produite lors de la récupération des messages",
    }
  }
}


export async function createChatPrivate(params: { userId: string, workspaceId: string }): Promise<APIResponse> {
  try {
    const res = await api.post("/chats/dm", params);
    if (res?.data?.error) {
      return {
        success: false,
        message: res?.data.error || "Une erreur s'est produite lors de la création du chat privé",
      };
    }
    return {
      success: true,
      message: "Chat privé créé avec succès !",
      data: res.data.data,
    };
  } catch (error) {
    console.error('Erreur lors de la création du chat privé:', error);
    return {
      success: false,
      message: "Une erreur s'est produite lors de la création du chat privé",
    };
  }
}




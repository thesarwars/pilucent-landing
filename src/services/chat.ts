'use server';

import { baseURL } from '@/app/helpers/api';
import { api } from '@/lib/request';

export const getChatRooms = async (
  token: string,
  limit: number = 10,
  page: number = 1
): Promise<TApiResponse<TChatRoomsResponse>> => {
  try {
    const response = await api({
      endpoint: `chat/rooms?page=${page}&limit=${limit}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to get chat rooms',
        data: null,
      };
    }
    const data: TChatRoomsResponse = await response.json();
    return {
      success: true,
      message: 'Chat rooms fetched successfully',
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to get chat rooms',
      data: null,
    };
  }
};

export const getChatRoom = async (
  token: string,
  uid: string
): Promise<TApiResponse<TChatRoomResult>> => {
  try {
    const response = await api({
      endpoint: `chat/rooms/${uid}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to get chat room',
        data: null,
      };
    }
    const data: TChatRoomResult = await response.json();
    return {
      success: true,
      message: 'Chat room fetched successfully',
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to get chat room',
      data: null,
    };
  }
};

export const createChatRoom = async (
  token: string,
  body: {
    title: string;
    description: string;
  }
): Promise<TApiResponse<TChatRoomCreateResponse>> => {
  try {
    const response = await api({
      endpoint: 'chat/rooms',
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to create chat room',
        data: null,
      };
    }
    const data: TChatRoomCreateResponse = await response.json();
    return {
      success: true,
      message: 'Chat room created successfully',
      data: data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to create chat room',
      data: null,
    };
  }
};

export const updateChatRoom = async (
  token: string,
  uid: string,
  body: {
    title: string;
    description: string;
  }
): Promise<TApiResponse<TChatRoomCreateResponse>> => {
  try {
    const response = await api({
      endpoint: `chat/rooms/${uid}/`,
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to update chat room',
        data: null,
      };
    }
    const data: TChatRoomCreateResponse = await response.json();
    return {
      success: true,
      message: 'Chat room updated successfully',
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update chat room',
      data: null,
    };
  }
};

export const deleteChatRoom = async (token: string, uid: string): Promise<TApiResponse<void>> => {
  try {
    const response = await api({
      endpoint: `chat/rooms/${uid}/`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to delete chat room',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Chat room deleted successfully',
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to delete chat room',
      data: null,
    };
  }
};

export const addChatRoomMember = async (
  token: string,
  uid: string,
  body: {
    user_uids: string[];
    role: 'GROUP_ADMIN' | 'MODERATOR' | 'APPROVER' | 'FINANCE' | 'EMPLOYEE' | 'SYSTEM';
  }
): Promise<TApiResponse<TAddChatRoomMemberResponse>> => {
  try {
    const response = await api({
      endpoint: `chat/rooms/${uid}/add-members/`,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.log(response, '------response');
      throw new Error('Failed to add chat room member');
    }
    const data: TAddChatRoomMemberResponse = await response.json();
    return {
      success: true,
      message: 'Chat room member added successfully',
      data: data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to add chat room member',
      data: null,
    };
  }
};

export const uploadFiles = async (
  token: string,
  file: File
): Promise<TApiResponse<TUploadFilesResponse>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    // Multipart upload: do not set Content-Type (browser sets boundary). `api()` forces JSON.
    const response = await fetch(`${baseURL}/we/attachments`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to upload files',
        data: null,
      };
    }
    const data: TUploadFilesResponse = await response.json();
    return {
      success: true,
      message: 'Files uploaded successfully',
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to upload files',
      data: null,
    };
  }
};

export const getChatDMMessages = async ({
  uid,
  page,
  limit,
  token,
}: {
  uid: string;
  page: number;
  limit: number;
  token: string;
}): Promise<TApiResponse<TChatMessageResponse>> => {
  try {
    if (!token || !uid) {
      return {
        success: false,
        message: 'Unauthorized',
        data: null,
      };
    }
    const response = await api({
      endpoint: `chat/messages?user_uid=${uid}&page=${page}&limit=${limit}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to get chat room messages',
        data: null,
      };
    }
    const data: TChatMessageResponse = await response.json();
    return {
      success: true,
      message: 'Chat room messages fetched successfully',
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to get chat room messages',
      data: null,
    };
  }
};

export const getChatGroupMessages = async ({
  uid,
  page,
  limit,
  token,
}: {
  uid: string;
  page: number;
  limit: number;
  token: string;
}): Promise<TApiResponse<TChatGroupMessageResponse>> => {
  try {
    if (!token || !uid) {
      return {
        success: false,
        message: 'Unauthorized',
        data: null,
      };
    }
    const response = await api({
      endpoint: `chat/rooms/${uid}/messages?page=${page}&limit=${limit}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.log(response, 'response for chat group messages');
      return {
        success: false,
        message: 'Failed to get chat room messages',
        data: null,
      };
    }
    const data: TChatGroupMessageResponse = await response.json();
    console.log(data, 'data for chat group messages');
    return {
      success: true,
      message: 'Chat room messages fetched successfully',
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to get chat room messages',
      data: null,
    };
  }
};

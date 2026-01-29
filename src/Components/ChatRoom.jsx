import React from 'react';
import ChatRoomLayout from './ChatRoomLayout';

export default function ChatRoom() {
    return (
        <ChatRoomLayout
            title="Chat Room"
            subtitle="Navigate through the tabs to access specific chat rooms"
            showChat={false}
        />
    );
}

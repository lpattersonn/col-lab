import React from 'react';
import ChatRoomLayout from './ChatRoomLayout';

export default function ChatRoomShareResources() {
    return (
        <ChatRoomLayout
            title="Chat Room - Share Resources"
            enableDrawer={true}
            drawerConfig={{
                buttonLabel: 'Chat Guide',
                headerTitle: 'Share Resources Request',
                pointsLabel: '*5 points required',
                fields: [
                    {
                        type: 'text',
                        label: 'Resource request title (150 characters max)',
                        placeholder: 'ex. Need access to a fluorescence microscope.',
                        maxLength: 150,
                    },
                    {
                        type: 'textarea',
                        label: 'Description',
                        placeholder:
                            'Explain what you need, how long you need it, and any constraints.',
                    },
                    {
                        type: 'text',
                        label: 'Location or institution',
                    },
                    {
                        type: 'date',
                        label: 'Needed by date',
                    },
                    {
                        type: 'select',
                        label: 'Resource type',
                        options: ['Choose an option', 'Equipment', 'Supplies', 'Software', 'Space'],
                    },
                ],
            }}
        />
    );
}

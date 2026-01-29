import React from 'react';
import ChatRoomLayout from './ChatRoomLayout';

export default function ChatRoomLearningCenter() {
    return (
        <ChatRoomLayout
            title="Chat Room - Learning Center"
            enableDrawer={true}
            drawerConfig={{
                buttonLabel: 'Chat Guide',
                headerTitle: 'Learning Center Request',
                pointsLabel: '*5 points required',
                fields: [
                    {
                        type: 'text',
                        label: 'Request title (150 characters max)',
                        placeholder: 'ex. Need help understanding CRISPR basics.',
                        maxLength: 150,
                    },
                    {
                        type: 'textarea',
                        label: 'Description',
                        placeholder:
                            'Share what you are trying to learn and what you have tried so far.',
                    },
                    {
                        type: 'text',
                        label: 'Topics (max. 5)',
                    },
                    {
                        type: 'date',
                        label: 'Preferred completion date',
                    },
                    {
                        type: 'select',
                        label: 'Support type',
                        options: ['Choose an option', 'Q&A', 'Study group', 'Resource share'],
                    },
                ],
            }}
        />
    );
}

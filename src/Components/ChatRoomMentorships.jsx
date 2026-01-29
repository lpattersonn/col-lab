import React from 'react';
import ChatRoomLayout from './ChatRoomLayout';

export default function ChatRoomMentorships() {
    return (
        <ChatRoomLayout
            title="Chat Room - Mentorships"
            enableDrawer={true}
            drawerConfig={{
                buttonLabel: 'Chat Guide',
                headerTitle: 'Mentorship Request',
                pointsLabel: '*5 points required',
                fields: [
                    {
                        type: 'text',
                        label: 'Type your request briefly (150 characters max)',
                        placeholder: 'ex. Seeking guidance on grant writing.',
                        maxLength: 150,
                    },
                    {
                        type: 'textarea',
                        label: 'Description',
                        placeholder:
                            'Share what you are hoping to learn and any relevant context for your request.',
                    },
                    {
                        type: 'text',
                        label: 'Areas of focus (max. 5)',
                    },
                    {
                        type: 'date',
                        label: 'Target start date',
                    },
                    {
                        type: 'select',
                        label: 'Session format',
                        options: ['Choose an option', 'One-time', 'Ongoing', 'Project-based'],
                    },
                ],
            }}
        />
    );
}

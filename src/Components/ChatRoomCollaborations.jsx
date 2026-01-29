import React from 'react';
import ChatRoomLayout from './ChatRoomLayout';

export default function ChatRoomCollaborations() {
    return (
        <ChatRoomLayout
            title="Chat Room - Collaborations"
            enableDrawer={true}
            drawerConfig={{
                buttonLabel: 'Chat Guide',
                headerTitle: 'Collaboration Request',
                pointsLabel: '*5 points required',
                fields: [
                    {
                        type: 'text',
                        label: 'Type your request briefly (150 characters max)',
                        placeholder: 'ex. Need help creating a knockout cell line.',
                        maxLength: 150,
                    },
                    {
                        type: 'textarea',
                        label: 'Description',
                        placeholder:
                            'Explain your request in further detail. Please keep project explanations sufficiently vague to avoid scooping.',
                    },
                    {
                        type: 'text',
                        label: 'Enter major skills required (max. 5)',
                    },
                    {
                        type: 'date',
                        label: 'Deadline for project completion',
                    },
                    {
                        type: 'select',
                        label: 'Compensation',
                        options: ['Choose an option', 'Points', 'Co-authorship', 'Paid'],
                    },
                ],
            }}
        />
    );
}

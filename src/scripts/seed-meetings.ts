import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MeetingsService } from '../meetings/meetings.service';
import { UsersService } from '../users/users.service';

async function seedMeetings() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const meetingsService = app.get(MeetingsService);
  const usersService = app.get(UsersService);

  try {
    console.log('🌱 Starting to seed meetings...');

    // Get all users to use as organizers and participants
    const users = await usersService.findAll();
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      await app.close();
      return;
    }

    console.log(`📊 Found ${users.length} users`);

    // Sample meetings data
    const meetingsData = [
      {
        title: 'Team Standup Meeting',
        description: 'Daily standup to discuss progress and blockers',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '09:30',
        videoEnabled: true,
        participantIds: users.slice(1, 3).map(u => (u as any).id || (u as any)._id?.toString()),
      },
      {
        title: 'Project Planning Session',
        description: 'Planning session for the new mobile app features',
        date: '2024-01-16',
        startTime: '14:00',
        endTime: '15:30',
        videoEnabled: true,
        participantIds: users.slice(0, 2).map(u => (u as any).id || (u as any)._id?.toString()),
      },
      {
        title: 'Client Presentation',
        description: 'Presenting the latest prototype to the client',
        date: '2024-01-17',
        startTime: '10:00',
        endTime: '11:00',
        videoEnabled: true,
        participantIds: users.map(u => (u as any).id || (u as any)._id?.toString()),
      },
      {
        title: 'Code Review Session',
        description: 'Weekly code review and best practices discussion',
        date: '2024-01-18',
        startTime: '16:00',
        endTime: '17:00',
        videoEnabled: false,
        participantIds: users.slice(1).map(u => (u as any).id || (u as any)._id?.toString()),
      },
      {
        title: 'Sprint Retrospective',
        description: 'Retrospective meeting for the completed sprint',
        date: '2024-01-19',
        startTime: '11:00',
        endTime: '12:00',
        videoEnabled: true,
        participantIds: users.slice(0, 3).map(u => (u as any).id || (u as any)._id?.toString()),
      },
    ];

    // Create meetings with different organizers
    for (let i = 0; i < meetingsData.length; i++) {
      const organizerIndex = i % users.length;
      const organizer = users[organizerIndex];
      const organizerId = (organizer as any).id || (organizer as any)._id?.toString();
      
      try {
        const meeting = await meetingsService.create(organizerId, meetingsData[i]);
        console.log(`✅ Created meeting: "${meeting.title}" organized by ${organizer.fullName}`);
      } catch (error) {
        console.error(`❌ Failed to create meeting "${meetingsData[i].title}":`, error.message);
      }
    }

    console.log('🎉 Meeting seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding meetings:', error);
  } finally {
    await app.close();
  }
}

// Run the seeding function
seedMeetings().catch(console.error); 
// Railway backend URL
const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

export async function fetchWithAuth(url, options = {}) {
  // If it's a real API call, use the Railway backend
  if (url.startsWith('/api/') || url.startsWith('/dashboard/') || url.startsWith('/auth/')) {
    try {
      console.log('🚀 Making API call to:', `${API_BASE_URL}${url}`);
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
        const data = await response.json();
        console.log('✅ API Response data:', data);
        
        // Transform data to match frontend expectations
        if (url === '/dashboard/appointments') {
          return data.map(appointment => ({
            ...appointment,
            student_name: appointment.telegram_username ? 
              `@${appointment.telegram_username}` : 
              `Student #${appointment.student_id}`,
            notes: appointment.notes || 'No notes available'
          }));
        }
        
        if (url === '/dashboard/announcements') {
          return data.map(announcement => ({
            ...announcement,
            title: announcement.message.substring(0, 50) + (announcement.message.length > 50 ? '...' : ''),
            created_at: announcement.created_at
          }));
        }
        
        return data;
    } catch (error) {
      console.error('❌ API call failed, falling back to mock data:', error);
      // Continue to fallback mock data
    }
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get data from localStorage or use defaults (fallback)
  const storedData = {
    '/dashboard/appointments': getStoredData('appointments', [
      { 
        id: 1, 
        student_id: 12345,
        student_name: 'John Doe', 
        start_ts: '2025-01-20T10:00:00+03:00', 
        end_ts: '2025-01-20T11:00:00+03:00',
        status: 'scheduled',
        notes: 'First counseling session'
      },
      { 
        id: 2, 
        student_id: 12346,
        student_name: 'Jane Smith', 
        start_ts: '2025-01-21T14:00:00+03:00', 
        end_ts: '2025-01-21T15:00:00+03:00',
        status: 'scheduled',
        notes: 'Follow-up session'
      }
    ]),
    '/dashboard/announcements': getStoredData('announcements', [
      { 
        id: 1, 
        title: 'Welcome to Counseling Services', 
        message: 'We are here to help you succeed in your academic journey!', 
        created_at: '2025-01-19T09:00:00+03:00',
        is_force: false
      },
      { 
        id: 2, 
        title: 'Important Update', 
        message: 'New counseling hours have been updated. Please check the schedule.', 
        created_at: '2025-01-18T14:30:00+03:00',
        is_force: true
      }
    ]),
    '/activities': getStoredData('activities', [
      { 
        id: 1, 
        title: 'Group Therapy Session', 
        description: 'Weekly group therapy for stress management',
        activity_date: '2025-01-25', 
        activity_time: '15:00',
        location: 'Room 101',
        created_at: '2025-01-19T10:00:00+03:00'
      },
      { 
        id: 2, 
        title: 'Study Skills Workshop', 
        description: 'Learn effective study techniques',
        activity_date: '2025-01-28', 
        activity_time: '10:00',
        location: 'Library Conference Room',
        created_at: '2025-01-19T10:00:00+03:00'
      },
      { 
        id: 3, 
        title: 'Mental Health Awareness', 
        description: 'Educational session on mental health',
        activity_date: '2025-01-30', 
        activity_time: '14:00',
        location: 'Main Hall',
        created_at: '2025-01-19T10:00:00+03:00'
      }
    ]),
    '/dashboard/books': getStoredData('books', [
      { 
        id: 1, 
        title: 'Mental Health Guide', 
        author: 'Dr. Smith', 
        price: 1500,
        pickup_station: 'Main Library',
        available: true,
        created_at: '2025-01-19T10:00:00+03:00'
      },
      { 
        id: 2, 
        title: 'Study Skills Handbook', 
        author: 'Prof. Johnson', 
        price: 2000,
        pickup_station: 'Student Center',
        available: true,
        created_at: '2025-01-19T10:00:00+03:00'
      }
    ]),
    '/dashboard/absence': getStoredData('absence', []),
    '/auth/profile': getStoredData('profile', {
      name: 'Admin User',
      email: 'admin@maseno.ac.ke',
      phone: '',
      specialization: '',
      bio: '',
      office_location: '',
      office_hours: ''
    }),
    '/recent-activity': generateRecentActivities()
  };
  
  return storedData[url] || [];
}

// Helper functions for localStorage persistence
const getStoredData = (key, defaultValue = []) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error loading stored data:', error);
    return defaultValue;
  }
};

const setStoredData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Generate recent activities from all data sources
const generateRecentActivities = () => {
  const activities = getStoredData('activities', []);
  const announcements = getStoredData('announcements', []);
  const appointments = getStoredData('appointments', []);
  const books = getStoredData('books', []);
  
  const recentActivities = [];
  
  // Add recent activities
  activities.slice(0, 3).forEach(activity => {
    recentActivities.push({
      id: `activity-${activity.id}`,
      type: 'activity',
      title: activity.title,
      description: activity.description,
      timestamp: activity.created_at,
      icon: '🎯'
    });
  });
  
  // Add recent announcements
  announcements.slice(0, 2).forEach(announcement => {
    recentActivities.push({
      id: `announcement-${announcement.id}`,
      type: 'announcement',
      title: announcement.title,
      description: announcement.message,
      timestamp: announcement.created_at,
      icon: '📢'
    });
  });
  
  // Add recent appointments
  appointments.slice(0, 2).forEach(appointment => {
    recentActivities.push({
      id: `appointment-${appointment.id}`,
      type: 'appointment',
      title: `Appointment with ${appointment.student_name}`,
      description: `Scheduled for ${new Date(appointment.start_ts).toLocaleDateString()}`,
      timestamp: appointment.created_at,
      icon: '📅'
    });
  });
  
  // Add recent books
  books.slice(0, 2).forEach(book => {
    recentActivities.push({
      id: `book-${book.id}`,
      type: 'book',
      title: book.title,
      description: `By ${book.author} - ${book.price} KES`,
      timestamp: book.created_at,
      icon: '📚'
    });
  });
  
  // Sort by timestamp (most recent first) and limit to 10
  return recentActivities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
};

// Update recent activities in localStorage
const updateRecentActivities = () => {
  const recentActivities = generateRecentActivities();
  setStoredData('recent-activity', recentActivities);
};

// Create a default export with axios-like API for the new pages
const api = {
  get: async (url) => {
    // If it's a real API call, use the Railway backend
    if (url.startsWith('/api/') || url.startsWith('/dashboard/') || url.startsWith('/auth/')) {
      try {
        console.log('🚀 API.get making call to:', `${API_BASE_URL}${url}`);
        const response = await fetch(`${API_BASE_URL}${url}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 API.get Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ API.get Response data:', data);
        
        // Transform data to match frontend expectations
        if (url === '/dashboard/appointments') {
          return data.map(appointment => ({
            ...appointment,
            student_name: appointment.telegram_username ? 
              `@${appointment.telegram_username}` : 
              `Student #${appointment.student_id}`,
            notes: appointment.notes || 'No notes available'
          }));
        }
        
        if (url === '/dashboard/announcements') {
          return data.map(announcement => ({
            ...announcement,
            title: announcement.message.substring(0, 50) + (announcement.message.length > 50 ? '...' : ''),
            created_at: announcement.created_at
          }));
        }
        
        return data;
      } catch (error) {
        console.error('❌ API.get call failed, falling back to mock data:', error);
        // Continue to fallback mock data
      }
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get data from localStorage or use defaults (fallback)
    const storedData = {
      '/dashboard/appointments': getStoredData('appointments', [
        { 
          id: 1, 
          student_id: 12345,
          student_name: 'John Doe', 
          start_ts: '2025-01-20T10:00:00+03:00', 
          end_ts: '2025-01-20T11:00:00+03:00',
          status: 'scheduled',
          notes: 'First counseling session'
        },
        { 
          id: 2, 
          student_id: 12346,
          student_name: 'Jane Smith', 
          start_ts: '2025-01-21T14:00:00+03:00', 
          end_ts: '2025-01-21T15:00:00+03:00',
          status: 'scheduled',
          notes: 'Follow-up session'
        }
      ]),
      '/dashboard/announcements': getStoredData('announcements', [
        { 
          id: 1, 
          title: 'Welcome to Counseling Services', 
          message: 'We are here to help you succeed in your academic journey!', 
          created_at: '2025-01-19T09:00:00+03:00',
          is_force: false
        },
        { 
          id: 2, 
          title: 'Important Update', 
          message: 'New counseling hours have been updated. Please check the schedule.', 
          created_at: '2025-01-18T14:30:00+03:00',
          is_force: true
        }
      ]),
      '/activities': getStoredData('activities', [
        { 
          id: 1, 
          title: 'Group Therapy Session', 
          description: 'Weekly group therapy for stress management',
          activity_date: '2025-01-25', 
          activity_time: '15:00',
          location: 'Room 101',
          created_at: '2025-01-19T10:00:00+03:00'
        },
        { 
          id: 2, 
          title: 'Study Skills Workshop', 
          description: 'Learn effective study techniques',
          activity_date: '2025-01-28', 
          activity_time: '10:00',
          location: 'Library Conference Room',
          created_at: '2025-01-19T10:00:00+03:00'
        },
        { 
          id: 3, 
          title: 'Mental Health Awareness', 
          description: 'Educational session on mental health',
          activity_date: '2025-01-30', 
          activity_time: '14:00',
          location: 'Main Hall',
          created_at: '2025-01-19T10:00:00+03:00'
        }
      ]),
      '/dashboard/books': getStoredData('books', [
        { 
          id: 1, 
          title: 'Mental Health Guide', 
          author: 'Dr. Smith', 
          price: 1500,
          pickup_station: 'Main Library',
          available: true,
          created_at: '2025-01-19T10:00:00+03:00'
        },
        { 
          id: 2, 
          title: 'Study Skills Handbook', 
          author: 'Prof. Johnson', 
          price: 2000,
          pickup_station: 'Student Center',
          available: true,
          created_at: '2025-01-19T10:00:00+03:00'
        }
      ]),
      '/dashboard/absence': getStoredData('absence', []),
      '/auth/profile': getStoredData('profile', {
        name: 'Admin User',
        email: 'admin@maseno.ac.ke',
        phone: '',
        specialization: '',
        bio: '',
        office_location: '',
        office_hours: ''
      }),
      '/recent-activity': generateRecentActivities()
    };
    
    return storedData[url] || [];
  },
  post: async (url, data) => {
    // If it's a real API call, use the Railway backend
    if (url.startsWith('/api/') || url.startsWith('/dashboard/') || url.startsWith('/auth/')) {
      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API call failed, falling back to mock data:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Handle adding new books
    if (url === '/dashboard/books') {
      const currentBooks = getStoredData('books', []);
      const newBook = {
        id: Date.now(), // Simple ID generation
        ...data,
        available: true,
        created_at: new Date().toISOString()
      };
      const updatedBooks = [newBook, ...currentBooks];
      setStoredData('books', updatedBooks);
      // Update recent activities
      updateRecentActivities();
      return { success: true, message: 'Book added successfully', book: newBook };
    }
    
    // Handle adding new announcements
    if (url === '/dashboard/announcements' || url === '/dashboard/announcements/force') {
      const currentAnnouncements = getStoredData('announcements', []);
      const newAnnouncement = {
        id: Date.now(),
        title: data.message.substring(0, 50) + (data.message.length > 50 ? '...' : ''),
        message: data.message,
        created_at: new Date().toISOString(),
        is_force: data.is_force || false
      };
      const updatedAnnouncements = [newAnnouncement, ...currentAnnouncements];
      setStoredData('announcements', updatedAnnouncements);
      // Update recent activities
      updateRecentActivities();
      return { success: true, message: 'Announcement posted successfully', announcement: newAnnouncement };
    }
    
    // Handle adding new activities
    if (url === '/activities') {
      const currentActivities = getStoredData('activities', []);
      const newActivity = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString()
      };
      const updatedActivities = [newActivity, ...currentActivities];
      setStoredData('activities', updatedActivities);
      // Update recent activities
      updateRecentActivities();
      return { success: true, message: 'Activity added successfully', activity: newActivity };
    }
    
    // Handle adding new appointments
    if (url === '/dashboard/appointments') {
      const currentAppointments = getStoredData('appointments', []);
      const newAppointment = {
        id: Date.now(),
        ...data,
        status: 'scheduled',
        created_at: new Date().toISOString()
      };
      const updatedAppointments = [newAppointment, ...currentAppointments];
      setStoredData('appointments', updatedAppointments);
      // Update recent activities
      updateRecentActivities();
      return { success: true, message: 'Appointment added successfully', appointment: newAppointment };
    }
    
    // Handle adding absence days
    if (url === '/dashboard/absence') {
      const currentAbsence = getStoredData('absence', []);
      const newAbsenceDay = {
        id: Date.now(),
        date: data.date,
        created_at: new Date().toISOString()
      };
      const updatedAbsence = [newAbsenceDay, ...currentAbsence];
      setStoredData('absence', updatedAbsence);
      return { success: true, message: 'Absence day marked successfully', absence: newAbsenceDay };
    }
    
    // Handle appointment cancellation
    if (url.includes('/appointments/') && url.includes('/cancel')) {
      const appointmentId = parseInt(url.split('/')[3]);
      const currentAppointments = getStoredData('appointments', []);
      const updatedAppointments = currentAppointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: 'cancelled' }
          : appointment
      );
      setStoredData('appointments', updatedAppointments);
      return { success: true, message: 'Appointment cancelled successfully' };
    }
    
    // Handle appointment postponement
    if (url.includes('/appointments/') && url.includes('/postpone')) {
      const appointmentId = parseInt(url.split('/')[3]);
      const currentAppointments = getStoredData('appointments', []);
      const updatedAppointments = currentAppointments.map(appointment => 
        appointment.id === appointmentId 
          ? { 
              ...appointment, 
              start_ts: data.new_start_ts,
              end_ts: data.new_end_ts,
              status: 'rescheduled'
            }
          : appointment
      );
      setStoredData('appointments', updatedAppointments);
      return { success: true, message: 'Appointment postponed successfully' };
    }
    
    return { success: true, message: 'Operation completed successfully' };
  },
  put: async (url, data) => {
    // If it's a real API call, use the Railway backend
    if (url.startsWith('/api/') || url.startsWith('/dashboard/') || url.startsWith('/auth/')) {
      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API call failed, falling back to mock data:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Handle updating books
    if (url.startsWith('/dashboard/books/')) {
      const bookId = parseInt(url.split('/').pop());
      const currentBooks = getStoredData('books', []);
      const updatedBooks = currentBooks.map(book => 
        book.id === bookId ? { ...book, ...data } : book
      );
      setStoredData('books', updatedBooks);
      return { success: true, message: 'Book updated successfully' };
    }
    
    // Handle updating activities
    if (url.startsWith('/activities/')) {
      const activityId = parseInt(url.split('/').pop());
      const currentActivities = getStoredData('activities', []);
      const updatedActivities = currentActivities.map(activity => 
        activity.id === activityId ? { ...activity, ...data } : activity
      );
      setStoredData('activities', updatedActivities);
      return { success: true, message: 'Activity updated successfully' };
    }
    
    // Handle updating profile
    if (url === '/auth/profile') {
      const currentProfile = getStoredData('profile', {
        name: 'Admin User',
        email: 'admin@maseno.ac.ke',
        phone: '',
        specialization: '',
        bio: '',
        office_location: '',
        office_hours: ''
      });
      const updatedProfile = { ...currentProfile, ...data };
      setStoredData('profile', updatedProfile);
      return { 
        success: true, 
        message: 'Profile updated successfully',
        counselor: updatedProfile
      };
    }
    
    // Handle password change
    if (url === '/auth/password') {
      // For demo purposes, always return success
      // In a real app, you'd validate the current password
      return { 
        success: true, 
        message: 'Password updated successfully'
      };
    }
    
    return { success: true, message: 'Update completed successfully' };
  },
  delete: async (url) => {
    // If it's a real API call, use the Railway backend
    if (url.startsWith('/api/') || url.startsWith('/dashboard/') || url.startsWith('/auth/')) {
      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API call failed, falling back to mock data:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Handle deleting books
    if (url.startsWith('/dashboard/books/')) {
      const bookId = parseInt(url.split('/').pop());
      const currentBooks = getStoredData('books', []);
      const updatedBooks = currentBooks.filter(book => book.id !== bookId);
      setStoredData('books', updatedBooks);
      return { success: true, message: 'Book deleted successfully' };
    }
    
    // Handle deleting announcements
    if (url.startsWith('/dashboard/announcements/')) {
      const announcementId = parseInt(url.split('/').pop());
      const currentAnnouncements = getStoredData('announcements', []);
      const updatedAnnouncements = currentAnnouncements.filter(announcement => announcement.id !== announcementId);
      setStoredData('announcements', updatedAnnouncements);
      return { success: true, message: 'Announcement deleted successfully' };
    }
    
    // Handle deleting activities
    if (url.startsWith('/activities/')) {
      const activityId = parseInt(url.split('/').pop());
      const currentActivities = getStoredData('activities', []);
      const updatedActivities = currentActivities.filter(activity => activity.id !== activityId);
      setStoredData('activities', updatedActivities);
      return { success: true, message: 'Activity deleted successfully' };
    }
    
    // Handle deleting appointments
    if (url.startsWith('/dashboard/appointments/')) {
      const appointmentId = parseInt(url.split('/').pop());
      const currentAppointments = getStoredData('appointments', []);
      const updatedAppointments = currentAppointments.filter(appointment => appointment.id !== appointmentId);
      setStoredData('appointments', updatedAppointments);
      return { success: true, message: 'Appointment deleted successfully' };
    }
    
    // Handle deleting absence days
    if (url.startsWith('/dashboard/absence/')) {
      const absenceId = parseInt(url.split('/').pop());
      const currentAbsence = getStoredData('absence', []);
      const updatedAbsence = currentAbsence.filter(absence => absence.id !== absenceId);
      setStoredData('absence', updatedAbsence);
      return { success: true, message: 'Absence day removed successfully' };
    }
    
    return { success: true, message: 'Delete completed successfully' };
  },
};

export default api;
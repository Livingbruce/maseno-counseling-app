import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db/pool.js";
import fetch from "node-fetch";
import cron from "node-cron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const bot = new Telegraf(process.env.BOT_TOKEN);

// User session management
const userSessions = new Map();

// Booking session management
const bookingSessions = new Map();

// Support session management
const supportSessions = new Map();

// Helper function to get or create user session
async function getUserSession(telegramUserId, userInfo = {}) {
  try {
    // Check if user exists in database
    const userResult = await pool.query(
      "SELECT * FROM user_sessions WHERE telegram_user_id = $1",
      [telegramUserId]
    );

    if (userResult.rows.length === 0) {
      // Create new user session
      const newUser = await pool.query(
        `INSERT INTO user_sessions (telegram_user_id, telegram_username, first_name, last_name)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          telegramUserId,
          userInfo.username || null,
          userInfo.first_name || null,
          userInfo.last_name || null
        ]
      );
      return newUser.rows[0];
    } else {
      // Update user info if needed
      if (userInfo.username || userInfo.first_name || userInfo.last_name) {
        await pool.query(
          `UPDATE user_sessions 
           SET telegram_username = COALESCE($2, telegram_username),
               first_name = COALESCE($3, first_name),
               last_name = COALESCE($4, last_name),
               updated_at = now()
           WHERE telegram_user_id = $1`,
          [
            telegramUserId,
            userInfo.username || null,
            userInfo.first_name || null,
            userInfo.last_name || null
          ]
        );
      }
      return userResult.rows[0];
    }
  } catch (err) {
    console.error("Error managing user session:", err);
    return null;
  }
}

// Helper function to get user's appointments
async function getUserAppointments(telegramUserId) {
  try {
    const result = await pool.query(
      `SELECT a.*, s.name as student_name, s.admission_no, s.phone, s.year_of_study as year, c.name as counselor_name
       FROM appointments a
       LEFT JOIN students s ON a.student_id = s.id
       LEFT JOIN counselors c ON a.counselor_id = c.id
       WHERE a.telegram_user_id = $1
       ORDER BY a.start_ts DESC`,
      [telegramUserId]
    );
    return result.rows;
  } catch (err) {
    console.error("Error fetching user appointments:", err);
    return [];
  }
}

// Helper function to format appointment date
function formatAppointmentDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  
  return `${month}/${day}/${year}, ${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

// Support system functions
async function createSupportTicket(telegramUserId, telegramUsername, subject, description, priority = 'medium') {
  try {
    // Get student info if available
    const studentResult = await pool.query(
      "SELECT name, admission_no FROM students WHERE id IN (SELECT student_id FROM appointments WHERE telegram_user_id = $1) LIMIT 1",
      [telegramUserId]
    );
    
    const studentName = studentResult.rows.length > 0 ? studentResult.rows[0].name : null;
    const admissionNo = studentResult.rows.length > 0 ? studentResult.rows[0].admission_no : null;
    
    const result = await pool.query(
      `INSERT INTO support_tickets (telegram_user_id, telegram_username, student_name, admission_no, subject, description, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [telegramUserId, telegramUsername, studentName, admissionNo, subject, description, priority]
    );
    
    return result.rows[0];
  } catch (err) {
    console.error("Error creating support ticket:", err);
    return null;
  }
}

async function getUserSupportTickets(telegramUserId) {
  try {
    const result = await pool.query(
      `SELECT st.*, c.name as assigned_counselor_name
       FROM support_tickets st
       LEFT JOIN counselors c ON st.assigned_counselor_id = c.id
       WHERE st.telegram_user_id = $1
       ORDER BY st.created_at DESC`,
      [telegramUserId]
    );
    return result.rows;
  } catch (err) {
    console.error("Error fetching user support tickets:", err);
    return [];
  }
}

async function getTicketReplies(ticketId) {
  try {
    const result = await pool.query(
      `SELECT sm.*, c.name as counselor_name
       FROM support_messages sm
       LEFT JOIN counselors c ON sm.sender_id = c.id AND sm.sender_type = 'counselor'
       WHERE sm.ticket_id = $1
       ORDER BY sm.created_at ASC`,
      [ticketId]
    );
    return result.rows;
  } catch (err) {
    console.error("Error fetching ticket replies:", err);
    return [];
  }
}

async function addSupportMessage(ticketId, senderType, senderId, message, isInternal = false) {
  try {
    const result = await pool.query(
      `INSERT INTO support_messages (ticket_id, sender_type, sender_id, message, is_internal)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [ticketId, senderType, senderId, message, isInternal]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error adding support message:", err);
    return null;
  }
}

async function getSupportCategories() {
  try {
    const result = await pool.query("SELECT * FROM support_categories WHERE is_active = true ORDER BY name");
    return result.rows;
  } catch (err) {
    console.error("Error fetching support categories:", err);
    return [];
  }
}

// Step-by-step booking functions
function startBookingSession(userId) {
  bookingSessions.set(userId, {
    step: 'name',
    data: {}
  });
}

function updateBookingSession(userId, step, data) {
  const session = bookingSessions.get(userId) || { data: {} };
  session.step = step;
  session.data = { ...session.data, ...data };
  // Preserve lastMessageId if it exists in the data
  if (data.lastMessageId) {
    session.lastMessageId = data.lastMessageId;
  }
  bookingSessions.set(userId, session);
}

function getBookingSession(userId) {
  return bookingSessions.get(userId);
}

function clearBookingSession(userId) {
  bookingSessions.delete(userId);
}

function getSupportSession(userId) {
  return supportSessions.get(userId);
}

function updateSupportSession(userId, nextStep, data = {}) {
  const session = supportSessions.get(userId) || {};
  supportSessions.set(userId, {
    ...session,
    step: nextStep,
    ...data
  });
}

function clearSupportSession(userId) {
  supportSessions.delete(userId);
}

function formatBookingSummary(data) {
  return `Booking Summary:\n\n` +
         `Name: ${data.name}\n` +
         `Admission No: ${data.admission_no}\n` +
         `Phone: ${data.phone}\n` +
         `Year of Study: ${data.year}\n` +
         `Counselor: ${data.counselor_name}\n` +
         `Date & Time: ${data.datetime}\n\n` +
         `Is this information correct? Type 'yes' to confirm or 'no' to start over.`;
}

// Test database connection
bot.use(async (ctx, next) => {
  try {
    await pool.query('SELECT 1');
    console.log("Database connection successful");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
  next();
});

// User authentication middleware
bot.use(async (ctx, next) => {
  if (ctx.from) {
    const userSession = await getUserSession(ctx.from.id, {
      username: ctx.from.username,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name
    });
    
    if (userSession) {
      ctx.userSession = userSession;
      console.log(`User ${ctx.from.id} (${ctx.from.username || 'no username'}) authenticated`);
    }
  }
  next();
});

// Enhanced start command with more conversational tone
bot.start(async (ctx) => {
  console.log("Bot start command received from user:", ctx.from.username || ctx.from.id);
  
  const welcomeMessage = `Hello ${ctx.from.first_name || 'Student'}! Welcome to Maseno Counseling Bot.

I'm here to help you with counseling services. You can book appointments, get support, or ask questions.

Here's how I can help you:
• Booking: Click 'Book Appointment' and I'll guide you through it
• Cancel: Type 'cancel' followed by your appointment number  
• My Appointments: Click to see all your bookings
• Support: Click if you need help with anything
• Contact: Click for office information

Everything is simple and I'll guide you through each step.`;
  
  ctx.reply(welcomeMessage, {
    reply_markup: {
      keyboard: [
        ["📅 Book Appointment", "❌ Cancel Appointment"],
        ["Counselors", "📢 Announcements"],
        ["🗓 Activities", "📚 Books for Sale"],
        ["📋 My Appointments", "🆘 Support"],
        ["ℹ️ Help", "📞 Contact"]
      ],
      resize_keyboard: true,
    },
  });
});

// Enhanced counselors display
bot.hears("Counselors", async (ctx) => {
  try {
    const result = await pool.query("SELECT id, name FROM counselors");
    if (result.rows.length === 0) {
      return ctx.reply("No counselors are registered yet. Please contact the admin for help.");
    }
    let msg = "Meet Our Counselors:\n\n";
    result.rows.forEach((c, i) => {
      msg += `${i + 1}. ${c.name}\n`;
    });
    msg += "\nReady to book?\n";
    msg += "Click 'Book Appointment' and I'll walk you through everything.";
    ctx.reply(msg);
  } catch (err) {
    console.error("Counselors error:", err);
    ctx.reply("I had trouble getting the counselor list. Please try again in a moment.");
  }
});

// Enhanced booking process with more conversational tone
bot.hears("📅 Book Appointment", async (ctx) => {
  try {
    const result = await pool.query("SELECT id, name FROM counselors");
    if (result.rows.length === 0) {
      return ctx.reply("No counselors are available right now. Please contact admin for help.");
    }
    
    // Start booking session
    startBookingSession(ctx.from.id);
    
    let msg = "Let's Book Your Appointment!\n\n";
    msg += "I'll guide you through this step by step.\n\n";
    msg += "Step 1 of 6: What's your full name?\n\n";
    msg += "Type your name like this:\n";
    msg += "John Doe";
    
    const replyMsg = await ctx.reply(msg);
    updateBookingSession(ctx.from.id, 'name', {});
    const initialSession = getBookingSession(ctx.from.id);
    initialSession.lastMessageId = replyMsg.message_id;
  } catch (err) {
    console.error("Book appointment error:", err);
    ctx.reply("Something went wrong. Let me try that again for you.");
  }
});

// Step-by-step booking handler will be added at the end

// Enhanced appointments display
bot.hears("📋 My Appointments", async (ctx) => {
  try {
    const appointments = await getUserAppointments(ctx.from.id);
    
    if (appointments.length === 0) {
      return ctx.reply("📋 You don't have any appointments yet!\n\nReady to book your first one? Just click '📅 Book Appointment' and I'll help you! 😊");
    }
    
    let msg = "📋 **Here are your appointments:**\n\n";
    appointments.forEach((appointment, index) => {
      const statusEmoji = appointment.status === 'confirmed' ? "✅" : 
                         appointment.status === 'cancelled' ? "❌" : "⏳";
      
      msg += `${index + 1}. ${statusEmoji} **Appointment #${appointment.id}**\n`;
      msg += `   👤 Student: ${appointment.student_name}\n`;
      msg += `   🏥 Counselor: ${appointment.counselor_name}\n`;
      msg += `   📅 Date: ${formatAppointmentDate(appointment.start_ts)}\n`;
      msg += `   📊 Status: ${appointment.status.toUpperCase()}\n\n`;
    });
    
    msg += "💡 **Need to cancel?** Type: `cancel [ID]`\n";
    msg += "💡 **Check details?** Type: `status [ID]`\n\n";
    msg += "**I'm here if you need any help!** 😊";
    
    ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error("Error fetching user appointments:", err);
    ctx.reply("Oops! I couldn't load your appointments. Let me try that again! 😅");
  }
});

// Enhanced cancel appointment
bot.hears("❌ Cancel Appointment", async (ctx) => {
  ctx.reply("No problem! To cancel an appointment, just tell me the appointment ID.\n\nFor example: `cancel 12`\n\nClick '📋 My Appointments' to see your appointment IDs! 😊", { parse_mode: 'Markdown' });
});

bot.hears(/cancel (\d+)/i, async (ctx) => {
  const id = ctx.match[1];
  try {
    // Only allow canceling own appointments
    const result = await pool.query(
      "DELETE FROM appointments WHERE id=$1 AND telegram_user_id=$2 RETURNING id",
      [id, ctx.from.id]
    );
    
    if (result.rows.length === 0) {
      return ctx.reply("Hmm, I couldn't find that appointment or you don't have permission to cancel it.\n\nClick '📋 My Appointments' to see your appointment IDs! 😊");
    }
    
    // Cancel scheduled notifications
    await pool.query(
      "UPDATE notifications SET status='cancelled' WHERE appointment_id=$1",
      [id]
    );
    
    ctx.reply(`✅ **Appointment #${id} cancelled successfully!**\n\nIs there anything else I can help you with? 😊`, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error("Cancel error:", err);
    ctx.reply("Oops! I couldn't cancel that appointment. Let me try again! 😅");
  }
});

// Check appointment status
bot.hears(/status (\d+)/i, async (ctx) => {
  const id = ctx.match[1];
  try {
    // Only allow checking own appointments
    const result = await pool.query(
      `SELECT a.*, s.name as student_name, s.admission_no, s.phone, s.year_of_study as year, c.name as counselor_name
       FROM appointments a
       LEFT JOIN students s ON a.student_id = s.id
       LEFT JOIN counselors c ON a.counselor_id = c.id
       WHERE a.id = $1 AND a.telegram_user_id = $2`,
      [id, ctx.from.id]
    );
    
    if (result.rows.length === 0) {
      return ctx.reply("Hmm, I couldn't find that appointment or you don't have permission to view it.\n\nClick '📋 My Appointments' to see your appointment IDs! 😊");
    }
    
    const appointment = result.rows[0];
    const appointmentDate = new Date(appointment.start_ts);
    
    let statusEmoji = "⏳";
    if (appointment.status === 'confirmed') statusEmoji = "✅";
    else if (appointment.status === 'cancelled') statusEmoji = "❌";
    else if (appointment.status === 'pending') statusEmoji = "⏳";
    
    const formattedDate = formatAppointmentDate(appointment.start_ts);
    
    ctx.reply(`📅 Appointment #${id} Status\n\n` +
              `${statusEmoji} Status: ${appointment.status.toUpperCase()}\n` +
              `👤 Student: ${appointment.student_name}\n` +
              `🏥 Counselor: ${appointment.counselor_name}\n` +
              `📅 Date: ${formattedDate}\n` +
              `📞 Phone: ${appointment.phone}\n` +
              `🎓 Year: ${appointment.year}`);
  } catch (err) {
    console.error("Status check error:", err);
    ctx.reply("Hmm, I couldn't check that appointment status. Let me try again! 😅");
  }
});

// Help command
bot.hears("ℹ️ Help", async (ctx) => {
  const helpMessage = `ℹ️ **Maseno Counseling Bot Help**

**🔐 Security:**
• Each user can only access their own appointments
• Your Telegram ID is linked to your appointments
• No one else can see or cancel your appointments

**📅 Booking:**
• Click '📅 Book Appointment' and follow the steps
• No complex commands needed - just answer questions
• The bot guides you through everything step by step

**❌ Canceling:**
• Type: cancel [appointment_number]
• Example: cancel 5
• Only your own appointments can be canceled

**📋 Viewing:**
• Click '📋 My Appointments' to see all appointments
• Type: status [appointment_number] to check specific appointment

**🔔 Notifications:**
• You'll receive reminders 1 day and 1 hour before appointments
• Notifications are sent automatically

**🏥 Other Features:**
• Counselors - see available counselors
• Announcements - latest updates
• Activities - upcoming events
• Books - available books for sale

**🆘 Support:**
• Click '🆘 Support' to start guided ticket creation
• Type: support to create a support ticket step-by-step
• Type: my tickets to view your support tickets
• Type: reply [ticket_id] [message] to respond to tickets
• Type: urgent for urgent matters

**📞 Contact:**
• Click '📞 Contact' for office information
• All contact details and office hours

**Everything is designed to be simple and easy to use!**`;

  ctx.reply(helpMessage);
});

// Enhanced support system
bot.hears("🆘 Support", async (ctx) => {
  try {
    let msg = "💬 **I'm here to help!** 😊\n\n";
    msg += "If you need help, just type \"support\" and I'll ask you a few simple questions to understand what's wrong.\n\n";
    msg += "You can also:\n";
    msg += "• Type \"my tickets\" to see your previous requests\n";
    msg += "• Type \"urgent\" if you need urgent help\n\n";
    msg += "Don't worry about complicated commands - just talk to me naturally and I'll help you through everything step by step! 😊";
    
    ctx.reply(msg);
  } catch (err) {
    console.error("Support error:", err);
    ctx.reply("Sorry, I'm having trouble right now. Please try again in a moment! 😅");
  }
});

// Enhanced support ticket creation
bot.hears(/^support$/i, async (ctx) => {
  const userId = ctx.from.id;
  
  // Initialize support session
  supportSessions.set(userId, {
    step: 'category',
    data: {}
  });
  
  ctx.reply(`Hi there! I'm here to help you. Let me ask you a few questions to understand how I can best assist you. 😊\n\nWhat's bothering you today? You can tell me about:\n\n• Problems with the app or website\n• School work or grades\n• Personal issues or stress\n• Any other concerns\n\nJust tell me what's on your mind - I'm listening! 💙`);
});

// Handle simple support ticket creation (legacy)
bot.hears(/^support (.+)$/i, async (ctx) => {
  const message = ctx.match[1].trim();
  
  try {
    const ticket = await createSupportTicket(
      ctx.from.id,
      ctx.from.username,
      `Support Request: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
      message,
      'medium'
    );
    
    if (ticket) {
      // Add initial message to ticket
      await addSupportMessage(
        ticket.id,
        'student',
        ctx.from.id,
        message,
        false
      );
      
      ctx.reply(`✅ **Support Ticket Created!**\n\n` +
                `**Ticket ID:** #${ticket.id}\n` +
                `**Message:** ${message}\n` +
                `**Status:** Open\n` +
                `**Priority:** Medium\n\n` +
                `A counselor will review your ticket and respond soon.\n\n` +
                `Use \`my tickets\` to check your ticket status.`, 
                { parse_mode: 'Markdown' });
    } else {
      ctx.reply("Hmm, I couldn't create your support ticket. Could you try again? Just type \"support\" and I'll help you through it step by step.");
    }
  } catch (err) {
    console.error("Support ticket creation error:", err);
    ctx.reply("Hmm, I had trouble creating your support ticket. Could you try again? Just type \"support\" and I'll help you.");
  }
});

// Handle support ticket creation (legacy format)
bot.hears(/^help (\d+) (.+)$/i, async (ctx) => {
  const categoryNum = parseInt(ctx.match[1]);
  const message = ctx.match[2].trim();
  
  try {
    const categories = await getSupportCategories();
    
    if (categoryNum < 1 || categoryNum > categories.length) {
      return ctx.reply("Hmm, that doesn't look like a valid category number. Please check the support categories list.");
    }
    
    const category = categories[categoryNum - 1];
    const priority = category.name.toLowerCase().includes('urgent') ? 'urgent' : 'medium';
    
    const ticket = await createSupportTicket(
      ctx.from.id,
      ctx.from.username,
      `${category.name}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
      message,
      priority
    );
    
    if (ticket) {
      // Add initial message to ticket
      await addSupportMessage(
        ticket.id,
        'student',
        ctx.from.id,
        message,
        false
      );
      
      ctx.reply(`✅ **Support Ticket Created!**\n\n` +
                `**Ticket ID:** #${ticket.id}\n` +
                `**Category:** ${category.name}\n` +
                `**Message:** ${message}\n` +
                `**Status:** Open\n` +
                `**Priority:** ${priority.toUpperCase()}\n\n` +
                `A counselor will review your ticket and respond soon.\n\n` +
                `Use \`my tickets\` to check your ticket status.`, 
                { parse_mode: 'Markdown' });
    } else {
      ctx.reply("Hmm, I couldn't create your support ticket. Could you try again? Just type \"support\" and I'll help you.");
    }
  } catch (err) {
    console.error("Support ticket creation error:", err);
    ctx.reply("Hmm, I had trouble creating your support ticket. Could you try again? Just type \"support\" and I'll help you.");
  }
});

// Handle my tickets command
bot.hears(/^my tickets$/i, async (ctx) => {
  try {
    const tickets = await getUserSupportTickets(ctx.from.id);
    
    if (tickets.length === 0) {
      return ctx.reply("You don't have any support tickets yet. If you need help, just type \"support\" and I'll guide you through it.");
    }
    
    let msg = "Here are your support tickets:\n\n";
    
    for (const ticket of tickets) {
      let statusText = '';
      if (ticket.status === 'open') {
        statusText = 'Waiting for counselor';
      } else if (ticket.status === 'replied') {
        statusText = 'Counselor replied - check your messages';
      } else if (ticket.status === 'in_progress') {
        statusText = 'Counselor is working on it';
      } else if (ticket.status === 'resolved') {
        statusText = 'Issue resolved';
      } else {
        statusText = 'Closed';
      }
      
      msg += `Ticket #${ticket.id}\n`;
      msg += `Subject: ${ticket.subject}\n`;
      msg += `Status: ${statusText}\n`;
      msg += `Created: ${new Date(ticket.created_at).toLocaleDateString()}\n`;
      
      // Get replies for this ticket
      const replies = await getTicketReplies(ticket.id);
      if (replies.length > 0) {
        msg += `\nConversation:\n`;
        replies.forEach((reply, index) => {
          const sender = reply.sender_type === 'counselor' ? 'Counselor' : 'You';
          msg += `${sender}: ${reply.message}\n`;
        });
      }
      
      msg += "\n" + "─".repeat(20) + "\n\n";
    }
    
    msg += "Need help? Just type \"support\" and I'll help you create a new ticket.";
    
    ctx.reply(msg);
  } catch (err) {
    console.error("My tickets error:", err);
    ctx.reply("Sorry, I couldn't load your tickets. Please try again.");
  }
});

// Handle student replies to tickets
bot.hears(/^reply (\d+) (.+)$/i, async (ctx) => {
  const ticketId = parseInt(ctx.match[1]);
  const message = ctx.match[2].trim();
  
  try {
    // Check if ticket exists and belongs to user
    const ticketResult = await pool.query(
      "SELECT * FROM support_tickets WHERE id = $1 AND telegram_user_id = $2",
      [ticketId, ctx.from.id]
    );
    
    if (ticketResult.rows.length === 0) {
      return ctx.reply("I couldn't find that support ticket. Make sure you have the right ticket number.");
    }
    
    const ticket = ticketResult.rows[0];
    
    // Add student reply
    await addSupportMessage(
      ticketId,
      'student',
      ctx.from.id,
      message,
      false
    );
    
    // Update ticket status to open if it was closed
    if (ticket.status === 'closed') {
      await pool.query(
        "UPDATE support_tickets SET status = 'open', updated_at = NOW() WHERE id = $1",
        [ticketId]
      );
    }
    
    ctx.reply(`Got it! I've sent your message to the counselor. They'll get back to you soon! `);
              
  } catch (err) {
    console.error("Error adding student reply:", err);
    ctx.reply("Hmm, I had trouble sending your reply. Could you try again? 😅");
  }
});


// Handle satisfaction feedback
bot.hears(/^satisfied (\d+)$/i, async (ctx) => {
  const ticketId = parseInt(ctx.match[1]);
  
  try {
    // Check if ticket exists and belongs to user
    const ticketResult = await pool.query(
      "SELECT * FROM support_tickets WHERE id = $1 AND telegram_user_id = $2",
      [ticketId, ctx.from.id]
    );
    
    if (ticketResult.rows.length === 0) {
      return ctx.reply("Hmm, I couldn't find that ticket. Make sure you have the right ticket number.");
    }
    
    // Update ticket status to resolved
    await pool.query(
      "UPDATE support_tickets SET status = 'resolved', updated_at = NOW() WHERE id = $1",
      [ticketId]
    );
    
    // Add satisfaction message
    await addSupportMessage(
      ticketId,
      'student',
      ctx.from.id,
      'Student marked as satisfied - issue resolved',
      false
    );
    
    ctx.reply(`Great! I've marked your issue as resolved. Thank you for letting me know the counselor helped you.\n\nIf you need help with anything else, just type "support" and I'll be here to help.`);
              
  } catch (err) {
    console.error("Error marking ticket as satisfied:", err);
    ctx.reply("Hmm, I couldn't update your ticket. Could you try again? 😅");
  }
});

// Handle DM-based support - direct message to counselor
bot.hears(/^dm (\d+) (.+)$/i, async (ctx) => {
  const ticketId = parseInt(ctx.match[1]);
  const message = ctx.match[2].trim();
  
  try {
    // Check if ticket exists and belongs to user
    const ticketResult = await pool.query(
      "SELECT * FROM support_tickets WHERE id = $1 AND telegram_user_id = $2",
      [ticketId, ctx.from.id]
    );
    
    if (ticketResult.rows.length === 0) {
      return ctx.reply("I couldn't find that support ticket. Make sure you have the right ticket number.");
    }
    
    const ticket = ticketResult.rows[0];
    
    // Add student message to ticket
    await addSupportMessage(
      ticketId,
      'student',
      ctx.from.id,
      message,
      false
    );
    
    // Update ticket status to open for continued discussion
    await pool.query(
      "UPDATE support_tickets SET status = 'open', updated_at = NOW() WHERE id = $1",
      [ticketId]
    );
    
    ctx.reply(`Perfect! I've sent your message to your counselor. They'll reply when they can! `);
              
  } catch (err) {
    console.error("Error sending DM:", err);
    ctx.reply("Hmm, I couldn't send your message. Could you try again? 😅");
  }
});

// Handle not satisfied feedback
bot.hears(/^not satisfied (\d+)$/i, async (ctx) => {
  const ticketId = parseInt(ctx.match[1]);
  
  try {
    // Check if ticket exists and belongs to user
    const ticketResult = await pool.query(
      "SELECT * FROM support_tickets WHERE id = $1 AND telegram_user_id = $2",
      [ticketId, ctx.from.id]
    );
    
    if (ticketResult.rows.length === 0) {
      return ctx.reply("Hmm, I couldn't find that ticket or you don't have permission to modify it.");
    }
    
    // Update ticket status to open for continued discussion
    await pool.query(
      "UPDATE support_tickets SET status = 'open', updated_at = NOW() WHERE id = $1",
      [ticketId]
    );
    
    // Add not satisfied message
    await addSupportMessage(
      ticketId,
      'student',
      ctx.from.id,
      '❌ Student not satisfied - needs more help',
      false
    );
    
    ctx.reply(`❌ **Ticket #${ticketId} marked as not satisfied**\n\n` +
              `We understand you need more help. A counselor will review your ticket again and provide additional assistance.\n\n` +
              `You can also just reply naturally with more details about what you need - I'll understand and add it to your ticket!`, 
              { parse_mode: 'Markdown' });
              
  } catch (err) {
    console.error("Error marking ticket as not satisfied:", err);
    ctx.reply("Hmm, I had trouble updating your ticket status. Could you try again? 😅");
  }
});

// Handle urgent support
bot.hears(/^urgent$/i, async (ctx) => {
  const urgentMessage = `⚡ **URGENT SUPPORT**\n\n` +
                          `For urgent matters requiring immediate attention:\n\n` +
                          `**Immediate Contact:**\n` +
                       `📞 **Office Phone:** +254-XXX-XXXX\n` +
                       `📧 **Email:** counseling@maseno.ac.ke\n` +
                          `🏢 **Location:** Counseling Office, Main Campus\n\n` +
                          `**Office Hours:**\n` +
                          `Monday - Friday: 8:00 AM - 5:00 PM\n` +
                          `Saturday: 9:00 AM - 1:00 PM\n\n` +
                       `**For urgent matters:**\n` +
                       `Please call the office directly during business hours.\n\n` +
                       `**For regular support:**\n` +
                       `Use the 'Support' button to create a support ticket.`;
  
  ctx.reply(urgentMessage);
});

// Handle feedback
bot.hears(/^feedback$/i, async (ctx) => {
  const feedbackMessage = `💬 **Feedback & Suggestions**\n\n` +
                         `We value your feedback! Type your feedback like this:\n\n` +
                         `**Format:**\n` +
                         `\`feedback [your message]\`\n\n` +
                         `**Example:**\n` +
                         `\`feedback The bot is great but could use a dark mode option\`\n\n` +
                         `**Or use the Support button and select "Feedback" category.**\n\n` +
                         `Thank you for helping us improve our services!`;
  
  ctx.reply(feedbackMessage, { parse_mode: 'Markdown' });
});

// Handle feedback submission
bot.hears(/^feedback (.+)$/i, async (ctx) => {
  const feedback = ctx.match[1].trim();
  
  try {
    const ticket = await createSupportTicket(
      ctx.from.id,
      ctx.from.username,
      `Feedback: ${feedback.substring(0, 50)}${feedback.length > 50 ? '...' : ''}`,
      feedback,
      'low'
    );
    
    if (ticket) {
      await addSupportMessage(
        ticket.id,
        'student',
        ctx.from.id,
        feedback,
        false
      );
      
      ctx.reply(`✅ **Feedback Submitted!**\n\n` +
                `**Ticket ID:** #${ticket.id}\n` +
                `**Message:** ${feedback}\n\n` +
                `Thank you for your feedback! We'll review it and use it to improve our services.`, 
                { parse_mode: 'Markdown' });
    } else {
      ctx.reply("Hmm, I couldn't submit your feedback. Could you try again? 😅");
    }
  } catch (err) {
    console.error("Feedback submission error:", err);
    ctx.reply("Hmm, I had trouble submitting your feedback. Could you try again? 😅");
  }
});

// Contact information
bot.hears("📞 Contact", async (ctx) => {
  const contactMessage = `📞 **Contact Information**\n\n` +
                        `**Counseling Office:**\n` +
                        `🏢 **Location:** Main Campus, Administration Building\n` +
                        `📞 **Phone:** +254-XXX-XXXX\n` +
                        `📧 **Email:** counseling@maseno.ac.ke\n` +
                        `🌐 **Website:** www.maseno.ac.ke/counseling\n\n` +
                        `**Office Hours:**\n` +
                        `Monday - Friday: 8:00 AM - 5:00 PM\n` +
                        `Saturday: 9:00 AM - 1:00 PM\n` +
                        `Sunday: Closed\n\n` +
                        `**Urgent Contact:**\n` +
                        `📞 **Office Phone:** +254-XXX-XXXX\n` +
                        `📧 **Email:** counseling@maseno.ac.ke\n\n` +
                        `**Online Support:**\n` +
                        `• Use the 'Support' button for online help\n` +
                        `• Create support tickets for non-urgent matters\n` +
                        `• Use 'urgent' command for urgent issues\n\n` +
                        `**Social Media:**\n` +
                        `📘 Facebook: @MasenoCounseling\n` +
                        `🐦 Twitter: @MasenoCounseling\n` +
                        `📷 Instagram: @maseno_counseling`;
  
  ctx.reply(contactMessage);
});

// Schedule notifications for an appointment
async function scheduleNotifications(appointmentId, telegramUserId, appointmentDate) {
  try {
    // 1 day before notification
    const oneDayBefore = new Date(appointmentDate.getTime() - (24 * 60 * 60 * 1000));
    await pool.query(
      `INSERT INTO notifications (appointment_id, telegram_user_id, notification_type, scheduled_for, status)
       VALUES ($1, $2, '1_day_before', $3, 'pending')`,
      [appointmentId, telegramUserId, oneDayBefore]
    );

    // 1 hour before notification
    const oneHourBefore = new Date(appointmentDate.getTime() - (60 * 60 * 1000));
    await pool.query(
      `INSERT INTO notifications (appointment_id, telegram_user_id, notification_type, scheduled_for, status)
       VALUES ($1, $2, '1_hour_before', $3, 'pending')`,
      [appointmentId, telegramUserId, oneHourBefore]
    );

    console.log(`✅ Notifications scheduled for appointment ${appointmentId}`);
  } catch (err) {
    console.error("Error scheduling notifications:", err);
  }
}

// Notification sending function
async function sendNotifications() {
  try {
    const now = new Date();
    const result = await pool.query(
      `SELECT n.*, a.start_ts, s.name as student_name, c.name as counselor_name
       FROM notifications n
       JOIN appointments a ON n.appointment_id = a.id
       JOIN students s ON a.student_id = s.id
       JOIN counselors c ON a.counselor_id = c.id
       WHERE n.status = 'pending' 
       AND n.scheduled_for <= $1
       AND a.status != 'cancelled'`,
      [now]
    );

    for (const notification of result.rows) {
      try {
        const appointmentDate = new Date(notification.start_ts);
        const formattedDate = formatAppointmentDate(notification.start_ts);
        
        let message = "";
        if (notification.notification_type === '1_day_before') {
          message = `🔔 **Appointment Reminder**\n\n` +
                   `Your appointment is tomorrow!\n\n` +
                   `📅 Date: ${formattedDate}\n` +
                   `🏥 Counselor: ${notification.counselor_name}\n` +
                   `👤 Student: ${notification.student_name}\n\n` +
                   `Please be on time!`;
        } else if (notification.notification_type === '1_hour_before') {
          message = `🔔 **Appointment Reminder**\n\n` +
                   `Your appointment is in 1 hour!\n\n` +
                   `📅 Date: ${formattedDate}\n` +
                   `🏥 Counselor: ${notification.counselor_name}\n` +
                   `👤 Student: ${notification.student_name}\n\n` +
                   `Please be ready!`;
        }

        await bot.telegram.sendMessage(notification.telegram_user_id, message);
        
        // Mark notification as sent
        await pool.query(
          "UPDATE notifications SET status='sent', sent_at=now() WHERE id=$1",
          [notification.id]
        );
        
        console.log(`✅ Notification sent to user ${notification.telegram_user_id} for appointment ${notification.appointment_id}`);
      } catch (err) {
        console.error(`Error sending notification ${notification.id}:`, err);
        
        // Mark notification as failed
        await pool.query(
          "UPDATE notifications SET status='failed' WHERE id=$1",
          [notification.id]
        );
      }
    }
  } catch (err) {
    console.error("Error in notification system:", err);
  }
}

// Schedule notification checks every minute
cron.schedule('* * * * *', sendNotifications);

// Keep existing handlers for other features
bot.hears("📢 Announcements", async (ctx) => {
  try {
    const res = await fetch(`${process.env.API_URL || 'https://maseno-counseling-bot-production.up.railway.app'}/api/announcements`);
    const announcements = await res.json();
    if (!announcements.length) {
      return ctx.reply("📢 No announcements at the moment.");
    }
    let msg = "📢 Latest Announcements:\n\n";
    announcements.forEach((a, i) => {
      msg += `${i + 1}. ${a.message}\n🏥 By: ${a.counselor_name || "Counselor"}\n📆 ${new Date(a.created_at).toLocaleString()}\n\n`;
    });
    ctx.reply(msg);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    ctx.reply("⚠️ Failed to load announcements. Please try again later.");
  }
});

bot.hears("🗓 Activities", async (ctx) => {
  try {
    const res = await fetch(`${process.env.API_URL || 'https://maseno-counseling-bot-production.up.railway.app'}/api/activities`);
    const activities = await res.json();
    console.log("Bot received activities:", activities);
    
    if (activities.length) {
      let msg = "🗓 Upcoming Activities:\n\n";
      activities.forEach((a, i) => {
        console.log(`Processing activity ${i + 1}:`, { 
          title: a.title, 
          activity_date: a.activity_date, 
          activity_time: a.activity_time 
        });
        
        // Extract just the date part if it's a timestamp
        const datePart = a.activity_date && a.activity_date.includes('T') ? 
          a.activity_date.split('T')[0] : 
          a.activity_date;
        
        // Format time to HH:mm if it comes as HH:mm:ss
        const time = a.activity_time ? a.activity_time.substring(0, 5) : "00:00";
        const dateTime = `${datePart}T${time}`;
        
        console.log(`Formatted dateTime: ${dateTime}`);
        
        const formattedDate = new Date(dateTime).toLocaleString();
        console.log(`Final formatted date: ${formattedDate}`);
        
        msg += `${i + 1}. ${a.title}\n📆 ${formattedDate}\n${a.description || ""}\n\n`;
      });
      ctx.reply(msg);
    } else {
      ctx.reply("🗓 No upcoming activities at the moment.");
    }
  } catch (err) {
    console.error("Bot activities error:", err);
    ctx.reply("⚠️ Could not load activities.");
  }
});

bot.hears("📚 Books for Sale", async (ctx) => {
  try {
    console.log("📚 Books command triggered");

    const res = await fetch(`${process.env.API_URL || 'https://maseno-counseling-bot-production.up.railway.app'}/api/books`);
    console.log("Response status:", res.status);

    const books = await res.json();
    console.log("Books data:", books);

    if (!books.length) {
      return ctx.reply("📚 No books available at the moment.");
    }

    let msg = "📚 Available Books:\n\n";
    books.forEach((b, i) => {
      msg += `${i + 1}. ${b.title} by ${b.author || "Unknown"}\n💰 Price: KES ${b.price_cents / 100}\n📍 Pickup: ${b.pickup_station || "TBD"}\n\n`;
    });

    ctx.reply(msg);
  } catch (err) {
    console.error("❌ Books fetch error:", err);
    ctx.reply("⚠️ Could not load books.");
  }
});

bot.hears("🧑‍🤝‍🧑 Peer Counseling Registration", async (ctx) => {
  ctx.reply("🧑‍🤝‍🧑 Peer Counseling Registration will be available next year.");
});

// Test command to check if bot is working
bot.hears("test", async (ctx) => {
  console.log("Test command received from user:", ctx.from.username || ctx.from.id);
  ctx.reply("✅ Bot is working! Database connection: " + (await pool.query('SELECT 1').then(() => 'OK').catch(() => 'FAILED')));
});

// Support session handler - fix variable declaration issue
async function handleSupportSession(ctx, session, userId, text) {
  try {
    switch (session.step) {
      case 'category':
        // Analyze the text to determine category
        const lowerText = text.toLowerCase();
        let category = 'General';
        
        if (lowerText.includes('login') || lowerText.includes('app') || lowerText.includes('website') || 
            lowerText.includes('technical') || lowerText.includes('bug') || lowerText.includes('error')) {
          category = 'Technical';
        } else if (lowerText.includes('school') || lowerText.includes('grade') || lowerText.includes('exam') || 
                   lowerText.includes('assignment') || lowerText.includes('course') || lowerText.includes('study') ||
                   lowerText.includes('work')) {
          category = 'Academic';
        } else if (lowerText.includes('stress') || lowerText.includes('depressed') || lowerText.includes('anxiety') || 
                   lowerText.includes('sad') || lowerText.includes('worried') || lowerText.includes('personal') ||
                   lowerText.includes('relationship') || lowerText.includes('family') || lowerText.includes('money')) {
          category = 'Personal';
        }
        
        updateSupportSession(userId, 'priority', { category: category });
        ctx.reply(`I understand. ${category === 'Personal' ? 'It sounds like you\'re going through a tough time. ' : ''}How urgent is this? Do you need help:\n\n• Right now (very urgent)\n• Today (urgent)\n• This week (not urgent)\n\nJust tell me how quickly you need help.`);
        break;
        
      case 'priority':
        const lowerText2 = text.toLowerCase();
        let priority = 'medium';
        
        if (lowerText2.includes('right now') || lowerText2.includes('urgent') || 
            lowerText2.includes('immediately') || lowerText2.includes('asap')) {
          priority = 'urgent';
        } else if (lowerText2.includes('today') || lowerText2.includes('soon') || lowerText2.includes('quickly')) {
          priority = 'high';
        } else if (lowerText2.includes('week') || lowerText2.includes('not urgent') || lowerText2.includes('whenever')) {
          priority = 'low';
        }
        
        updateSupportSession(userId, 'subject', { priority: priority });
        ctx.reply(`Got it. Now, can you give me a short title for your issue? Just a few words to describe what's wrong.\n\nFor example: "Can't login" or "Stressed about exams"`);
        break;
        
      case 'subject':
        if (text.trim().length < 3) {
          return ctx.reply("Please give me a bit more detail. What would you call this issue?");
        }
        
        updateSupportSession(userId, 'message', { subject: text.trim() });
        ctx.reply(`Perfect. Now tell me everything about what's happening. The more details you give me, the better I can help you. What exactly is going on?`);
        break;
        
      case 'message':
        if (text.trim().length < 5) {
          return ctx.reply("Please tell me more about your issue. I want to make sure I understand everything so I can help you properly.");
        }
        
        try {
        // Create the support ticket
        const ticket = await createSupportTicket(
          userId,
          ctx.from.username,
          `${session.data.category}: ${session.data.subject}`,
          text.trim(),
          session.data.priority
        );
        
        if (ticket) {
          // Add initial message to ticket
          await addSupportMessage(
            ticket.id,
            'student',
            userId,
            text.trim(),
            false
          );
          
          // Clear support session
          clearSupportSession(userId);
          
          ctx.reply(`Thank you for sharing that with me. I've created a support ticket for you (Ticket #${ticket.id}).\n\nA counselor will read your message and get back to you soon. They'll send you a direct message when they have a response.\n\nIs there anything else I can help you with right now?`);
        } else {
            // Fallback if database is not available
            clearSupportSession(userId);
            ctx.reply(`Thank you for sharing that with me. I've noted your issue:\n\n**Category:** ${session.data.category}\n**Subject:** ${session.data.subject}\n**Priority:** ${session.data.priority}\n**Message:** ${text.trim()}\n\nA counselor will get back to you soon. Is there anything else I can help you with right now?`);
          }
        } catch (dbError) {
          console.error("Database error in support session:", dbError);
          // Fallback if database is not available
          clearSupportSession(userId);
          ctx.reply(`Thank you for sharing that with me. I've noted your issue:\n\n**Category:** ${session.data.category}\n**Subject:** ${session.data.subject}\n**Priority:** ${session.data.priority}\n**Message:** ${text.trim()}\n\nA counselor will get back to you soon. Is there anything else I can help you with right now?`);
        }
        break;
        
      default:
        clearSupportSession(userId);
        ctx.reply("I lost track of our conversation. Let's start over - just type \"support\" and I'll help you.");
    }
  } catch (err) {
    console.error("Support session error:", err);
    clearSupportSession(userId);
    ctx.reply("I'm sorry, something went wrong. Let's try again - just type \"support\" and I'll help you.");
  }
}

// Enhanced booking step handler
async function handleBookingStep(ctx, session, userId, text) {
  try {
    switch (session.step) {
      case 'name':
        if (text.trim().length < 2) {
          return ctx.reply("That name seems too short. Please enter a valid name (at least 2 characters).");
        }
        updateBookingSession(userId, 'admission_no', { name: text.trim() });
        
        // Delete user's input message and previous bot message for cleaner interface
        try {
          await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
        } catch (err) {
          console.log("Could not delete user input message:", err.message);
        }
        
        const updatedSession = getBookingSession(userId);
        if (updatedSession.lastMessageId) {
          try {
            await ctx.telegram.deleteMessage(ctx.chat.id, updatedSession.lastMessageId);
          } catch (err) {
            console.log("Could not delete previous message:", err.message);
          }
        }
        
        const msg2 = await ctx.reply("Great! Step 2 of 6: What's your admission number?\n\nType it like this:\nADM001");
        updateBookingSession(userId, 'admission_no', {});
        const session = getBookingSession(userId);
        session.lastMessageId = msg2.message_id;
        break;
        
      case 'admission_no':
        if (text.trim().length < 3) {
          return ctx.reply("That admission number seems too short. Please enter a valid admission number (at least 3 characters).");
        }
        updateBookingSession(userId, 'phone', { admission_no: text.trim() });
        
        // Delete user's input message and previous bot message for cleaner interface
        try {
          await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
        } catch (err) {
          console.log("Could not delete user input message:", err.message);
        }
        
        const updatedSession2 = getBookingSession(userId);
        if (updatedSession2.lastMessageId) {
          try {
            await ctx.telegram.deleteMessage(ctx.chat.id, updatedSession2.lastMessageId);
          } catch (err) {
            console.log("Could not delete previous message:", err.message);
          }
        }
        
        const msg3 = await ctx.reply("Perfect! Step 3 of 6: What's your phone number?\n\nType it like this:\n0712345678");
        updateBookingSession(userId, 'phone', {});
        const session2 = getBookingSession(userId);
        session2.lastMessageId = msg3.message_id;
        break;
        
      case 'phone':
        if (text.trim().length < 10) {
          return ctx.reply("That phone number seems too short. Please enter a valid phone number (at least 10 digits).");
        }
        updateBookingSession(userId, 'year', { phone: text.trim() });
        
        // Delete user's input message and previous bot message for cleaner interface
        try {
          await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
        } catch (err) {
          console.log("Could not delete user input message:", err.message);
        }
        
        const updatedSession3 = getBookingSession(userId);
        if (updatedSession3.lastMessageId) {
          try {
            await ctx.telegram.deleteMessage(ctx.chat.id, updatedSession3.lastMessageId);
          } catch (err) {
            console.log("Could not delete previous message:", err.message);
          }
        }
        
        const msg4 = await ctx.reply("Excellent! Step 4 of 6: What year are you in?\n\nType the number:\n1 (for 1st year)\n2 (for 2nd year)\n3 (for 3rd year)\n4 (for 4th year)");
        updateBookingSession(userId, 'year', {});
        const session3 = getBookingSession(userId);
        session3.lastMessageId = msg4.message_id;
        break;
        
      case 'year':
        const year = parseInt(text.trim());
        if (isNaN(year) || year < 1 || year > 4) {
          return ctx.reply("That doesn't look like a valid year. Please enter 1, 2, 3, or 4.");
        }
        updateBookingSession(userId, 'counselor', { year: year });
        
        // Delete user's input message and previous bot message for cleaner interface
        try {
          await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
        } catch (err) {
          console.log("Could not delete user input message:", err.message);
        }
        
        const updatedSession4 = getBookingSession(userId);
        if (updatedSession4.lastMessageId) {
          try {
            await ctx.telegram.deleteMessage(ctx.chat.id, updatedSession4.lastMessageId);
          } catch (err) {
            console.log("Could not delete previous message:", err.message);
          }
        }
        
        // Show available counselors
        const counselors = await pool.query("SELECT id, name FROM counselors");
        let counselorMsg = "Great! Step 5 of 6: Choose your counselor\n\n";
        counselorMsg += "Available counselors:\n\n";
        counselors.rows.forEach((c, i) => {
          counselorMsg += `${i + 1}. ${c.name}\n`;
        });
        counselorMsg += "\nType the number of your chosen counselor:\n1 (for first counselor)\n2 (for second counselor)\netc.";
        
        const replyMsg = await ctx.reply(counselorMsg);
        updateBookingSession(userId, 'counselor', {});
        const session4 = getBookingSession(userId);
        session4.lastMessageId = replyMsg.message_id;
        break;
        
      case 'counselor':
        const counselorNum = parseInt(text.trim());
        const counselorsList = await pool.query("SELECT id, name FROM counselors");
        
        if (isNaN(counselorNum) || counselorNum < 1 || counselorNum > counselorsList.rows.length) {
          return ctx.reply("That doesn't look like a valid counselor number. Please check the list above and try again.");
        }
        
        const selectedCounselor = counselorsList.rows[counselorNum - 1];
        updateBookingSession(userId, 'datetime', { 
          counselor_id: selectedCounselor.id, 
          counselor_name: selectedCounselor.name 
        });
        
        // Delete user's input message and previous bot message for cleaner interface
        try {
          await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
        } catch (err) {
          console.log("Could not delete user input message:", err.message);
        }
        
        const updatedSession5 = getBookingSession(userId);
        if (updatedSession5.lastMessageId) {
          try {
            await ctx.telegram.deleteMessage(ctx.chat.id, updatedSession5.lastMessageId);
          } catch (err) {
            console.log("Could not delete previous message:", err.message);
          }
        }
        
        const msg6 = await ctx.reply(`Perfect! Step 6 of 6: When would you like your appointment?\n\n` +
                 `Type the date and time like this:\n` +
                 `2024-01-20 14:30\n\n` +
                 `Format: YYYY-MM-DD HH:MM\n` +
                 `Example: 2024-01-20 14:30 (for January 20, 2024 at 2:30 PM)`);
        updateBookingSession(userId, 'datetime', {});
        const session5 = getBookingSession(userId);
        session5.lastMessageId = msg6.message_id;
        break;
        
      case 'datetime':
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        if (!dateRegex.test(text.trim())) {
          return ctx.reply("That doesn't look like the right format. Please use: YYYY-MM-DD HH:MM\n\nExample: 2024-01-20 14:30");
        }
        
        const [datePart, timePart] = text.trim().split(' ');
        const [yearStr, monthStr, dayStr] = datePart.split('-');
        const [hourStr, minuteStr] = timePart.split(':');
        
        const appointmentDate = new Date(
          parseInt(yearStr), 
          parseInt(monthStr) - 1,
          parseInt(dayStr), 
          parseInt(hourStr), 
          parseInt(minuteStr)
        );
        
        if (isNaN(appointmentDate.getTime()) || appointmentDate < new Date()) {
          return ctx.reply("That date doesn't look right. Please enter a valid future date and time.\n\nExample: 2024-01-20 14:30");
        }
        
        const currentSession = getBookingSession(userId);
        const sessionData = { ...currentSession.data, datetime: text.trim() };
        updateBookingSession(userId, 'confirm', sessionData);
        
        // Delete user's input message and previous bot message for cleaner interface
        try {
          await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
        } catch (err) {
          console.log("Could not delete user input message:", err.message);
        }
        
        const updatedSession6 = getBookingSession(userId);
        if (updatedSession6.lastMessageId) {
          try {
            await ctx.telegram.deleteMessage(ctx.chat.id, updatedSession6.lastMessageId);
          } catch (err) {
            console.log("Could not delete previous message:", err.message);
          }
        }
        
        // Show summary for confirmation
        const summary = formatBookingSummary(sessionData);
        const summaryMsg = await ctx.reply(summary);
        updateBookingSession(userId, 'confirm', {});
        const session6 = getBookingSession(userId);
        session6.lastMessageId = summaryMsg.message_id;
        break;
        
      case 'confirm':
        if (text.toLowerCase().includes('yes')) {
          // Delete user's "yes" input message for cleaner interface
          try {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
          } catch (err) {
            console.log("Could not delete user input message:", err.message);
          }
          
          // Process the booking
          const currentSession = getBookingSession(userId);
          const data = currentSession.data;
          
          // Convert to PostgreSQL timestamp format
          const [datePart, timePart] = data.datetime.split(' ');
          const [yearStr, monthStr, dayStr] = datePart.split('-');
          const [hourStr, minuteStr] = timePart.split(':');
          
          const appointmentDate = new Date(
            parseInt(yearStr), 
            parseInt(monthStr) - 1,
            parseInt(dayStr), 
            parseInt(hourStr), 
            parseInt(minuteStr)
          );
          
          const year = appointmentDate.getFullYear();
          const month = (appointmentDate.getMonth() + 1).toString().padStart(2, '0');
          const day = appointmentDate.getDate().toString().padStart(2, '0');
          const hour = appointmentDate.getHours().toString().padStart(2, '0');
          const minute = appointmentDate.getMinutes().toString().padStart(2, '0');
          const second = appointmentDate.getSeconds().toString().padStart(2, '0');
          
          const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
          const endDate = `${year}-${month}-${day} ${(parseInt(hour) + 1).toString().padStart(2, '0')}:${minute}:${second}`;

          // Insert student
          const studentRes = await pool.query(
            `INSERT INTO students (name, admission_no, phone, year_of_study)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (admission_no) DO UPDATE SET 
               name=EXCLUDED.name, 
               phone=EXCLUDED.phone, 
               year_of_study=EXCLUDED.year_of_study
             RETURNING id`,
            [data.name, data.admission_no, data.phone, data.year]
          );

          const student_id = studentRes.rows[0].id;

          // Insert appointment
          const apptRes = await pool.query(
            `INSERT INTO appointments (student_id, counselor_id, start_ts, end_ts, status, telegram_user_id, telegram_username)
             VALUES ($1, $2, $3, $4, 'pending', $5, $6)
             RETURNING id`,
            [student_id, data.counselor_id, formattedDate, endDate, userId, ctx.from.username]
          );

          const appointmentId = apptRes.rows[0].id;

          // Schedule notifications
          await scheduleNotifications(appointmentId, userId, appointmentDate);

          const confirmationDate = formatAppointmentDate(appointmentDate);

          // Delete all previous booking messages for clean interface
          const finalSession = getBookingSession(userId);
          if (finalSession.lastMessageId) {
            try {
              await ctx.telegram.deleteMessage(ctx.chat.id, finalSession.lastMessageId);
            } catch (err) {
              console.log("Could not delete previous message:", err.message);
            }
          }

          ctx.reply(`Appointment Booked Successfully!\n\n` +
                   `Reference: #${appointmentId}\n` +
                   `Student: ${data.name}\n` +
                   `Counselor: ${data.counselor_name}\n` +
                   `Date: ${confirmationDate}\n` +
                   `Status: Pending\n\n` +
                   `You'll receive reminders 1 day and 1 hour before your appointment.\n\n` +
                   `Thank you for using our counseling service!\n\n` +
                   `Is there anything else I can help you with?`);
          
          // Clear booking session
          clearBookingSession(userId);
          
        } else if (text.toLowerCase().includes('no')) {
          clearBookingSession(userId);
          ctx.reply("No problem! I've cancelled the booking. Click 'Book Appointment' to start over whenever you're ready.");
        } else {
          ctx.reply("I didn't quite understand that. Please type 'yes' to confirm or 'no' to start over.");
        }
        break;
    }
  } catch (err) {
    console.error("Booking step error:", err);
    ctx.reply("Something went wrong. Let me start the booking process over for you.\n\nClick 'Book Appointment' to try again.");
    clearBookingSession(userId);
  }
}

// Add slash command handlers
bot.command('counselors', async (ctx) => {
  try {
    const result = await pool.query("SELECT id, name FROM counselors");
    if (result.rows.length === 0) {
      return ctx.reply("Hmm, it looks like no counselors are registered yet. Please contact the admin for help! 😔");
    }
    let msg = "**Meet Our Counselors:**\n\n";
    result.rows.forEach((c, i) => {
      msg += `${i + 1}. **${c.name}**\n`;
    });
    msg += "\n**Ready to book?**\n";
    msg += "Just type `/book` and I'll walk you through everything!\n\n";
    msg += "**It's super easy - I promise!**";
    ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error("Counselors error:", err);
    ctx.reply("I had trouble getting the counselor list. Please try again in a moment.");
  }
});

bot.command('book', async (ctx) => {
  try {
    const result = await pool.query("SELECT id, name FROM counselors");
    if (result.rows.length === 0) {
      return ctx.reply("Sorry, no counselors are available right now. Please contact admin for help! 😔");
    }
    
    // Start booking session
    startBookingSession(ctx.from.id);
    
    let msg = "📅 **Let's Book Your Appointment!** 🎉\n\n";
    msg += "Don't worry, I'll guide you through this step by step. It's really easy!\n\n";
    msg += "**Step 1 of 6:** What's your full name?\n\n";
    msg += "Just type your name like this:\n";
    msg += "`John Doe`\n\n";
    msg += "**Take your time - no rush!** 😊";
    
    ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error("Book appointment error:", err);
    ctx.reply("Something went wrong. Let me try that again for you.");
  }
});

bot.command('appointments', async (ctx) => {
  try {
    const appointments = await getUserAppointments(ctx.from.id);
    
    if (appointments.length === 0) {
      return ctx.reply("You don't have any appointments yet!\n\nReady to book your first one? Just type /book and I'll help you.");
    }
    
    let msg = "Here are your appointments:\n\n";
    appointments.forEach((appointment, index) => {
      const status = appointment.status === 'confirmed' ? "Confirmed" : 
                    appointment.status === 'cancelled' ? "Cancelled" : "Pending";
      
      msg += `${index + 1}. Appointment #${appointment.id}\n`;
      msg += `   Student: ${appointment.student_name}\n`;
      msg += `   Counselor: ${appointment.counselor_name}\n`;
      msg += `   Date: ${formatAppointmentDate(appointment.start_ts)}\n`;
      msg += `   Status: ${status}\n\n`;
    });
    
    msg += "Need to cancel? Type: cancel [ID]\n";
    msg += "Check details? Type: status [ID]\n\n";
    msg += "I'm here if you need any help.";
    
    ctx.reply(msg);
  } catch (err) {
    console.error("Error fetching user appointments:", err);
    ctx.reply("I couldn't load your appointments. Let me try that again.");
  }
});

bot.command('cancel', async (ctx) => {
  ctx.reply("No problem! To cancel an appointment, just tell me the appointment ID.\n\nFor example: cancel 12\n\nType /appointments to see your appointment IDs.");
});

bot.command('support', async (ctx) => {
  const userId = ctx.from.id;
  
  // Initialize support session
  supportSessions.set(userId, {
    step: 'category',
    data: {}
  });
  
  ctx.reply(`Hi there! I'm here to help you. Let me ask you a few questions to understand how I can best assist you. 😊\n\nWhat's bothering you today? You can tell me about:\n\n• Problems with the app or website\n• School work or grades\n• Personal issues or stress\n• Any other concerns\n\nJust tell me what's on your mind - I'm listening! 💙`);
});

bot.command('help', async (ctx) => {
  const helpMessage = `Maseno Counseling Bot Help

Security:
• Each user can only access their own appointments
• Your Telegram ID is linked to your appointments
• No one else can see or cancel your appointments

Booking:
• Type /book and follow the steps
• No complex commands needed - just answer questions
• The bot guides you through everything step by step

Canceling:
• Type: cancel [appointment_number]
• Example: cancel 5
• Only your own appointments can be canceled

Viewing:
• Type /appointments to see all appointments
• Type: status [appointment_number] to check specific appointment

Notifications:
• You'll receive reminders 1 day and 1 hour before appointments
• Notifications are sent automatically

Other Features:
• /counselors - see available counselors
• /support - get help with any issues
• /help - this help message

Support:
• Type /support to start guided ticket creation

Everything is designed to be simple and easy to use!`;

  ctx.reply(helpMessage);
});

bot.command('about', async (ctx) => {
  const aboutMessage = `About Maseno Counseling Bot

Welcome to the Maseno University Counseling Bot! I'm here to help you with all your counseling needs.

What I can do for you:
• Help you book counseling appointments
• Connect you with available counselors
• Provide support and assistance
• Send appointment reminders
• Help with any questions or concerns

Our Mission:
To provide accessible, confidential, and professional counseling services to all Maseno University students.

Privacy & Security:
• All conversations are confidential
• Your personal information is protected
• Only you can access your appointments
• We follow strict privacy guidelines

Need Help?
Just type /help for a list of commands, or /support if you need assistance.

Remember: I'm here 24/7 to support you!`;

  ctx.reply(aboutMessage);
});

// Add intelligent conversation flow handler with vertical command list
bot.on('text', async (ctx) => {
  const text = ctx.message.text.toLowerCase().trim();
  const userId = ctx.from.id;
  const session = getBookingSession(userId);
  const supportSession = getSupportSession(userId);
  
  // Handle support session first
  if (supportSession) {
    await handleSupportSession(ctx, supportSession, userId, ctx.message.text);
    return;
  }
  
  // Handle booking session
  if (session) {
    await handleBookingStep(ctx, session, userId, ctx.message.text);
    return;
  }
  
  // Create vertical command list
  const commandList = "Maseno Counseling Bot\nChoose an option:\n\n/counselors - View Available Counselors\n/book - Book an Appointment\n/appointments - My Appointments\n/cancel - Cancel Appointment\n/support - Get Support\n/help - Help & Commands\n/about - About Our Services";
  
  // Handle common conversational cues
  if (text === 'yes' || text === 'yeah' || text === 'yep' || text === 'sure' || text === 'ok' || text === 'okay') {
    return ctx.reply(`Great! What would you like to do?\n\n${commandList}`);
  }
  
  if (text === 'no' || text === 'nope' || text === 'nah' || text === 'not really') {
    return ctx.reply("No problem! If you need anything later, just type /start or send me a message. I'm here whenever you need help.");
  }
  
  if (text === 'maybe' || text === 'perhaps' || text === 'i think so') {
    return ctx.reply(`Take your time! When you're ready, just let me know what you'd like to do. I'm here to help whenever you need me! \n\n${commandList}`);
  }
  
  if (text === 'bye' || text === 'goodbye' || text === 'see you' || text === 'later' || text === 'take care') {
    return ctx.reply("Goodbye! Take care and remember, I'm always here if you need someone to talk to. Have a great day!");
  }
  
  if (text === 'hello' || text === 'hi' || text === 'hey' || text === 'good morning' || text === 'good afternoon' || text === 'good evening') {
    return ctx.reply(`Hello!  Welcome to Maseno Counseling Bot! I'm here to help you. What can I do for you today?\n\n${commandList}`);
  }
  
  if (text === 'help' || text === 'what can you do' || text === 'commands') {
    return ctx.reply(`I can help you with these services:\n\n${commandList}`);
  }
  
  if (text === 'thank you' || text === 'thanks' || text === 'thank you so much') {
    return ctx.reply(`You're very welcome! I'm happy to help. Is there anything else you need assistance with?\n\n${commandList}`);
  }
  
  if (text === 'how are you' || text === 'how are you doing') {
    return ctx.reply(`I'm doing great, thank you for asking! I'm here and ready to help you with whatever you need. How are you doing today?\n\n${commandList}`);
  }
  
  // Handle appointment-related responses
  if (text.includes('appointment') || text.includes('booking') || text.includes('schedule')) {
    const appointmentList = "Appointment Services:\n\n/book - Book New Appointment\n/appointments - View My Appointments\n/cancel - Cancel Appointment";
    return ctx.reply(`I'd be happy to help you with appointments! Choose what you'd like to do:\n\n${appointmentList}`);
  }
  
  // Handle counselor-related responses
  if (text.includes('counselor') || text.includes('therapist') || text.includes('counseling')) {
    const counselorList = "Counselor Services:\n\n/counselors - View Available Counselors\n/book - Book Appointment";
    return ctx.reply(`Great! I can help you with counselors. Choose what you'd like to do:\n\n${counselorList}`);
  }
  
  // Handle support-related responses
  if (text.includes('problem') || text.includes('issue') || text.includes('help') || text.includes('support')) {
    const supportList = "Support Services:\n\n/support - Get Support\n/counselors - View Counselors\n/book - Book Appointment";
    return ctx.reply(`I'm here to help! Choose what you need:\n\n${supportList}`);
  }
  
  // Check if user has any open tickets with recent counselor replies for conversational replies
  try {
    const openTicketsResult = await pool.query(
      `SELECT st.id, st.subject, st.status, 
              (SELECT COUNT(*) FROM support_messages sm 
               WHERE sm.ticket_id = st.id 
               AND sm.sender_type = 'counselor' 
               AND sm.created_at > NOW() - INTERVAL '24 hours') as recent_replies
       FROM support_tickets st 
       WHERE st.telegram_user_id = $1 
       AND st.status IN ('open', 'replied', 'in_progress')
       ORDER BY st.updated_at DESC 
       LIMIT 1`,
      [userId]
    );
    
    if (openTicketsResult.rows.length > 0) {
      const ticket = openTicketsResult.rows[0];
      
      // If there are recent counselor replies, treat this as a reply to the ticket
      if (ticket.recent_replies > 0) {
        // Add student reply to the most recent open ticket
        await addSupportMessage(
          ticket.id,
          'student',
          userId,
          ctx.message.text.trim(),
          false
        );
        
        // Update ticket status to open for continued discussion
        await pool.query(
          "UPDATE support_tickets SET status = 'open', updated_at = NOW() WHERE id = $1",
          [ticket.id]
        );
        
        ctx.reply(`Thanks for your message! I've added it to your support ticket #${ticket.id}. Your counselor will see it and respond soon.\n\nIf you need to mark the ticket as resolved, just type "satisfied ${ticket.id}" or if you need more help, type "not satisfied ${ticket.id}".`);
        return;
      }
    }
  } catch (err) {
    console.error("Error checking for open tickets:", err);
  }
  
  // Default response for unrecognized messages
  return ctx.reply(`I'm not sure I understand that. But don't worry! I can help you with these services:\n\n${commandList}`);
});

// Handle callback queries from inline keyboards
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  const userId = ctx.from.id;
  
  try {
    switch (data) {
      case 'counselors':
        await ctx.answerCbQuery();
        // Call the counselors command handler
        const counselorsResult = await pool.query("SELECT id, name FROM counselors");
        if (counselorsResult.rows.length === 0) {
          return ctx.reply("Hmm, it looks like no counselors are registered yet. Please contact the admin for help! 😔");
        }
        let msg = "**Meet Our Counselors:**\n\n";
        counselorsResult.rows.forEach((c, i) => {
          msg += `${i + 1}. **${c.name}**\n`;
        });
        msg += "\n**Ready to book?**\n";
        msg += "Just type `/book` and I'll walk you through everything!\n\n";
        msg += "**It's super easy - I promise!**";
        await ctx.reply(msg, { parse_mode: 'Markdown' });
        break;
        
      case 'book_appointment':
        await ctx.answerCbQuery();
        // Call the booking command handler
        const bookResult = await pool.query("SELECT id, name FROM counselors");
        if (bookResult.rows.length === 0) {
          return ctx.reply("Sorry, no counselors are available right now. Please contact admin for help! 😔");
        }
        
        // Start booking session
        startBookingSession(userId);
        
        let bookMsg = "📅 **Let's Book Your Appointment!** 🎉\n\n";
        bookMsg += "Don't worry, I'll guide you through this step by step. It's really easy!\n\n";
        bookMsg += "**Step 1 of 6:** What's your full name?\n\n";
        bookMsg += "Just type your name like this:\n";
        bookMsg += "`John Doe`\n\n";
        bookMsg += "**Take your time - no rush!** 😊";
        
        await ctx.reply(bookMsg, { parse_mode: 'Markdown' });
        break;
        
      case 'my_appointments':
        await ctx.answerCbQuery();
        // Call the appointments command handler
        const appointments = await getUserAppointments(userId);
        
        if (appointments.length === 0) {
          return ctx.reply("You don't have any appointments yet!\n\nReady to book your first one? Just type /book and I'll help you.");
        }
        
        let appointmentsMsg = "📋 **Here are your appointments:**\n\n";
        appointments.forEach((appointment, index) => {
          const statusEmoji = appointment.status === 'confirmed' ? "✅" : 
                             appointment.status === 'cancelled' ? "❌" : "⏳";
          
          appointmentsMsg += `${index + 1}. ${statusEmoji} **Appointment #${appointment.id}**\n`;
          appointmentsMsg += `   👤 Student: ${appointment.student_name}\n`;
          appointmentsMsg += `   🏥 Counselor: ${appointment.counselor_name}\n`;
          appointmentsMsg += `   📅 Date: ${formatAppointmentDate(appointment.start_ts)}\n`;
          appointmentsMsg += `   📊 Status: ${appointment.status.toUpperCase()}\n\n`;
        });
        
        appointmentsMsg += "💡 **Need to cancel?** Type: `cancel [ID]`\n";
        appointmentsMsg += "💡 **Check details?** Type: `status [ID]`\n\n";
        appointmentsMsg += "**I'm here if you need any help!** 😊";
        
        await ctx.reply(appointmentsMsg, { parse_mode: 'Markdown' });
        break;
        
      case 'cancel_appointment':
        await ctx.answerCbQuery();
        await ctx.reply("No problem! To cancel an appointment, just tell me the appointment ID.\n\nFor example: `cancel 12`\n\nType `/appointments` to see your appointment IDs! ", { parse_mode: 'Markdown' });
        break;
        
      case 'support':
        await ctx.answerCbQuery();
        // Call the support command handler
        supportSessions.set(userId, {
          step: 'category',
          data: {}
        });
        
        await ctx.reply(`Hi there! I'm here to help you. Let me ask you a few questions to understand how I can best assist you. 😊\n\nWhat's bothering you today? You can tell me about:\n\n• Problems with the app or website\n• School work or grades\n• Personal issues or stress\n• Any other concerns\n\nJust tell me what's on your mind - I'm listening! `);
        break;
        
      default:
        await ctx.answerCbQuery("Sorry, I didn't understand that option.");
    }
  } catch (error) {
    console.error('Error handling callback query:', error);
    await ctx.answerCbQuery("Sorry, something went wrong. Please try again.");
  }
});

export default bot;
import pool from './src/db/pool.js';
import { broadcastMessage } from './src/bot.js';

async function testCounselorDM() {
  try {
    console.log('🧪 Testing counselor-student DM functionality...\n');
    
    // Get the latest support ticket
    const ticketResult = await pool.query(
      'SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 1'
    );
    
    if (ticketResult.rows.length === 0) {
      console.log('❌ No support tickets found');
      return;
    }
    
    const ticket = ticketResult.rows[0];
    console.log('📋 Testing with ticket:', {
      id: ticket.id,
      student: ticket.telegram_username,
      description: ticket.description.substring(0, 50) + '...'
    });
    
    // Simulate a counselor reply
    const counselorReply = `Hello ${ticket.telegram_username || 'there'}! 

I've received your support ticket #${ticket.id} about your situation. I want you to know that you're not alone, and I'm here to help you through this difficult time.

What you're experiencing is serious, and I want to make sure you get the support you need. Can you tell me more about your current situation and what specific help you're looking for?

Please know that everything we discuss is confidential, and I'm here to listen and support you.

Best regards,
Counselor`;

    // Add the reply to the database
    const messageResult = await pool.query(
      `INSERT INTO support_messages (ticket_id, sender_type, sender_id, message, is_internal)
       VALUES ($1, 'counselor', $2, $3, false)
       RETURNING *`,
      [ticket.id, 1, counselorReply] // counselor_id = 1
    );
    
    console.log('✅ Counselor reply added to database:', messageResult.rows[0].id);
    
    // Update ticket status
    await pool.query(
      "UPDATE support_tickets SET status = 'replied', updated_at = NOW() WHERE id = $1",
      [ticket.id]
    );
    
    console.log('✅ Ticket status updated to "replied"');
    
    // Send DM to the student
    const dmMessage = `Reply from Counselor (Ticket #${ticket.id}):\n\n${counselorReply}\n\nDid this help you? Type "satisfied ${ticket.id}" if yes, or "not satisfied ${ticket.id}" if you need more help.\n\nYou can also just reply naturally - I'll understand and add it to your ticket!`;
    
    const broadcastResult = await broadcastMessage(dmMessage);
    
    console.log('📱 DM sent to student:', {
      total_users: broadcastResult.totalUsers,
      sent_successfully: broadcastResult.sentCount,
      failed: broadcastResult.failedCount
    });
    
    console.log('\n✅ Counselor-student DM test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing counselor DM:', error.message);
  }
}

testCounselorDM();

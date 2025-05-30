/**
 * Firebase Cloud Functions for comment notifications
 * 
 * This file contains two main functions:
 * 1. sendNewCommentNotification - Sends an email to the admin for any new comment
 * 2. sendReplyNotification - Sends an email to the original commenter when someone replies
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Email transport configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-service-account@gmail.com', // Replace with your service account email
    pass: 'your-app-password' // Replace with your app password
  }
});

/**
 * Cloud Function to send notification emails to admin for new comments
 */
exports.sendNewCommentNotification = functions.database.ref('/comments/{commentId}')
  .onCreate(async (snapshot, context) => {
    const comment = snapshot.val();
    
    // Get comment data
    const commentId = context.params.commentId;
    const pageUrl = comment.pageUrl || 'Unknown Page';
    const author = comment.author || 'Anonymous';
    const content = comment.content || 'No content';
    const createdAt = comment.created_at || new Date().toISOString();
    
    // Check if it's a reply to another comment
    let parentCommentInfo = '';
    if (comment.parent_id) {
      const parentCommentSnapshot = await admin.database().ref(`/comments/${comment.parent_id}`).once('value');
      const parentComment = parentCommentSnapshot.val();
      
      if (parentComment) {
        parentCommentInfo = `
        <div style="margin-left: 20px; padding-left: 10px; border-left: 2px solid #ccc;">
          <p><strong>원본 댓글:</strong></p>
          <p><strong>작성자:</strong> ${parentComment.author}</p>
          <p><strong>내용:</strong> ${parentComment.content}</p>
          <p><strong>작성 시간:</strong> ${parentComment.created_at}</p>
        </div>`;
      }
    }
    
    // Prepare email content
    const mailOptions = {
      from: '"Blog Comment Notification" <your-service-account@gmail.com>',
      to: 'fromsnowman14@gmail.com', // Admin email address
      subject: `새 댓글 알림: ${author}가 댓글을 남기셨습니다`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>새로운 댓글이 작성되었습니다</h2>
          <p><strong>페이지:</strong> <a href="${pageUrl}">${pageUrl}</a></p>
          <p><strong>작성자:</strong> ${author}</p>
          <p><strong>내용:</strong> ${content}</p>
          <p><strong>작성 시간:</strong> ${createdAt}</p>
          <p><strong>댓글 ID:</strong> ${commentId}</p>
          ${parentCommentInfo}
          <p>
            <a href="${pageUrl}" style="display: inline-block; padding: 10px 15px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 4px;">댓글 확인하기</a>
          </p>
        </div>
      `
    };
    
    // Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log('New comment notification email sent successfully');
      return null;
    } catch (error) {
      console.error('Error sending email:', error);
      return null;
    }
  });

/**
 * Cloud Function to send notification emails to commenters when someone replies to their comment
 */
exports.sendReplyNotification = functions.database.ref('/comments/{commentId}')
  .onCreate(async (snapshot, context) => {
    const reply = snapshot.val();
    
    // Only process if this is a reply to another comment
    if (!reply.parent_id) return null;
    
    // Get parent comment data
    const parentCommentSnapshot = await admin.database().ref(`/comments/${reply.parent_id}`).once('value');
    const parentComment = parentCommentSnapshot.val();
    
    // Only send notification if parent comment exists and has an email
    if (!parentComment || !parentComment.email) return null;
    
    // Prepare email content
    const mailOptions = {
      from: '"Blog Comment Notification" <your-service-account@gmail.com>',
      to: parentComment.email,
      subject: `답글 알림: ${reply.author}가 회원님의 댓글에 답글을 남기셨습니다`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>회원님의 댓글에 새로운 답글이 작성되었습니다</h2>
          <p><strong>답글 작성자:</strong> ${reply.author}</p>
          <p><strong>답글 내용:</strong> ${reply.content}</p>
          <p><strong>작성 시간:</strong> ${reply.created_at}</p>
          <div style="margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-left: 4px solid #ccc;">
            <p><strong>회원님의 원본 댓글:</strong></p>
            <p>${parentComment.content}</p>
          </div>
          <p>
            <a href="${reply.pageUrl || '#'}" style="display: inline-block; padding: 10px 15px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 4px;">댓글 확인하기</a>
          </p>
          <p style="font-size: 12px; color: #666; margin-top: 30px;">
            이 이메일은 회원님의 댓글에 답글이 달렸을 때 자동으로 전송됩니다.<br>
            더 이상 알림을 받고 싶지 않으시면 댓글 작성 시 이메일 정보를 입력하지 않으시면 됩니다.
          </p>
        </div>
      `
    };
    
    // Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log('Reply notification email sent successfully');
      return null;
    } catch (error) {
      console.error('Error sending reply notification email:', error);
      return null;
    }
  });
